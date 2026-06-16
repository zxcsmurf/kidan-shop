# Support admin setup

The support inbox can be opened from:

```text
https://kidan-shop.vercel.app/admin-support
```

It uses a private PIN through a Vercel serverless function, so it does not depend on Supabase email links, Google OAuth, or SMS.

## Required Vercel environment variables

Add these in Vercel Project Settings -> Environment Variables:

```text
SUPPORT_ADMIN_PIN
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Use a long private PIN/password for `SUPPORT_ADMIN_PIN`. Do not commit it to GitHub.

## Why the old login failed

Supabase Auth redirected email confirmation to `localhost:3000`. On another device, `localhost` means that device itself, not the deployed site, so the page cannot open.

To fix Supabase Auth too, set this in Supabase Dashboard -> Authentication -> URL Configuration:

```text
Site URL: https://kidan-shop.vercel.app
Redirect URLs:
https://kidan-shop.vercel.app/**
```

Phone login also requires an SMS provider in Supabase Auth settings.
