-- =====================================================================
--  Smurfit Class Hub · database setup for Supabase
--  Paste this whole file into Supabase → SQL Editor → New query → Run.
--  Safe to run again: it updates things in place.
--
--  Owner: paarthan.chandrasekaran@ucdconnect.ie
-- =====================================================================

-- ---------- 1. Settings: who owns the hub ----------
create table if not exists public.hub_settings (key text primary key, value text not null);
alter table public.hub_settings enable row level security;   -- no policies: only server functions can read it

insert into public.hub_settings (key, value)
values ('owner_email', lower('paarthan.chandrasekaran@ucdconnect.ie'))   -- the hub owner (Developer badge)
on conflict (key) do update set value = excluded.value;

-- ---------- 2. One table holds everything the app stores ----------
-- col = collection (posts, messages, hangouts, games, members, config, bans, roster)
create table if not exists public.docs (
  col        text        not null,
  id         text        not null,
  data       jsonb       not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (col, id),
  constraint docs_data_is_object check (jsonb_typeof(data) = 'object'),
  constraint docs_data_size check (pg_column_size(data) < 200000)
);
create index if not exists docs_col_author  on public.docs (col, (data->>'authorId'));
alter table public.docs enable row level security;
alter table public.docs replica identity full;

-- ---------- 3. Helper functions (run with admin rights, so they can check roles safely) ----------
create or replace function public.hub_my_email() returns text
language sql stable security definer set search_path = public as $$
  select lower(coalesce(auth.jwt()->>'email', ''))
$$;

create or replace function public.hub_owner_email() returns text
language sql stable security definer set search_path = public as $$
  select value from public.hub_settings where key = 'owner_email'
$$;

create or replace function public.hub_is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and public.hub_my_email() = public.hub_owner_email()
$$;

create or replace function public.hub_owner_uid() returns text
language sql stable security definer set search_path = public as $$
  select data->>'ownerId' from public.docs where col = 'config' and id = 'roles'
$$;

create or replace function public.hub_is_banned(uid text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.docs where col = 'bans' and id = uid)
$$;

create or replace function public.hub_is_amb(uid text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select data->'ambassadors' ? uid from public.docs where col = 'config' and id = 'roles'), false)
$$;

create or replace function public.hub_email_ok(email text) returns boolean
language sql stable security definer set search_path = public as $$
  select email like '%@ucdconnect.ie' or email like '%@ucd.ie' or email = public.hub_owner_email()
$$;

-- signed in with a UCD email (or the owner) and not removed from the hub
create or replace function public.hub_allowed() returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null
     and public.hub_email_ok(public.hub_my_email())
     and not public.hub_is_banned(auth.uid()::text)
$$;

create or replace function public.hub_is_mod() returns boolean
language sql stable security definer set search_path = public as $$
  select public.hub_is_owner() or (auth.uid() is not null and public.hub_is_amb(auth.uid()::text))
$$;

-- top-level keys whose values differ between two objects
create or replace function public.hub_changed_keys(a jsonb, b jsonb) returns text[]
language sql immutable as $$
  select coalesce(array_agg(k), '{}') from (
    select k from jsonb_object_keys(coalesce(a, '{}'::jsonb) || coalesce(b, '{}'::jsonb)) as k
    where (a->k) is distinct from (b->k)
  ) s
$$;

-- deep merge: nested objects merge, everything else is replaced (used for votes, RSVPs, game moves)
create or replace function public.hub_deep_merge(a jsonb, b jsonb) returns jsonb
language plpgsql immutable as $$
declare k text; v jsonb; result jsonb := coalesce(a, '{}'::jsonb);
begin
  if jsonb_typeof(a) is distinct from 'object' or jsonb_typeof(b) is distinct from 'object' then return b; end if;
  for k, v in select * from jsonb_each(b) loop
    if jsonb_typeof(result->k) = 'object' and jsonb_typeof(v) = 'object' then
      result := jsonb_set(result, array[k], public.hub_deep_merge(result->k, v));
    else
      result := jsonb_set(result, array[k], v);
    end if;
  end loop;
  return result;
end $$;

-- ---------- 4. Who can see what (row level security) ----------
grant select, insert, update, delete on public.docs to authenticated;
grant execute on function public.hub_allowed(), public.hub_is_mod(), public.hub_is_owner(), public.hub_my_email() to authenticated;
drop policy if exists hub_read on public.docs;
create policy hub_read on public.docs for select to authenticated
  using ((select public.hub_allowed()) or (col = 'bans' and id = (select auth.uid())::text));

drop policy if exists hub_insert on public.docs;
create policy hub_insert on public.docs for insert to authenticated with check ((select public.hub_allowed()));

