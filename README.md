# Nisso Travel Tracker

Premium mobile-first travel tracker with local storage, import/export, PWA support, and a Supabase-ready data layer.

## Run locally

Open `index.html` directly, or serve the folder with any static server.

```powershell
npx serve .
```

## Supabase setup with users

1. Create a Supabase project.
2. Open the SQL editor and run `supabase-schema.sql`.
3. In Supabase, go to **Authentication > Providers** and keep Email enabled.
4. Open the app. The Supabase URL and publishable key are already preconfigured.
5. Create an account or sign in with email/password from Profile.
6. Tap Sync now.

The app remains local-first: it always writes to `localStorage` and mirrors to Supabase only for the signed-in user.

- PWA manifest and service worker.
- Import and export JSON backups.
- Supabase persistence abstraction with a local fallback.
- Planned / visited / cancelled trip status.
- Country detail stats.
- Tags, photo URL, richer timeline cards.
- Premium polish: safer form closing, haptics, refined empty states, smoother UI.
