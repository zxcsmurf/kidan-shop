const Stripe = require('stripe');
const {
  getAllowedOrigins,
  getClientIp,
  hasTrustedOrigin,
  parseJsonBody,
  rateLimit,
  sendError,
  setNoStore,
} = require('./security-utils');

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
  setNoStore(res);

  try {
    return await handleCheckout(req, res);
  } catch (error) {
    console.error('Stripe checkout failed:', {
      type: error?.type,
      code: error?.code,
      message: error?.message,
    });

    return sendError(res, 502, getSafeCheckoutError(error));
  }
};

async function handleCheckout(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed');
  }

  if (!hasTrustedOrigin(req)) {
    return sendError(res, 403, 'Request origin is not allowed.');
  }

  const ip = getClientIp(req);
  if (!rateLimit(`checkout:${ip}`, 20, 60 * 1000)) {
    return sendError(res, 429, 'Too many checkout attempts. Try again later.');
  }

  const supabaseAuthKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !supabaseAuthKey) {
    return sendError(res, 503, 'Stripe checkout is not configured yet. Add STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in Vercel.');
  }

  let body;
  try {
    body = parseJsonBody(req, 8 * 1024);
  } catch (error) {
    return sendError(res, error.statusCode || 400, 'Invalid checkout request.');
  }

  const orderId = String(body.orderId || '');
  const listingId = String(body.listingId || '');
  const sessionId = String(body.sessionId || '').slice(0, 120);
  const accessToken = String(body.accessToken || '');

  if (!UUID_RE.test(orderId) || !isSafeListingId(listingId) || !sessionId || !accessToken) {
    return sendError(res, 400, 'Invalid checkout request.');
  }

  const user = await fetchAuthenticatedUser(accessToken);
  if (!user) {
    return sendError(res, 401, 'Sign in again before opening Stripe Checkout.');
  }

  const listing = await resolveListing(listingId);
  if (!listing) {
    return sendError(res, 404, 'Listing is not available for secure checkout yet.');
  }

  const order = await fetchOrder(orderId);
  if (!order || order.session_id !== sessionId || order.listing_id !== listingId) {
    return sendError(res, 400, 'Order does not match this checkout request.');
  }

  if (order.buyer_user_id && order.buyer_user_id !== user.id) {
    return sendError(res, 403, 'This order belongs to a different signed-in account.');
  }

  if (!['pending_payment_setup', 'stripe_checkout_created'].includes(order.status)) {
    return sendError(res, 409, 'This order is not ready for checkout.');
  }

  const amountInCents = Math.round(Number(listing.price) * 100);
  if (!Number.isInteger(amountInCents) || amountInCents < 50) {
    return sendError(res, 400, 'Listing price is not valid for Stripe Checkout.');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    client_reference_id: orderId,
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
}

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
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=id,session_id,listing_id,status,buyer_user_id,buyer_email&limit=1`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!response.ok) return fetchLegacyOrder(orderId);
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] : null;
}

async function fetchLegacyOrder(orderId) {
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

async function fetchAuthenticatedUser(accessToken) {
  const apiKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!apiKey) return null;
  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) return null;
  return response.json();
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

function getSafeCheckoutError(error) {
  if (error?.type === 'StripeAuthenticationError') {
    return 'Stripe secret key is invalid or was not saved correctly in Vercel.';
  }

  if (error?.type === 'StripePermissionError') {
    return 'Stripe account does not allow this checkout request yet.';
  }

  if (error?.type === 'StripeInvalidRequestError') {
    return error.message || 'Stripe rejected the checkout request.';
  }

  return 'Stripe checkout failed on the server. Check Vercel Function logs.';
}

function getAppOrigin(req) {
  const allowed = Array.from(getAllowedOrigins(req));
  return allowed[0] || 'https://kidan-shop.vercel.app';
}