drop policy if exists hub_update on public.docs;
create policy hub_update on public.docs for update to authenticated
  using ((select public.hub_allowed())) with check ((select public.hub_allowed()));

drop policy if exists hub_delete on public.docs;
create policy hub_delete on public.docs for delete to authenticated using ((select public.hub_allowed()));

-- ---------- 5. The rules: checked on every change, on the server ----------
create or replace function public.hub_guard() returns trigger
language plpgsql security invoker set search_path = public as $$
declare
  uid   text := auth.uid()::text;
  mod   boolean := public.hub_is_mod();
  own   boolean := public.hub_is_owner();
  c     text;
  nd    jsonb;
  od    jsonb;
  ch    text[];
  f     text;
begin
  if tg_op = 'DELETE' then c := old.col; else c := new.col; nd := new.data; end if;
  if tg_op <> 'INSERT' then od := old.data; end if;
  if auth.uid() is null then return coalesce(new, old); end if;          -- dashboard / admin edits
  if tg_op = 'UPDATE' and (new.col <> old.col or new.id <> old.id) then raise exception 'not_allowed: ids are fixed'; end if;
  if tg_op <> 'DELETE' then new.updated_at := now(); end if;
  ch := case when tg_op = 'UPDATE' then public.hub_changed_keys(od, nd) else '{}' end;

  if c = 'posts' then
    if tg_op = 'INSERT' then
      if nd->>'authorId' is distinct from uid then raise exception 'not_allowed: post as yourself'; end if;
      if coalesce((nd->>'pinned')::boolean, false) and not mod then raise exception 'not_allowed: only ambassadors pin'; end if;
    elsif tg_op = 'UPDATE' then
      if (nd->>'authorId') is distinct from (od->>'authorId') then raise exception 'not_allowed: author is fixed'; end if;
      if ch <@ array['pinned','updatedAt'] then
        if not mod then raise exception 'not_allowed: only ambassadors pin'; end if;
      else
        if not (mod or od->>'authorId' = uid) then raise exception 'not_allowed: not your post'; end if;
        if nd->>'editedBy' is distinct from uid then raise exception 'not_allowed: edits must be signed'; end if;
        if not mod and (nd->'pinned') is distinct from (od->'pinned') then raise exception 'not_allowed: only ambassadors pin'; end if;
      end if;
    else
      if not (mod or od->>'authorId' = uid) then raise exception 'not_allowed: not your post'; end if;
    end if;

  elsif c = 'hangouts' then
    if tg_op = 'UPDATE' and coalesce((od->>'closed')::boolean, false) and coalesce((nd->>'closed')::boolean, false)
       and (nd->'votes') is distinct from (od->'votes') then raise exception 'not_allowed: poll is closed'; end if;
    if tg_op = 'INSERT' then
      if nd->>'authorId' is distinct from uid then raise exception 'not_allowed: post as yourself'; end if;
    elsif tg_op = 'UPDATE' then
      if not (mod or od->>'authorId' = uid) then
        if not (ch <@ array['going','votes']) then raise exception 'not_allowed: you can only RSVP or vote'; end if;
        if coalesce((od->>'closed')::boolean, false) then raise exception 'not_allowed: poll is closed'; end if;
        foreach f in array array['going','votes'] loop
          if not (public.hub_changed_keys(od->f, nd->f) <@ array[uid]) then raise exception 'not_allowed: only your own RSVP or vote'; end if;
        end loop;
      end if;
    else
      if not (mod or od->>'authorId' = uid) then raise exception 'not_allowed: not yours'; end if;
    end if;

  elsif c = 'messages' then
    if tg_op = 'INSERT' then
      if nd->>'authorId' is distinct from uid then raise exception 'not_allowed: post as yourself'; end if;
      if length(coalesce(nd->>'text', '')) > 2000 then raise exception 'not_allowed: message too long'; end if;
    elsif tg_op = 'UPDATE' then
      if not (mod or od->>'authorId' = uid) then raise exception 'not_allowed: not your message'; end if;
      if not (ch <@ array['text','editedBy','editedAt']) then raise exception 'not_allowed: only the text can change'; end if;
      if nd->>'editedBy' is distinct from uid then raise exception 'not_allowed: edits must be signed'; end if;
      if length(coalesce(nd->>'text', '')) > 2000 then raise exception 'not_allowed: message too long'; end if;
    else
      if not (mod or od->>'authorId' = uid) then raise exception 'not_allowed: not your message'; end if;
    end if;

  elsif c = 'members' then
    if tg_op = 'INSERT' then
      if new.id <> uid then raise exception 'not_allowed: only your own profile'; end if;
      if nd->>'email' is distinct from public.hub_my_email() then raise exception 'not_allowed: email must be your sign-in email'; end if;
      if length(coalesce(nd->>'displayName', '')) not between 2 and 60 then raise exception 'not_allowed: name needed'; end if;
    elsif tg_op = 'UPDATE' then
      if new.id = uid and not mod then
        if (nd->'displayName') is distinct from (od->'displayName') or (nd->'email') is distinct from (od->'email') then
          raise exception 'not_allowed: names are locked, ask an ambassador';
        end if;
      elsif new.id <> uid then
        if not mod or not (ch <@ array['displayName']) then raise exception 'not_allowed: not your profile'; end if;
      end if;
      if (nd->'email') is distinct from (od->'email') then raise exception 'not_allowed: email is fixed'; end if;
    else
      if old.id <> uid and not own then raise exception 'not_allowed: not your profile'; end if;
    end if;

  elsif c = 'roster' then
    if not mod then raise exception 'not_allowed: ambassadors only'; end if;

  elsif c = 'config' then
    if not own then raise exception 'not_allowed: owner only'; end if;
    if tg_op <> 'DELETE' then
      if jsonb_array_length(coalesce(nd->'ambassadors', '[]'::jsonb)) > 5 then raise exception 'not_allowed: max 5 ambassadors'; end if;
      if nd->>'ownerId' is distinct from uid then raise exception 'not_allowed: owner id must be yours'; end if;
    end if;

  elsif c = 'bans' then
    if not mod then raise exception 'not_allowed: ambassadors only'; end if;
    if tg_op <> 'DELETE' then
      if new.id = uid then raise exception 'not_allowed: you cannot remove yourself'; end if;
      if new.id = public.hub_owner_uid() then raise exception 'not_allowed: the developer cannot be removed'; end if;
      if not own and public.hub_is_amb(new.id) then raise exception 'not_allowed: ambassadors cannot remove each other'; end if;
    end if;

  elsif c = 'games' then
    if tg_op = 'INSERT' and nd->>'createdBy' is distinct from uid then raise exception 'not_allowed: start games as yourself'; end if;
    if tg_op = 'DELETE' and not (mod or od->>'createdBy' = uid) then raise exception 'not_allowed: not your game'; end if;

  else
    raise exception 'not_allowed: unknown collection %', c;
  end if;

  return coalesce(new, old);
