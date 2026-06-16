# Kidan Shop Deployment

## GitHub

1. Create a new GitHub repository.
2. From this folder, add the remote:

```bash
git remote add origin https://github.com/YOUR_NAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

GitHub Actions will run `npm run build` on pushes and pull requests.

## Vercel

1. Open Vercel.
2. Import the GitHub repository.
3. Use these settings:
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `.`
4. Deploy.

The site uses a public Supabase publishable key in `script.js`, so no Vercel environment variables are required for the current static MVP.

## Supabase

The active Supabase project is:

```text
https://bissogumzvqklxttaqne.supabase.co
```

Run `supabase-schema.sql` in Supabase SQL Editor if you need to recreate the database tables, RLS policies, or the `listing-photos` Storage bucket.

Current backend features:

- listings
- listing photos via Supabase Storage
- wishlist
- seller chats
- support chat
- support admin auth
