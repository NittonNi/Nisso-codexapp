# Nisso Travel Tracker

Premium mobile-first travel tracker with local storage, import/export, PWA support, and a Supabase-ready data layer.

## Run locally

Open `index.html` directly, or serve the folder with any static server.

```powershell
npx serve .
```

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase-schema.sql`.
3. Open the app, go to Profile, paste your Supabase URL and anon key.
4. Tap Save config, then Sync now.

The app remains local-first: it always writes to `localStorage` and mirrors to Supabase when credentials are configured.

## Added basics

- PWA manifest and service worker.
- Import and export JSON backups.
- Supabase persistence abstraction with a local fallback.
- Planned / visited / cancelled trip status.
- Country detail stats.
- Tags, photo URL, richer timeline cards.
- Premium polish: safer form closing, haptics, refined empty states, smoother UI.
