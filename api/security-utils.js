const crypto = require('crypto');

const buckets = new Map();

function setNoStore(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
}

function parseJsonBody(req, maxBytes = 16 * 1024) {
  const body = req.body || {};
  if (typeof body === 'string') {
    if (Buffer.byteLength(body, 'utf8') > maxBytes) {
      const error = new Error('Request body is too large.');
      error.statusCode = 413;
      throw error;
    }
    return JSON.parse(body || '{}');
  }

  const serialized = JSON.stringify(body);
  if (Buffer.byteLength(serialized, 'utf8') > maxBytes) {
    const error = new Error('Request body is too large.');
    error.statusCode = 413;
    throw error;
  }
  return body;
}

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const bucket = (buckets.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  if (bucket.length >= limit) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.push(now);
  buckets.set(key, bucket);
  return true;
}

function normalizeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch (error) {
    return '';
  }
}

function getAllowedOrigins(req) {
  const origins = new Set();
  [process.env.APP_URL, process.env.NEXT_PUBLIC_APP_URL, 'https://kidan-shop.vercel.app'].filter(Boolean).forEach((value) => {
    const origin = normalizeOrigin(value);
    if (origin) origins.add(origin);
  });

  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  if (host && isLocalHost(host)) origins.add(`${proto}://${host}`);

  return origins;
}

function isLocalHost(host) {
  const text = String(host || '').trim().toLowerCase();
  const closingBracket = text.indexOf(']');
  const normalized = text.startsWith('[') && closingBracket > 1
    ? text.slice(1, closingBracket)
    : text.replace(/:\d+$/, '');
  return ['localhost', '127.0.0.1', '::1'].includes(normalized);
}

function hasTrustedOrigin(req) {
  const origin = normalizeOrigin(req.headers.origin || '');
  if (!origin) return false;
  return getAllowedOrigins(req).has(origin);
}

function timingSafeEqualString(left, right) {
  const leftText = String(left || '');
  const rightText = String(right || '');
  const leftHash = crypto.createHash('sha256').update(leftText).digest();
  const rightHash = crypto.createHash('sha256').update(rightText).digest();
  return crypto.timingSafeEqual(leftHash, rightHash) && leftText.length === rightText.length;
}

function sendError(res, statusCode, error) {
  setNoStore(res);
  return res.status(statusCode).json({ error });
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(String(value || ''));
}

function isSafeSessionId(value) {
  return /^[a-z0-9-]{24,140}$/i.test(String(value || ''));
}

module.exports = {
  getAllowedOrigins,
  getClientIp,
  hasTrustedOrigin,
  isSafeSessionId,
  isUuid,
  parseJsonBody,
  rateLimit,
  sendError,
  setNoStore,
  timingSafeEqualString,
};
