# Stripe setup

The site already has a safe Stripe Checkout flow prepared for Vercel.

## Required environment variables

Add these in Vercel Project Settings -> Environment Variables:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
APP_URL
```

`STRIPE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must never be added to frontend files or committed to GitHub. `SUPABASE_ANON_KEY` is safe to expose, but keep it in Vercel too so server functions can validate user sessions without using the service key for Auth lookups.

## Webhook

In Stripe Dashboard, create a webhook endpoint:

```text
https://your-vercel-domain.vercel.app/api/stripe-webhook
```

Subscribe to:

```text
checkout.session.completed
checkout.session.expired
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Test card

After `STRIPE_SECRET_KEY` is added and the project is redeployed, open a listing and click `Buy now`.
Use Stripe test card:

```text
4242 4242 4242 4242
```

Use any future expiration date, any CVC, and any ZIP/postal code.

The starter products on the homepage use server-side trusted prices in `api/create-checkout-session.js`. Supabase-created listings are read from the `listings` table by UUID.

## Important

If a secret key was pasted into chat, rotate it in Stripe Dashboard before using payments with real users.
