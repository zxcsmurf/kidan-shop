const ADMIN_ACTIONS = new Set(['list', 'reply', 'close']);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const pin = String(body.pin || '');
  const action = String(body.action || 'list');

  if (!process.env.SUPPORT_ADMIN_PIN || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({
      error: 'Support admin is not configured yet. Add SUPPORT_ADMIN_PIN, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY in Vercel.',
    });
  }

  if (pin !== process.env.SUPPORT_ADMIN_PIN) {
    return res.status(401).json({ error: 'Wrong support PIN.' });
  }

  if (!ADMIN_ACTIONS.has(action)) {
    return res.status(400).json({ error: 'Unknown support action.' });
  }

  if (action === 'reply') {
    const threadId = String(body.threadId || '');
    const text = String(body.body || '').trim();
    if (!isUuid(threadId) || !text || text.length > 2000) {
      return res.status(400).json({ error: 'Invalid reply.' });
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
    if (!isUuid(threadId)) return res.status(400).json({ error: 'Invalid thread.' });
    await patchThread(threadId, { status: 'closed', updated_at: new Date().toISOString() });
  }

  const threads = await listThreads();
  return res.status(200).json({ threads });
};

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

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
