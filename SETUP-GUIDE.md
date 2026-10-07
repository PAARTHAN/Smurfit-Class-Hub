# Going live: Class Hub + Supabase (about 20 minutes)

Your details are already filled in:
- Project: `https://xbibcwkmejeidwigaogx.supabase.co`
- Owner (Developer badge): `paarthan.chandrasekaran@ucdconnect.ie`

Do these steps in order. Supabase sometimes renames menu items slightly; the names below are what to look for.

---

## Step 1 · Create the database (2 min)

1. Open your project at **supabase.com** → left sidebar → **SQL Editor** → **New query**.
2. Open `supabase-setup.sql` from this folder in a text editor, copy **everything**, paste it into the query box.
3. Click **Run**. You should see **"Success. No rows returned"**.
   - A note about "automatic cleanup not scheduled" is fine. It just means daily cleanup needs turning on: go to **Database → Extensions**, enable **pg_cron**, then run the file again.
4. Check it worked: run `select * from public.hub_settings;` and you should see your email.

## Step 2 · Turn on sign-in with an email code (3 min)

1. **Authentication → Sign In / Providers → Email**:
   - **Enable Email provider**: on
   - **Confirm email**: on
   - **Email OTP Length**: `6`
   - **Email OTP Expiration**: `600` seconds (10 minutes)
   - Save.
2. **Authentication → URL Configuration → Site URL**: your Vercel address, e.g. `https://ucd-msc-hub.vercel.app`. Save.

## Step 3 · Make the email show the 6-digit code (3 min)

By default Supabase emails a *link*. The app needs the *code*, so edit two templates:
**Authentication → Emails → Templates**.

**"Magic Link"** and **"Confirm signup"**: set both to:

- **Subject:** `Your Class Hub code: {{ .Token }}`
- **Body:**

```html
<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:3px solid #1A1033;border-radius:20px">
  <p style="margin:0;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#655A82">UCD Smurfit · MSc Business Analytics</p>
  <h1 style="margin:6px 0 16px;color:#1A1033">Class Hub</h1>
  <p style="font-size:16px;color:#1A1033">Your sign-in code is:</p>
  <p style="font-size:36px;font-weight:bold;letter-spacing:8px;background:#FFC21A;color:#1A1033;text-align:center;padding:12px;border-radius:14px;border:2px solid #1A1033">{{ .Token }}</p>
  <p style="font-size:14px;color:#655A82">It expires in 10 minutes. If you didn't ask for this, you can ignore this email.</p>
</div>
```

Save each one.

## Step 4 · Send the codes through Brevo (5 min)

Supabase's own email sender only allows 2 emails an hour, so connect Brevo (free).

**In Brevo:**
1. **Senders, Domains & Dedicated IPs → Senders → Add a sender**. Use the address the codes will come *from* (e.g. your Gmail) and verify it from your inbox.
2. **SMTP & API → SMTP** tab. Note the **SMTP server** (`smtp-relay.brevo.com`), **Port** (`587`) and **Login**. Click **Generate a new SMTP key** and copy it (you won't see it again).

**In Supabase:** **Authentication → Emails → SMTP Settings** → **Enable custom SMTP**:

| Field | Value |
|---|---|
| Sender email | the sender you verified in Brevo |
| Sender name | `Smurfit Class Hub` |
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | your Brevo SMTP **Login** |
| Password | the Brevo **SMTP key** |

Save. Then **Authentication → Rate Limits** → set **emails per hour** to `100`. Save.

> Codes sent from a Gmail address can land in **Junk** in UCD inboxes the first time. Tell classmates to check Junk and mark it "Not junk". Later, a cheap domain verified in Brevo fixes this for good.

## Step 5 · Deploy (2 min)

Replace the `class-hub` folder in Downloads with this one, then:

```bash
cd ~/Downloads/class-hub
npx vercel --prod
```

## Step 6 · Try it yourself first (3 min)

1. Open your Vercel link on your iPhone in Safari → **Share → Add to Home Screen** → open the app from the home screen.
2. Enter `paarthan.chandrasekaran@ucdconnect.ie` → **Send my sign-in code** → type the code.
3. You should land on Home as **Paarthan Chandrasekaran** with the **★ Developer** badge.
4. Post a test deadline, then open the app on your laptop and sign in there too. The post appears on both straight away.

## Step 7 · Invite the class

- Share the link in the class group chat. Classmates open it, enter their UCD email and type the code. That's it.
- **Class → Roles** → add up to 5 Class Ambassadors once they've signed in.

---

## If something goes wrong

| What you see | Fix |
|---|---|
| "Couldn't send the code" | Check Step 4 SMTP details and that the Brevo sender is verified. Supabase → **Authentication → Logs** shows the exact error. |
| Email arrives with a link, not a code | Step 3 templates not saved (edit **both** templates). |
| "Only UCD email addresses can join" for your own email | The email in `supabase-setup.sql` / `config.js` doesn't match what you typed. |
| Changes don't appear live on the other device | **Database → Publications → supabase_realtime** must include the `docs` table (the setup file does this). Reopen the app. |
| You see "Demo mode" | The new `config.js` wasn't deployed. Redeploy from the new folder. |

## Keeping an eye on it

- **Class → About** shows you (owner only) how much of the 500 MB database is used.
- Supabase → **Reports** shows usage. Free plan: 500 MB database, 5 GB transfer and 2 million live updates a month.
- Free projects pause after **7 days with no activity at all** (e.g. Christmas). Open Supabase and click **Restore**; nothing is lost.
- Never share the **secret** key. The publishable key in `config.js` is meant to be public.