end $$;

drop trigger if exists hub_guard on public.docs;
create trigger hub_guard before insert or update or delete on public.docs
  for each row execute function public.hub_guard();

-- ---------- 6. Atomic "merge into a document" (votes, RSVPs and game moves from many people at once) ----------
create or replace function public.doc_merge(p_col text, p_id text, p_patch jsonb) returns void
language plpgsql security invoker set search_path = public as $$
begin
  update public.docs set data = public.hub_deep_merge(data, p_patch) where col = p_col and id = p_id;
  if not found then raise exception 'not_found'; end if;
end $$;

grant execute on function public.doc_merge(text, text, jsonb) to authenticated;

-- ---------- 7. Only UCD emails (and the owner) can create an account ----------
create or replace function public.hub_ucd_only() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.hub_email_ok(lower(coalesce(new.email, ''))) then
    raise exception 'Only UCD email addresses can join this hub';
  end if;
  return new;
end $$;
drop trigger if exists hub_ucd_only on auth.users;
create trigger hub_ucd_only before insert on auth.users for each row execute function public.hub_ucd_only();

-- ---------- 8. Storage meter for the owner ----------
create or replace function public.hub_storage() returns bigint
language sql stable security definer set search_path = public as $$
  select case when public.hub_is_owner() then pg_database_size(current_database()) else null end
$$;

grant execute on function public.hub_storage() to authenticated;

-- ---------- 9. Live updates ----------
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- ---------- 10. Automatic cleanup (keeps the database small) ----------
create or replace function public.hub_cleanup() returns void
language sql security definer set search_path = public as $$
  -- finished or idle games after 30 days
  delete from public.docs where col = 'games'
    and coalesce((data->>'updatedAt')::bigint, 0) < (extract(epoch from now() - interval '30 days') * 1000);
  -- chat older than 150 days (about a semester)
  delete from public.docs where col = 'messages'
    and coalesce((data->>'createdAt')::bigint, 0) < (extract(epoch from now() - interval '150 days') * 1000);
  -- study sessions and outings more than 60 days in the past
  delete from public.docs where col = 'hangouts' and data->>'kind' <> 'poll'
    and (data->>'date') < to_char(now() - interval '60 days', 'YYYY-MM-DD');
$$;

do $$ begin
  create extension if not exists pg_cron;
  perform cron.schedule('hub-cleanup', '30 4 * * *', 'select public.hub_cleanup()');
exception when others then
  raise notice 'Automatic cleanup not scheduled (%). You can run "select public.hub_cleanup();" now and then instead.', sqlerrm;
end $$;

-- Done. Check: select * from public.hub_settings;
