# Kidan Shop

Kidan Shop is a static HTML/CSS/JavaScript marketplace site with Vercel serverless API routes for checkout and support workflows.

## Project structure

- `index.html` — main landing/catalog page.
- `profile.html` — user profile, listings, reviews, and account-related UI.
- `product.html` — product detail page shell rendered by `script.js`.
- `wishlist.html` — wishlist page shell rendered by `script.js`.
- `chats.html` — seller/customer chat page shell rendered by `script.js`.
- `checkout.html` — checkout page shell rendered by `script.js`.
- `payment-success.html`, `payment-cancel.html` — payment result pages.
- `admin-support.html` — support admin UI.
- `brand-*.html`, `new.html`, `used.html`, `sale.html`, `view-all.html` — collection/brand page shells.
- `script.js` — shared frontend logic for rendering pages and UI behavior.
- `style.css` — shared styles.
- `api/` — Vercel serverless functions.
- `src/` — static image assets.
- `supabase-schema.sql` — Supabase schema/policies setup script.

## Local setup

Install dependencies:

```bash
npm install
```

Start a local static server:

```bash
npm start
```

The app is served on:

```text
http://localhost:4178
```

## Checks

Run the main project check:

```bash
npm run check
```

Run the build command used by Vercel/GitHub Actions:

```bash
npm run build
```

`npm run build` currently runs the same validation as `npm run check`.

## Environment variables

Do not commit real secrets. Use `.env.example` only as a placeholder/reference.

Server/API features expect these variables in Vercel or the local runtime when testing API routes:

- `STRIPE_SECRET_KEY` — private Stripe API key for Checkout session creation.
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret.
- `SUPABASE_URL` — Supabase project URL.
- `SUPABASE_ANON_KEY` — Supabase anon/publishable key for auth/session validation.
- `SUPABASE_SERVICE_ROLE_KEY` — private Supabase service role key for server functions only.
- `APP_URL` — public application origin used for redirects.
- `SUPPORT_ADMIN_PIN` — private support admin PIN/password.

Never place `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, or `SUPPORT_ADMIN_PIN` in frontend files.

## Deployment notes

- See `DEPLOYMENT.md` for GitHub/Vercel/Supabase setup.
- See `STRIPE_SETUP.md` for Stripe configuration.
- See `SUPPORT_ADMIN_SETUP.md` for support admin setup.
- See `DEPLOY_CHECKLIST.md` before any deployment.

## AI agent workflow

AI coding agents should read `AGENTS.md`, use `TASKS.md` for small safe tasks, and record blockers or important context in `AGENT_NOTES.md`.
