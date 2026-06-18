# Deploy Checklist

Use this checklist before any production or public deployment.

## Permission

- [ ] The project owner explicitly confirmed that deployment is allowed.
- [ ] The target environment is clear: preview/staging/production.
- [ ] No AI agent is deploying autonomously without confirmation.

## Code state

- [ ] Current branch is correct.
- [ ] `git status` has been reviewed.
- [ ] No accidental debug files, logs, archives, or local-only files are staged.
- [ ] No unrelated changes are included.

## Secrets and configuration

- [ ] `.env` files were not edited or committed.
- [ ] No real secrets, tokens, private keys, PINs, or service role keys appear in frontend files.
- [ ] Vercel environment variables are configured outside Git.
- [ ] Stripe and Supabase secrets are stored only in trusted server/deployment settings.

## Checks

Run locally before deploy:

```bash
npm run check
npm run build
```

- [ ] `npm run check` passes.
- [ ] `npm run build` passes.

## Manual smoke test

After a preview deployment, verify:

- [ ] Home page loads.
- [ ] Brand/collection pages load.
- [ ] Product page shell loads.
- [ ] Wishlist page loads.
- [ ] Profile page loads.
- [ ] Support chat UI loads.
- [ ] Admin support route is protected and does not expose secrets.
- [ ] Checkout flow is tested only with Stripe test mode/test cards unless production payments are intentionally enabled.

## Final safety

- [ ] No database destructive actions were run.
- [ ] No production data was modified unexpectedly.
- [ ] Rollback path is known before production deployment.
