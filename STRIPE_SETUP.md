# Stripe setup

The site already has a safe Stripe Checkout flow prepared for Vercel.

## Required environment variables

Add these in Vercel Project Settings -> Environment Variables:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
APP_URL
```

`STRIPE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must never be added to frontend files or committed to GitHub.

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

## Important

If a secret key was pasted into chat, rotate it in Stripe Dashboard before using payments with real users.
