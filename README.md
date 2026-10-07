# Smurfit Class Hub · v1.1.0

A phone-first web app for the UCD Smurfit MSc Business Analytics class: deadlines, exams, events, jobs, class updates, study sessions, polls, ten multiplayer games, chat, a contributors leaderboard and up to 5 Class Ambassadors.

## Deploy

Live at **https://ucdba.vercel.app**

It's a static site with no build step. Deploy it with Vercel from this folder:

```bash
npx vercel --prod
```

Or import this repo in Vercel (Framework preset: **Other**, no build command) so every push to `main` deploys automatically.

Open the URL on your phone, then **Share → Add to Home Screen**. It installs like an app.

This folder is set up **live**: it connects to the class's Supabase database, and everyone signs in with a 6-digit code sent to their UCD email. Follow **SETUP-GUIDE.md** once to prepare the database, then deploy.

(To try it without the database, set `supabase: null` in `config.js` and it runs in demo mode with sample data on that device only.)

## How it works

- **Names and emails** come from each person's UCD email address and can't be edited in the app, so everyone appears as who they really are.
- **Anyone can post** anything. **Class Ambassadors** (max 5, chosen by the owner in Class → Roles) can edit or delete anyone's posts and messages. Every edit shows who made it.
- **Leave the hub** (Class → About) removes a person's profile and, if they choose, everything they posted.

## Production checklist (built in)

- No inline code: `index.html` loads `app.css` and `app.js`, so strict security headers apply (`vercel.json`: CSP, HSTS, no framing, no camera/mic/location).
- Installable app with an offline app shell (`sw.js`). It's network-first, so updates show up straight away.
- Offline banner, friendly error message, chat spam protection, batched screen updates.
- Every rule (who can post, edit, pin, remove, vote) is checked by the database itself, not just the screen. Only UCD emails can create accounts.
- Text is escaped everywhere, links must be https, text length limits on posts and messages.
- Accessible: 44px+ tap targets, keyboard support, reduced-motion respected, 16px inputs (no iPhone zoom), no sideways scrolling.

## Files

| File | What it is |
|------|------------|
| `index.html` | Page structure |
| `app.css` / `app.js` | The app's look and behaviour |
| `config.js` | Supabase address + publishable key, owner email, allowed email domains |
| `hub-backend.js` | Email-code sign-in and the live connection to Supabase (or the local demo store) |
| `sw.js` | Offline app shell |
| `manifest.webmanifest`, `icons/` | Home-screen name and icon |
| `vercel.json` | Security and caching headers |
| `supabase-setup.sql` | The database: tables, security rules, live updates, auto-cleanup. Paste into Supabase once |
| `SETUP-GUIDE.md` | Step-by-step: database, email codes, Brevo, deploy |


---

Developed with ❤ by Paarthan
