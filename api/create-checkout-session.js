const Stripe = require('stripe');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATIC_LISTINGS = {
  'nike-air-max-90': { id: 'nike-air-max-90', title: 'Air Max 90 White/Red', brand: 'Nike', condition: 'Used', price: 52 },
  'supreme-box-logo-hoodie': { id: 'supreme-box-logo-hoodie', title: 'Box Logo Hoodie Red', brand: 'Supreme', condition: 'New', price: 195 },
  'tnf-nuptse-black': { id: 'tnf-nuptse-black', title: 'Nuptse Jacket Black', brand: 'The North Face', condition: 'New', price: 169 },
  'vans-old-skool': { id: 'vans-old-skool', title: 'Old Skool Black/White', brand: 'Vans', condition: 'Used', price: 39 },
  'carhartt-detroit-jacket': { id: 'carhartt-detroit-jacket', title: 'Detroit Jacket Brown', brand: 'Carhartt', condition: 'Used', price: 95 },
  'adidas-ultraboost': { id: 'adidas-ultraboost', title: 'Ultraboost 22 Black', brand: 'Adidas', condition: 'Used', price: 121 },
  'stussy-graphic-tee': { id: 'stussy-graphic-tee', title: 'Graphic T-Shirt Cream', brand: 'Stussy', condition: 'New', price: 44 },
  'puma-suede-blue': { id: 'puma-suede-blue', title: 'Suede Classic Blue', brand: 'Puma', condition: 'Sale', price: 61 },
  'stone-island-overshirt': { id: 'stone-island-overshirt', title: 'Nylon Overshirt Navy', brand: 'Stone Island', condition: 'Used', price: 148 },
  'new-balance-550': { id: 'new-balance-550', title: '550 Green/White', brand: 'New Balance', condition: 'New', price: 88 },
  'levis-501': { id: 'levis-501', title: '501 Straight Denim', brand: "Levi's", condition: 'Used', price: 57 },
  'champion-sweater': { id: 'champion-sweater', title: 'Reverse Weave Sweater', brand: 'Champion', condition: 'Sale', price: 49 },
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({
      error: 'Stripe checkout is not configured yet. Add STRIPE_SECRET_KEY, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY in Vercel.',
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const orderId = String(body.orderId || '');
  const listingId = String(body.listingId || '');
  const sessionId = String(body.sessionId || '').slice(0, 120);

  if (!UUID_RE.test(orderId) || !isSafeListingId(listingId) || !sessionId) {
    return res.status(400).json({ error: 'Invalid checkout request.' });
  }

  const listing = await resolveListing(listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Listing is not available for secure checkout yet.' });
  }

  const order = await fetchOrder(orderId);
  if (!order || order.session_id !== sessionId || order.listing_id !== listingId) {
    return res.status(400).json({ error: 'Order does not match this checkout request.' });
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
            description: `${listing.brand || 'Kidan'} - ${listing.condition || 'Used'}`,
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

async function resolveListing(listingId) {
  if (UUID_RE.test(listingId)) return fetchListing(listingId);
  return STATIC_LISTINGS[listingId] || null;
}

async function fetchListing(listingId) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/listings?id=eq.${encodeURIComponent(listingId)}&status=eq.active&select=id,title,brand,condition,price,seller_name&limit=1`;
  const response = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] : null;
}

async function fetchOrder(orderId) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=id,session_id,listing_id,status&limit=1`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] : null;
}

async function patchOrder(orderId, patch) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(patch),
  });

  return response.ok;
}

function isSafeListingId(value) {
  return UUID_RE.test(value) || /^[a-z0-9-]{2,80}$/i.test(value);
}

function getAppOrigin(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}
