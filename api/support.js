const {
  getClientIp,
  hasTrustedOrigin,
  isSafeSessionId,
  parseJsonBody,
  rateLimit,
  sendError,
  setNoStore,
} = require('./security-utils');

const SUPPORT_ACTIONS = new Set(['messages', 'send']);

module.exports = async function handler(req, res) {
  setNoStore(res);

  try {
    return await handleSupport(req, res);
  } catch (error) {
    console.error('Support API failed:', { message: error?.message });
    return sendError(res, 502, 'Support API failed. Try again later.');
  }
};

async function handleSupport(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed');
  }

  if (!hasTrustedOrigin(req)) {
    return sendError(res, 403, 'Request origin is not allowed.');
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return sendError(res, 503, 'Support is not configured yet.');
  }

  let body;
  try {
    body = parseJsonBody(req, 8 * 1024);
  } catch (error) {
    return sendError(res, error.statusCode || 400, 'Invalid request body.');
  }

  const action = String(body.action || '');
  const sessionId = String(body.sessionId || '');
  const ip = getClientIp(req);

  if (!SUPPORT_ACTIONS.has(action) || !isSafeSessionId(sessionId)) {
    return sendError(res, 400, 'Invalid support request.');
  }

  if (!rateLimit(`support:${ip}`, 30, 60 * 1000)) {
    return sendError(res, 429, 'Too many support requests. Try again later.');
  }

  if (action === 'messages') {
    const messages = await listMessages(sessionId);
    return res.status(200).json({ messages });
  }

  const text = String(body.body || '').trim();
  if (!text || text.length > 1000) {
    return sendError(res, 400, 'Invalid support message.');
  }

  if (!rateLimit(`support-send:${ip}:${sessionId}`, 8, 60 * 1000)) {
    return sendError(res, 429, 'Too many support messages. Try again later.');
  }

  const thread = await getOrCreateThread(sessionId);
  if (!thread?.id) return sendError(res, 502, 'Unable to open support thread.');

  const createdAt = new Date().toISOString();
  await supabaseFetch('/support_messages', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: {
      thread_id: thread.id,
      sender: 'user',
      body: text,
      created_at: createdAt,
    },
  });

  await patchThread(thread.id, { status: 'open', updated_at: createdAt });
  const messages = await listMessages(sessionId);
  return res.status(200).json({ messages });
}

async function getOrCreateThread(sessionId) {
  const existing = await getThread(sessionId);
  if (existing?.id) return existing;

  const rows = await supabaseFetch('/support_threads?select=id,session_id,status,customer_label,created_at,updated_at', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: {
      session_id: sessionId,
      customer_label: `Visitor ${sessionId.slice(0, 8)}`,
    },
  });

  return Array.isArray(rows) ? rows[0] : null;
}

async function getThread(sessionId) {
  const rows = await supabaseFetch(`/support_threads?session_id=eq.${encodeURIComponent(sessionId)}&select=id,session_id,status,customer_label,created_at,updated_at&limit=1`);
  return Array.isArray(rows) ? rows[0] : null;
}

async function listMessages(sessionId) {
  const thread = await getThread(sessionId);
  if (!thread?.id) return [];
  const rows = await supabaseFetch(`/support_messages?thread_id=eq.${encodeURIComponent(thread.id)}&select=id,sender,body,created_at&order=created_at.asc`);
  return Array.isArray(rows) ? rows : [];
}

async function patchThread(threadId, patch) {
  return supabaseFetch(`/support_threads?id=eq.${encodeURIComponent(threadId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: patch,
  });
}

async function supabaseFetch(path, options = {}) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1${path}`, {
    method: options.method || 'GET',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
