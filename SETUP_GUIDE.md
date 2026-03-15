# ARISE — Setup Guide (15 minutes total)

---

## STEP 1 — Supabase Database (5 min)

1. Go to **supabase.com** → Sign up free → New Project
   - Name: `arise` | Region: Singapore (closest to India)
2. Wait ~2 min for project to initialize
3. Go to **SQL Editor** → New query
4. Open `supabase_schema.sql` from this folder → Copy all → Paste → **Run**
5. Go to **Settings → API** → copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
6. Go to **Authentication → Providers → Email** → turn OFF "Confirm email" → Save

---

## STEP 2 — Deploy to Vercel (5 min)

1. Go to **github.com/new** → create repo named `arise-os` (don't add README)
2. Open Terminal on your Mac:

```bash
cd ~/Downloads/arise-final
git init
git branch -M main
git add .
git commit -m "🚀 ARISE — Initial commit"
git remote add origin https://YOUR_GITHUB_TOKEN@github.com/YOUR_USERNAME/arise-os.git
git push -u origin main
```

3. Go to **vercel.com** → Add New Project → Import `arise-os`
4. Before deploying → **Environment Variables** → add:
   - `REACT_APP_SUPABASE_URL` = your Supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy** → wait ~60 seconds → your URL is live!

---

## STEP 3 — Install on Android (1 min)

1. Open **Chrome** on your Android phone
2. Go to your Vercel URL
3. Tap **3-dot menu → Add to Home Screen → Install**

## Install on Mac

- Open Chrome → go to your URL → click **⊕** in address bar → Install

---

## Done! 🔥

ARISE is live on your phone + laptop, synced to Supabase cloud.


