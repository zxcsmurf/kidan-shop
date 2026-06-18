const crypto = require('crypto');

const ADMIN_ACTIONS = new Set(['login', 'list', 'reply', 'close', 'logout']);
const ADMIN_COOKIE = 'kidan_support_admin';
const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;
const {
  getClientIp,
  hasTrustedOrigin,
  isUuid,
  parseJsonBody,
  rateLimit,
  sendError,
  setNoStore,
  timingSafeEqualString,
} = require('./security-utils');

module.exports = async function handler(req, res) {
  setNoStore(res);

  try {
    return await handleSupportAdmin(req, res);
  } catch (error) {
    console.error('Support admin API failed:', { message: error?.message });
    return sendError(res, 502, 'Support admin API failed. Try again later.');
  }
};

async function handleSupportAdmin(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed');
  }

  if (!hasTrustedOrigin(req)) {
    return sendError(res, 403, 'Request origin is not allowed.');
  }

  let body;
  try {
    body = parseJsonBody(req, 8 * 1024);
  } catch (error) {
    return sendError(res, error.statusCode || 400, 'Invalid request body.');
  }

  const pin = String(body.pin || '');
  const action = String(body.action || 'list');
  const ip = getClientIp(req);

  if (!process.env.SUPPORT_ADMIN_PIN || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return sendError(res, 503, 'Support admin is not configured yet. Add SUPPORT_ADMIN_PIN, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY in Vercel.');
  }

  if (!rateLimit(`support-admin:${ip}`, 20, 60 * 1000)) {
    return sendError(res, 429, 'Too many support admin requests. Try again later.');
  }

  if (!ADMIN_ACTIONS.has(action)) {
    return sendError(res, 400, 'Unknown support action.');
  }

  if (action === 'logout') {
    clearAdminCookie(res);
    return res.status(200).json({ ok: true });
  }

  if (action === 'login') {
    if (!rateLimit(`support-admin-pin:${ip}`, 6, 15 * 60 * 1000)) {
      return sendError(res, 429, 'Too many support PIN attempts. Try again later.');
    }
    if (!timingSafeEqualString(pin, process.env.SUPPORT_ADMIN_PIN)) {
      return sendError(res, 401, 'Wrong support PIN.');
    }
    setAdminCookie(res);
  } else if (!hasValidAdminCookie(req)) {
    return sendError(res, 401, 'Support session expired. Sign in again.');
  }

  if (action === 'reply') {
    const threadId = String(body.threadId || '');
    const text = String(body.body || '').trim();
    if (!isUuid(threadId) || !text || text.length > 2000) {
      return sendError(res, 400, 'Invalid reply.');
    }

    const createdAt = new Date().toISOString();
    await supabaseFetch('/support_messages', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: {
        thread_id: threadId,
        sender: 'agent',
        body: text,
        created_at: createdAt,
      },
    });
    await patchThread(threadId, { status: 'open', updated_at: createdAt });
  }

  if (action === 'close') {
    const threadId = String(body.threadId || '');
    if (!isUuid(threadId)) return sendError(res, 400, 'Invalid thread.');
    await patchThread(threadId, { status: 'closed', updated_at: new Date().toISOString() });
  }

  const threads = await listThreads();
  return res.status(200).json({ threads });
}

function setAdminCookie(res) {
  const issuedAt = String(Date.now());
  const signature = signAdminValue(issuedAt);
  const secure = process.env.NODE_ENV === 'development' ? '' : '; Secure';
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=${issuedAt}.${signature}; HttpOnly; SameSite=Strict; Path=/api/support-admin; Max-Age=${ADMIN_COOKIE_MAX_AGE_SECONDS}${secure}`);
}

function clearAdminCookie(res) {
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/support-admin; Max-Age=0`);
}

function hasValidAdminCookie(req) {
  const cookie = String(req.headers.cookie || '')
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_COOKIE}=`));
  if (!cookie) return false;

  const [issuedAt, signature] = decodeURIComponent(cookie.slice(ADMIN_COOKIE.length + 1)).split('.');
  const issuedAtNumber = Number(issuedAt);
  if (!Number.isFinite(issuedAtNumber) || Date.now() - issuedAtNumber > ADMIN_COOKIE_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  return timingSafeEqualString(signature, signAdminValue(issuedAt));
}

function signAdminValue(value) {
  return crypto
    .createHmac('sha256', process.env.SUPPORT_ADMIN_PIN)
    .update(`support-admin:${value}`)
    .digest('hex');
}

async function listThreads() {
  const query = [
    'select=id,session_id,status,customer_label,created_at,updated_at,support_messages(id,sender,body,created_at)',
    'order=updated_at.desc',
  ].join('&');
  const threads = await supabaseFetch(`/support_threads?${query}`);
  return (threads || [])
    .map((thread) => ({
      ...thread,
      support_messages: Array.isArray(thread.support_messages) ? thread.support_messages : [],
    }))
    .filter((thread) => thread.support_messages.length)
    .sort((a, b) => {
      const aLast = latestMessageAt(a.support_messages) || a.updated_at || a.created_at;
      const bLast = latestMessageAt(b.support_messages) || b.updated_at || b.created_at;
      return new Date(bLast || 0) - new Date(aLast || 0);
    });
}

function latestMessageAt(messages) {
  return messages.reduce((latest, message) => {
    if (!message.created_at) return latest;
    if (!latest || new Date(message.created_at) > new Date(latest)) return message.created_at;
    return latest;
  }, '');
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
