const Stripe = require('stripe');
const { isUuid, sendError, setNoStore } = require('./security-utils');

module.exports = async function handler(req, res) {
  setNoStore(res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed');
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return sendError(res, 503, 'Stripe webhook is not configured.');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const signature = req.headers['stripe-signature'];
  if (!signature) return sendError(res, 400, 'Missing Stripe signature.');

  let rawBody;
  try {
    rawBody = await readRawBody(req, 256 * 1024);
  } catch (error) {
    return sendError(res, 413, 'Webhook payload is too large.');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return sendError(res, 400, 'Invalid Stripe signature.');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (!isUuid(orderId) || session.payment_status !== 'paid') {
      return res.status(200).json({ received: true });
    }
    await patchOrder(orderId, {
      status: 'paid',
      provider: 'stripe',
      provider_session_id: session.id,
      updated_at: new Date().toISOString(),
    });
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (!isUuid(orderId)) return res.status(200).json({ received: true });
    await patchOrder(orderId, {
      status: 'expired',
      provider: 'stripe',
      provider_session_id: session.id,
      updated_at: new Date().toISOString(),
    });
  }

  return res.status(200).json({ received: true });
};

async function readRawBody(req, maxBytes) {
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > maxBytes) throw new Error('Payload too large');
    return req.body;
  }
  if (typeof req.body === 'string') {
    const buffer = Buffer.from(req.body);
    if (buffer.length > maxBytes) throw new Error('Payload too large');
    return buffer;
  }

  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > maxBytes) {
      const error = new Error('Payload too large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

async function patchOrder(orderId, patch) {
  if (!orderId) return false;

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
