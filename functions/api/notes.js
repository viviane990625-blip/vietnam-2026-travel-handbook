const json = (data, status = 200) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});

async function tables(db) {
  await db.exec('CREATE TABLE IF NOT EXISTS trip_notes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS note_limits (ip TEXT PRIMARY KEY, last_post INTEGER NOT NULL)');
}

export async function onRequestGet({ env }) {
  if (!env.TRIP_DB) return json({ error: '数据库尚未连接' }, 503);
  await tables(env.TRIP_DB);
  const { results } = await env.TRIP_DB.prepare('SELECT id,name,body,created_at FROM trip_notes ORDER BY id DESC LIMIT 100').all();
  return json({ notes: results });
}

export async function onRequestPost({ request, env }) {
  if (!env.TRIP_DB) return json({ error: '数据库尚未连接' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: '请求格式错误' }, 400); }
  if (body?.website) return json({ ok: true });
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const message = typeof body?.body === 'string' ? body.body.trim() : '';
  if (name.length > 30 || !message || message.length > 500) return json({ error: '备注需在 1–500 字以内' }, 400);
  await tables(env.TRIP_DB);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  const previous = await env.TRIP_DB.prepare('SELECT last_post FROM note_limits WHERE ip=?').bind(ip).first();
  if (previous && now - previous.last_post < 60000) return json({ error: '请过一分钟再留言' }, 429);
  await env.TRIP_DB.prepare('INSERT INTO note_limits (ip,last_post) VALUES (?,?) ON CONFLICT(ip) DO UPDATE SET last_post=excluded.last_post').bind(ip, now).run();
  const created_at = new Date(now).toISOString();
  const result = await env.TRIP_DB.prepare('INSERT INTO trip_notes (name,body,created_at) VALUES (?,?,?)').bind(name || '旅伴', message, created_at).run();
  return json({ note: { id: result.meta.last_row_id, name: name || '旅伴', body: message, created_at } }, 201);
}
