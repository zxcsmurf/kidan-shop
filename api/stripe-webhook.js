const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'Stripe webhook is not configured.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const signature = req.headers['stripe-signature'];
  const rawBody = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid Stripe signature.' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await patchOrder(session.metadata?.order_id, {
      status: 'paid',
      provider: 'stripe',
      provider_session_id: session.id,
      updated_at: new Date().toISOString(),
    });
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    await patchOrder(session.metadata?.order_id, {
      status: 'expired',
      provider: 'stripe',
      provider_session_id: session.id,
      updated_at: new Date().toISOString(),
    });
  }

  return res.status(200).json({ received: true });
};

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
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
