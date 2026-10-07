/*
  Backend adapter for the Class Hub.
  The app talks to window.HUB.use("db") / use("user"). This file provides those
  either from Supabase (live, shared by the whole class) or from a local demo store (this browser only).
*/
(function () {
  const CFG = window.HUB_CONFIG || {};
  const LIVE = !!(CFG.supabase && /^https:\/\/.+\.supabase\.co/.test(CFG.supabase.url || "") && CFG.supabase.key);
  window.HUB_MODE = LIVE ? "live" : "demo";
  const ownerEmails = (CFG.ownerEmails || []).map(e => String(e).toLowerCase());
  const domains = (CFG.allowedDomains || []).map(d => String(d).toLowerCase());

  /* ---------- avatars: initials on a stable colour ---------- */
  const PALETTE = ["#1846D8", "#E2405F", "#0C9A6A", "#E07F00", "#7A4DD8", "#0A88B5", "#D63E8E", "#E8620C"];
  function initialsAvatar(name, seed) {
    const parts = String(name || "?").trim().split(/\s+/);
    const ini = ((parts[0] || "?")[0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase().replace(/[^A-Z0-9]/g, "") || "?";
    let h = 0; for (const c of String(seed || name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const col = PALETTE[h % PALETTE.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${col}"/><text x="32" y="41" font-family="Arial,sans-serif" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">${ini}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* ---------- people directory (from the members collection) ---------- */
  const people = {};
  function profileFor(id) {
    const m = people[id] || {};
    const name = m.displayName || "";
    return { id, name, avatarUrl: m.photo || initialsAvatar(name || "?", id), color: "#6C3CF0", email: m.email || null, isMe: id === state.uid, guest: false };
  }
  const state = { uid: null, email: "", owner: false };
  const userApi = {
    id: async () => state.uid,
    isOwner: async () => state.owner,
    canEdit: async () => state.owner,
    can: async () => true,
    me: async () => Object.assign(profileFor(state.uid), { isOwner: state.owner, canEdit: state.owner }),
    profiles: async ids => { const out = {}; [].concat(ids).forEach(i => { out[i] = profileFor(i) }); return out; },
    name: async () => profileFor(state.uid).name,
    search: async () => []
  };

  let resolveReady; const ready = new Promise(r => resolveReady = r);
  let dbApi = null;
  window.HUB = { use: async name => { await ready; return name === "db" ? dbApi : name === "user" ? userApi : null; } };

  /* =====================================================================
     DEMO MODE — a small document store kept in this browser
     ===================================================================== */
  function startDemo() {
    const KEY = "hub.demo.v2";
    let data = {};
    try { data = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { data = {}; }
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };
    const subs = new Set();
    const clone = v => JSON.parse(JSON.stringify(v));
    const fire = () => setTimeout(() => subs.forEach(f => f()), 0);
    let n = Date.now();
    const newId = () => "d" + (n++).toString(36) + Math.random().toString(36).slice(2, 6);
    const merge = (a, b) => { for (const k in b) { const v = b[k]; if (v && typeof v === "object" && !Array.isArray(v) && a[k] && typeof a[k] === "object" && !Array.isArray(a[k])) merge(a[k], v); else a[k] = clone(v); } return a; };
    const snapDoc = (p) => ({ id: p.split("/").pop(), exists: !!data[p], data: () => data[p] ? clone(data[p]) : undefined, metadata: { fromCache: false, hasPendingWrites: false } });
    function query(col, filters) {
      const q = {
        where: (f, op, v) => query(col, Object.assign({}, filters, { where: (filters.where || []).concat([[f, op, v]]) })),
        orderBy: (f, dir) => query(col, Object.assign({}, filters, { order: [f, dir || "asc"] })),
        limit: k => query(col, Object.assign({}, filters, { limit: k })),
        run() {
          let docs = Object.keys(data).filter(k => k.slice(0, k.lastIndexOf("/")) === col).map(snapDoc);
          (filters.where || []).forEach(([f, op, v]) => { docs = docs.filter(d => { const x = d.data()[f]; return op === "==" ? x === v : op === "!=" ? x !== v : op === "<" ? x < v : op === "<=" ? x <= v : op === ">" ? x > v : op === ">=" ? x >= v : op === "in" ? v.includes(x) : true; }); });
          if (filters.order) { const [f, d] = filters.order; docs.sort((a, b) => { const x = a.data()[f], y = b.data()[f]; return (x > y ? 1 : x < y ? -1 : 0) * (d === "desc" ? -1 : 1); }); }
          if (filters.limit) docs = docs.slice(0, filters.limit);
          return { docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } };
        },
        get: async () => q.run(),
        onSnapshot(next) { const f = () => next(q.run()); subs.add(f); setTimeout(f, 0); return () => subs.delete(f); }
      };
      return q;
    }
    function docRef(p) {
      return {
        id: p.split("/").pop(), path: p,
        get: async () => snapDoc(p),
        set: async d => { data[p] = clone(d); save(); fire(); },
        update: async d => { if (!data[p]) throw { code: "invalid_argument", message: "missing" }; merge(data[p], d); save(); fire(); },
        delete: async () => { delete data[p]; save(); fire(); },
        onSnapshot(next) { const f = () => next(snapDoc(p)); subs.add(f); setTimeout(f, 0); return () => subs.delete(f); },
        collection: c => colRef(p + "/" + c)
      };
    }
    function colRef(c) {
      const q = query(c, {});
      q.path = c; q.doc = id => docRef(c + "/" + (id || newId()));
      q.add = async d => { const r = q.doc(); await r.set(d); return r; };
      return q;
    }
    if (!data["config/roles"]) seedDemo(data);
    save();
    dbApi = { doc: docRef, collection: colRef };
    state.uid = "u_you"; state.owner = true; state.email = "you@ucdconnect.ie";
    const syncPeople = () => Object.keys(data).filter(k => k.startsWith("members/")).forEach(k => { people[k.slice(8)] = data[k]; });
    syncPeople(); subs.add(syncPeople);
    window.hubAuth = {
      mode: "demo", email: state.email,
      reset: () => { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); }
    };
    resolveReady();
  }

  function seedDemo(d) {
    const day = n => { const x = new Date(); x.setDate(x.getDate() + n); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
    const now = Date.now(), H = 36e5, hm = h => { const x = new Date(now + h * H); return String(x.getHours()).padStart(2, "0") + ":" + String(x.getMinutes()).padStart(2, "0"); };
    const ppl = { u_aoife: ["Aoife Byrne", "aoife.byrne@demo.example"], u_cian: ["Cian Murphy", "cian.murphy@demo.example"], u_priya: ["Priya Sharma", "priya.sharma@demo.example"],
      u_tom: ["Tom Walsh", "tom.walsh@demo.example"], u_sinead: ["Sinéad Kelly", "sinead.kelly@demo.example"] };
    d["members/u_you"] = { joinedAt: now - 9 * 864e5, displayName: "You (demo)", email: "you@demo.example", photo: "" };
    Object.entries(ppl).forEach(([id, [displayName, email]], i) => { d["members/" + id] = { joinedAt: now - (8 - i) * 864e5, displayName, email, photo: "" }; });
    d["config/roles"] = { ownerId: "u_you", ambassadors: ["u_aoife"], policy: { assignment: "ambassadors", exam: "ambassadors", update: "ambassadors", event: "everyone", job: "everyone" }, updatedAt: now };
    const P = (id, o) => { d["posts/" + id] = Object.assign({ start: null, end: null, time: null, tag: "", link: "", body: "", subject: "", createdAt: now - 2 * H }, o); };
    P("p1", { type: "assignment", subject: "MIS41150 Introduction to Business Analytics", title: "Group report (demo)", start: day(-4), end: day(9), time: "17:00", tag: "Brightspace", body: "Example assignment. Bars run from release to due date.", authorId: "u_aoife", createdAt: now - 3 * 864e5 });
    P("p2", { type: "assignment", subject: "MIS41110 Programming for Analytics", title: "Python problem set (demo)", start: day(0), end: day(4), time: "23:59", tag: "Brightspace", authorId: "u_aoife", createdAt: now - 864e5 });
    P("p3", { type: "exam", subject: "MIS41110 Programming for Analytics", title: "In-class quiz (demo)", start: day(6), end: day(6), time: "10:00", tag: "Lecture hall", authorId: "u_aoife" });
    P("p4", { type: "event", title: "Class social (demo)", start: day(2), end: day(2), time: "19:00", tag: "Ranelagh", body: "Example event.", authorId: "u_cian" });
    P("p5", { type: "event", title: "Careers fair (demo)", start: day(12), end: day(13), tag: "Smurfit atrium", authorId: "u_priya" });
    P("p6", { type: "job", title: "Graduate analytics programme (demo)", start: day(-5), end: day(15), tag: "Example Company", body: "Example job post. Bars run from opening to closing date.", authorId: "u_priya", createdAt: now - 5 * H });
    P("p7", { type: "update", title: "Welcome to the demo hub", body: "Everything here is sample data stored only on this device. Try adding a deadline, joining a study session or starting a game.", pinned: true, authorId: "u_aoife", createdAt: now - 6 * H });
    P("p8", { type: "update", subject: "MIS41110 Programming for Analytics", title: "Lab moved to the computer room (demo)", tag: "Computer lab", authorId: "u_aoife", createdAt: now - 26 * H });
    d["hangouts/h1"] = { kind: "study", title: "Python revision (demo)", where: "James Joyce Library, level 2", date: day(0), time: hm(-1), until: hm(2), cap: 6, body: "Going through the problem set.", going: { u_cian: now - H, u_priya: now - 30 * 6e4 }, authorId: "u_cian", createdAt: now - H };
    d["hangouts/h2"] = { kind: "outing", title: "Coffee after the lecture (demo)", where: "Campus café", date: day(1), time: "13:00", until: null, cap: null, body: "", going: { u_tom: now - 2 * H, u_sinead: now - H }, authorId: "u_tom", createdAt: now - 2 * H };
    d["hangouts/h3"] = { kind: "poll", title: "Best night for the class social? (demo)", options: ["Thursday", "Friday", "Saturday"], votes: { u_aoife: 1, u_cian: 1, u_priya: 0, u_tom: 1 }, closed: false, authorId: "u_cian", createdAt: now - 3 * H };
    const M = (id, ch, who, text, ago) => { d["messages/" + id] = { channel: ch, authorId: who, text, createdAt: now - ago }; };
    M("m1", "general", "u_aoife", "Hi all! This is the demo chat.", 5 * H);
    M("m2", "general", "u_cian", "Anyone at the library this afternoon?", 2 * H);
    M("m3", "jobs", "u_priya", "Posted a grad programme in Jobs, closes in two weeks.", 4 * H);
    d["games/g1"] = { kind: "wyr", createdBy: "u_tom", createdAt: now - H, updatedAt: now - 10 * 6e4, seed: 3, round: 1, players: { u_tom: now - H, u_sinead: now - 50 * 6e4 }, votes: { r1: { u_tom: "a", u_sinead: "b" } } };
  }

  /* =====================================================================
     LIVE MODE — Supabase: UCD email-code sign-in + live shared database
     ===================================================================== */
  const SB_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js";
  const loadScript = src => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Couldn't load " + src)); document.head.appendChild(s); });
  const emailOk = e => { e = (e || "").toLowerCase().trim(); return ownerEmails.includes(e) || domains.some(d => e.endsWith("@" + d)); };
  const escH = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Real name from a UCD address: "paarthan.chandrasekaran@…" → "Paarthan Chandrasekaran"
  function nameFromEmail(email) {
    const local = String(email || "").split("@")[0];
    const parts = local.split(/[._-]+/).map(p => p.replace(/[^a-zà-ÿ']/gi, "")).filter(Boolean);
    if (parts.length < 2 || parts[0].length < 2) return "";
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
  }

  function gate(html) {
    let g = document.getElementById("hub-gate");
    if (!g) { g = document.createElement("div"); g.id = "hub-gate"; document.body.appendChild(g); }
    g.innerHTML = `<div class="gate-card"><span class="gate-eyebrow">UCD Smurfit</span><h1>Class <span>Hub</span></h1><span class="gate-prog">MSc Business Analytics</span>${html}</div>`;
    g.hidden = false; return g;
  }
  const closeGate = () => { const g = document.getElementById("hub-gate"); if (g) g.hidden = true; };

  // This file runs in <head>, before the page body exists: wait for it before drawing anything.
  const domReady = () => document.body ? Promise.resolve() : new Promise(r => document.addEventListener("DOMContentLoaded", r, { once: true }));

  async function startLive() {
    try { await startLiveInner(); }
    catch (e) {
      console.error("Class Hub failed to start", e);
      await domReady();
      const g = gate(`<p>Something went wrong starting the hub.</p><p class="gate-err">${escH((e && e.message) || e)}</p><button type="button" class="gate-btn" id="gate-retry">Try again</button>`);
      g.querySelector("#gate-retry").addEventListener("click", () => location.reload());
    }
  }
  async function startLiveInner() {
    await domReady();
    gate(`<p class="gate-note">Loading…</p>`);
    try { await loadScript(SB_JS); }
    catch (e) { gate(`<p>Couldn't reach the class hub. Check your connection and reload.</p>`); return; }
    if (!window.supabase || !window.supabase.createClient) throw new Error("The sign-in library didn't load");
    const sb = window.supabase.createClient(CFG.supabase.url, CFG.supabase.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
    window.__hubSupabase = sb;

    const { data: { session } } = await sb.auth.getSession();
    if (session && session.user) return afterSignIn(sb, session.user);
    showEmailStep(sb);
    sb.auth.onAuthStateChange((ev, sess) => { if (ev === "SIGNED_IN" && sess && !state.uid) afterSignIn(sb, sess.user); });
  }

  function showEmailStep(sb, msg, prefill) {
    const g = gate(`<p>Deadlines, exams, events, jobs, study sessions, polls and games for the class.</p>
      <form id="gate-email-form" class="gate-form" novalidate>
        <label for="gate-email">Your UCD email</label>
        <input id="gate-email" class="gate-input" type="email" inputmode="email" autocomplete="email" placeholder="firstname.lastname@ucdconnect.ie" value="${escH(prefill || "")}" required>
        <button type="submit" class="gate-btn" id="gate-send">Send my sign-in code</button>
      </form>
      <p class="gate-note">We'll email you a 6-digit code. No passwords, no UCD login screens. You stay signed in on this device.</p>
      <p class="gate-err" id="gate-err">${escH(msg || "")}</p>`);
    const form = g.querySelector("#gate-email-form"), input = g.querySelector("#gate-email"), err = g.querySelector("#gate-err"), btn = g.querySelector("#gate-send");
    setTimeout(() => input.focus(), 50);
    form.onsubmit = async e => {
      e.preventDefault(); err.textContent = "";
      const email = input.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "That doesn't look like an email address."; return; }
      if (!emailOk(email)) { err.textContent = `Use your @${domains[0] || "ucdconnect.ie"} email. Only UCD students can join.`; return; }
      btn.disabled = true; btn.textContent = "Sending…";
      const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      btn.disabled = false; btn.textContent = "Send my sign-in code";
      if (error) {
        const m = (error.message || "").toLowerCase();
        err.textContent = /security purposes|rate|seconds/.test(m) ? "A code was just sent. Wait a minute, then try again."
          : /database error|ucd/.test(m) ? "Only UCD email addresses can join this hub."
          : "Couldn't send the code. Check the address and try again.";
        return;
      }
      showCodeStep(sb, email);
    };
  }

  function showCodeStep(sb, email) {
    const g = gate(`<p>We sent a code to <b>${escH(email)}</b>. It can take a minute, and check Junk if it's not there.</p>
      <form id="gate-code-form" class="gate-form" novalidate>
        <label for="gate-code">Sign-in code</label>
        <input id="gate-code" class="gate-input gate-code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="10" placeholder="123456" required>
        <button type="submit" class="gate-btn" id="gate-verify">Sign in</button>
      </form>
      <div class="gate-links"><button type="button" id="gate-resend" disabled>Resend code (60s)</button><button type="button" id="gate-change">Use a different email</button></div>
      <p class="gate-err" id="gate-err"></p>`);
    const input = g.querySelector("#gate-code"), err = g.querySelector("#gate-err"), btn = g.querySelector("#gate-verify"), resend = g.querySelector("#gate-resend");
    setTimeout(() => input.focus(), 50);
    let left = 60; const t = setInterval(() => { left--; resend.textContent = left > 0 ? `Resend code (${left}s)` : "Resend code"; resend.disabled = left > 0; if (left <= 0) clearInterval(t); }, 1000);
    g.querySelector("#gate-change").onclick = () => { clearInterval(t); showEmailStep(sb, "", email); };
    resend.onclick = async () => { resend.disabled = true; const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } }); err.textContent = error ? "Couldn't resend yet. Try again in a minute." : "New code sent."; left = 60; };
    input.oninput = () => { input.value = input.value.replace(/\D/g, ""); if (input.value.length === 6) g.querySelector("#gate-code-form").requestSubmit(); };
    g.querySelector("#gate-code-form").onsubmit = async e => {
      e.preventDefault(); err.textContent = "";
      const token = input.value.trim(); if (token.length < 6) { err.textContent = "Enter the code from the email."; return; }
      btn.disabled = true; btn.textContent = "Checking…";
      const { data, error } = await sb.auth.verifyOtp({ email, token, type: "email" });
      btn.disabled = false; btn.textContent = "Sign in";
      if (error || !data || !data.user) { err.textContent = "That code didn't work. Check it, or tap Resend for a new one."; input.select(); return; }
      clearInterval(t); afterSignIn(sb, data.user);
    };
  }

  function askName(email) {
    return new Promise(resolve => {
      const g = gate(`<p>One last thing: what's your full name? Classmates will see this next to your posts. It can't be changed later except by a Class Ambassador.</p>
        <form id="gate-name-form" class="gate-form" novalidate>
          <label for="gate-name">Full name</label>
          <input id="gate-name" class="gate-input" type="text" autocomplete="name" maxlength="60" placeholder="e.g. Aoife Byrne" required>
          <button type="submit" class="gate-btn">Join the hub</button>
        </form><p class="gate-err" id="gate-err"></p>`);
      const input = g.querySelector("#gate-name"); setTimeout(() => input.focus(), 50);
      g.querySelector("#gate-name-form").onsubmit = e => { e.preventDefault(); const v = input.value.trim().replace(/\s+/g, " ");
        if (v.length < 2 || !/\s/.test(v)) { g.querySelector("#gate-err").textContent = "Please enter your first and last name."; return; } resolve(v); };
    });
  }

  let started = false;
  async function afterSignIn(sb, user) {
    if (started) return; started = true;
    const email = (user.email || "").toLowerCase();
    if (!emailOk(email)) { await sb.auth.signOut(); started = false; showEmailStep(sb, "Only UCD email addresses can join this hub."); return; }
    state.uid = user.id; state.email = email; state.owner = ownerEmails.includes(email);
    dbApi = makeSupabaseDb(sb);
    try {
      const me = await dbApi.doc("members/" + user.id).get();
      if (!me.exists) {
        let name = nameFromEmail(email);
        if (!name) name = await askName(email);
        await dbApi.doc("members/" + user.id).set({ email, displayName: name, joinedAt: Date.now() });
      }
    } catch (e) {
      if (e && e.code === "permission_denied") { /* removed from the hub: the app shows the notice */ }
      else console.warn("profile setup failed", e);
    }
    dbApi.collection("members").onSnapshot(s => { s.docs.forEach(d => { people[d.id] = d.data(); }); }, () => {});
    window.hubAuth = {
      mode: "live", email,
      signOut: () => sb.auth.signOut().then(() => location.reload()),
      storage: async () => { const { data, error } = await sb.rpc("hub_storage"); return error ? null : data; }
    };
    sb.auth.onAuthStateChange(ev => { if (ev === "SIGNED_OUT") location.reload(); });
    closeGate(); resolveReady();
  }

  /* ---------- the database, shaped like the store the app already uses ---------- */
  function makeSupabaseDb(sb) {
    const cols = {};
    const clone = v => v == null ? v : JSON.parse(JSON.stringify(v));
    const deepMerge = (a, b) => { if (!a || typeof a !== "object" || Array.isArray(a) || !b || typeof b !== "object" || Array.isArray(b)) return clone(b);
      const out = Object.assign({}, a); for (const k in b) out[k] = (out[k] && typeof out[k] === "object" && !Array.isArray(out[k]) && b[k] && typeof b[k] === "object" && !Array.isArray(b[k])) ? deepMerge(out[k], b[k]) : clone(b[k]); return out; };
    const mapErr = e => { const m = (e && e.message) || ""; const code = e && e.code;
      if (/not_allowed|row-level security/i.test(m) || code === "42501" || code === "P0001") return { code: "permission_denied", message: m.replace(/^not_allowed:\s*/, "") };
      if (/not_found/.test(m)) return { code: "invalid_argument", message: m };
      return { code: "unavailable", message: m }; };
    const snapDoc = (id, data) => ({ id, exists: data != null, data: () => data == null ? undefined : clone(data), metadata: { fromCache: false, hasPendingWrites: false } });
    const col = n => cols[n] || (cols[n] = { rows: new Map(), loaded: false, loading: null, subs: new Set(), q: null });
    let pending = new Set(), queued = false;
    const notify = n => { pending.add(n); if (queued) return; queued = true; Promise.resolve().then(() => { queued = false; const p = [...pending]; pending.clear(); p.forEach(x => col(x).subs.forEach(f => f())); }); };
    async function load(n, q) {
      const c = col(n); let req = sb.from("docs").select("id,data").eq("col", n);
      if (q && q.order) req = req.order("data->" + q.order[0], { ascending: q.order[1] !== "desc" });
      req = req.limit((q && q.limit) || 2000);
      const { data, error } = await req; if (error) throw mapErr(error);
      c.rows = new Map(data.map(r => [r.id, r.data])); c.loaded = true; if (q) c.q = q; notify(n);
    }
    const ensure = (n, q) => { const c = col(n); if (!c.loading) c.loading = load(n, q).catch(e => { c.loading = null; throw e; }); return c.loading; };
    const resync = () => Object.keys(cols).forEach(n => { const c = cols[n]; if (c.loaded) load(n, c.q).catch(() => {}); });

    // live updates for every collection the app has open
    let wasDown = false;
    sb.channel("hub-docs").on("postgres_changes", { event: "*", schema: "public", table: "docs" }, p => {
      const row = p.eventType === "DELETE" ? p.old : p.new; if (!row || !row.col) return;
      const c = cols[row.col]; if (!c || !c.loaded) return;
      if (p.eventType === "DELETE") c.rows.delete(row.id); else c.rows.set(row.id, row.data);
      notify(row.col);
    }).subscribe(status => {
      if (status === "SUBSCRIBED") { if (wasDown) resync(); wasDown = false; }
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") wasDown = true;
    });
    window.addEventListener("online", resync);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) resync(); });

    const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    function docRef(path) {
      const [n, id] = path.split("/");
      const local = d => { const c = col(n); if (!c.loaded) return; if (d === undefined) c.rows.delete(id); else c.rows.set(id, d); notify(n); };
      return {
        id, path,
        async get() { const { data, error } = await sb.from("docs").select("data").eq("col", n).eq("id", id).maybeSingle(); if (error) throw mapErr(error); return snapDoc(id, data ? data.data : null); },
        async set(d) {
          const upd = await sb.from("docs").update({ data: d }).eq("col", n).eq("id", id).select("id");
          if (upd.error) throw mapErr(upd.error);
          if (!upd.data || !upd.data.length) { const ins = await sb.from("docs").insert({ col: n, id, data: d }); if (ins.error) throw mapErr(ins.error); }
          local(clone(d));
        },
        async update(patch) { const { error } = await sb.rpc("doc_merge", { p_col: n, p_id: id, p_patch: patch }); if (error) throw mapErr(error); const c = col(n); if (c.loaded && c.rows.has(id)) local(deepMerge(c.rows.get(id), patch)); },
        async delete() { const { error } = await sb.from("docs").delete().eq("col", n).eq("id", id); if (error) throw mapErr(error); local(undefined); },
        onSnapshot(next, err) { const c = col(n); const f = () => next(snapDoc(id, c.rows.has(id) ? c.rows.get(id) : null)); c.subs.add(f);
          ensure(n).then(f).catch(e => err && err(e)); return () => c.subs.delete(f); },
        collection() { throw new Error("Nested collections aren't used by the Class Hub"); }
      };
    }
    function query(n, f) {
      f = f || {};
      const q = {
        where: (fl, op, v) => query(n, Object.assign({}, f, { where: (f.where || []).concat([[fl, op, v]]) })),
        orderBy: (fl, dir) => query(n, Object.assign({}, f, { order: [fl, dir || "asc"] })),
        limit: k => query(n, Object.assign({}, f, { limit: k })),
        view() {
          let docs = [...col(n).rows.entries()];
          (f.where || []).forEach(([fl, op, v]) => { if (op === "==") docs = docs.filter(([, d]) => d && d[fl] === v); });
          if (f.order) { const [fl, dir] = f.order; docs.sort((a, b) => { const x = a[1][fl], y = b[1][fl]; return (x > y ? 1 : x < y ? -1 : 0) * (dir === "desc" ? -1 : 1); }); }
          if (f.limit) docs = docs.slice(0, f.limit);
          const ds = docs.map(([id, d]) => snapDoc(id, d));
          return { docs: ds, size: ds.length, empty: !ds.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } };
        },
        async get() {
          let req = sb.from("docs").select("id,data").eq("col", n);
          (f.where || []).forEach(([fl, op, v]) => { if (op === "==") req = req.eq("data->>" + fl, String(v)); });
          if (f.order) req = req.order("data->" + f.order[0], { ascending: f.order[1] !== "desc" });
          req = req.limit(f.limit || 2000);
          const { data, error } = await req; if (error) throw mapErr(error);
          const ds = data.map(r => snapDoc(r.id, r.data)); return { docs: ds, size: ds.length, empty: !ds.length, docChanges: () => [] };
        },
        onSnapshot(next, err) { const c = col(n); const fn = () => { try { next(q.view()); } catch (e) { console.error(e); } }; c.subs.add(fn);
          ensure(n, (f.order || f.limit) ? { order: f.order, limit: f.limit } : null).then(fn).catch(e => err && err(e)); return () => c.subs.delete(fn); }
      };
      return q;
    }
    function colRef(n) { const q = query(n); q.path = n; q.doc = id => docRef(n + "/" + (id || newId()));
      q.add = async d => { const id = newId(); const { error } = await sb.from("docs").insert({ col: n, id, data: d }); if (error) throw mapErr(error); const c = col(n); if (c.loaded) { c.rows.set(id, clone(d)); notify(n); } return docRef(n + "/" + id); };
      return q; }
    return { doc: docRef, collection: colRef };
  }

  if (LIVE) startLive(); else startDemo();
})();
