# Later: Publish Kidan to GitHub and Vercel

When you are ready, do these steps from:

```text
C:\Users\Kostya\Desktop\kidan\kidan
```

## 1. Create GitHub Repository

1. Open GitHub.
2. Create a new repository, for example `kidan-shop`.
3. Do not add README/license/gitignore on GitHub, because the local project already has files.

## 2. Push Local Project

Replace `YOUR_NAME` and `YOUR_REPO`:

```bash
git remote add origin https://github.com/YOUR_NAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

If `origin` already exists:

```bash
git remote set-url origin https://github.com/YOUR_NAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## 3. Import to Vercel

1. Open Vercel.
2. Click `Add New -> Project`.
3. Import the GitHub repository.
4. Use:
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `.`
5. Deploy.

## 4. After Deploy

Open the deployed site and check:

- home page loads
- listings load from Supabase
- add listing works
- photos upload to Supabase Storage
- support widget works
- `/admin-support.html` opens and asks for login

## Notes

- Current Supabase project URL:

```text
https://bissogumzvqklxttaqne.supabase.co
```

- Current local build check:

```bash
npm run build
```

- Full deployment notes are also in `DEPLOYMENT.md`.
