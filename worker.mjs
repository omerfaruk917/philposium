const maxBodyBytes = 40000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function reply(status, headers = {}) {
  return Response.json({ ok: status === 200 }, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers },
  });
}

async function readFields(request) {
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let length = 0;
  let body = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return new URLSearchParams(body + decoder.decode());
    length += value.byteLength;
    if (length > maxBodyBytes) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    const contact = url.pathname === '/api/contact';
    if (!contact && url.pathname !== '/api/newsletter') return reply(404);
    if (request.method !== 'POST') return reply(405, { Allow: 'POST' });
    if (request.headers.get('Origin') !== url.origin) return reply(403);
    const contentType = request.headers.get('Content-Type')?.split(';')[0].trim();
    if (contentType !== 'application/x-www-form-urlencoded' || !request.body) return reply(415);
    if (Number(request.headers.get('Content-Length')) > maxBodyBytes) return reply(413);

    try {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
      const { success } = await env.FORM_RATE_LIMIT.limit({ key: `${url.pathname}:${ip}` });
      if (!success) return reply(429);

      const fields = await readFields(request);
      if (!fields) return reply(413);
      const email = fields.get('email')?.trim();
      if (!email || email.length > 254 || !emailPattern.test(email)) return reply(400);

      const db = env.FORMS_DB;
      if (contact) {
        const name = fields.get('name')?.trim();
        const message = fields.get('message')?.trim();
        if (!name || name.length > 120 || !message || message.length > 3000) return reply(400);
        await db.batch([
          db.prepare(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`),
          db.prepare('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)').bind(name, email, message),
        ]);
      } else {
        await db.batch([
          db.prepare(`CREATE TABLE IF NOT EXISTS subscribers (
            email TEXT PRIMARY KEY COLLATE NOCASE,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`),
          db.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)').bind(email),
        ]);
      }
      return reply(200);
    } catch {
      console.error('Form submission failed', url.pathname);
      return reply(503);
    }
  },
};
