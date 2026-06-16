const Stripe = require('stripe');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Stripe is not configured yet.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const orderId = String(body.orderId || '');
  const listingId = String(body.listingId || '');
  const sessionId = String(body.sessionId || '').slice(0, 120);

  if (!UUID_RE.test(orderId) || !UUID_RE.test(listingId) || !sessionId) {
    return res.status(400).json({ error: 'Invalid checkout request.' });
  }

  const listing = await fetchListing(listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Listing is not available for secure checkout yet.' });
  }

  const amountInCents = Math.round(Number(listing.price) * 100);
  if (!Number.isInteger(amountInCents) || amountInCents < 50) {
    return res.status(400).json({ error: 'Listing price is not valid for Stripe Checkout.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-17.basil',
  });

  const origin = getAppOrigin(req);
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amountInCents,
          product_data: {
            name: listing.title,
            description: `${listing.brand || 'Kidan'} · ${listing.condition || 'Used'}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      order_id: orderId,
      listing_id: listingId,
      session_id: sessionId,
    },
    success_url: `${origin}/payment-success.html?order=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/payment-cancel.html?order=${encodeURIComponent(orderId)}`,
  });

  await patchOrder(orderId, {
    status: 'stripe_checkout_created',
    provider: 'stripe',
    provider_session_id: checkoutSession.id,
    updated_at: new Date().toISOString(),
  });

  return res.status(200).json({ url: checkoutSession.url });
};

async function fetchListing(listingId) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const url = `${supabaseUrl}/rest/v1/listings?id=eq.${encodeURIComponent(listingId)}&status=eq.active&select=id,title,brand,condition,price,seller_name&limit=1`;
  const response = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] : null;
}

async function patchOrder(orderId, patch) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return false;

  const response = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(patch),
  });

  return response.ok;
}

function getAppOrigin(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}
