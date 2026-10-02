const json = (data, status = 200) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});

async function table(db) {
  await db.exec('CREATE TABLE IF NOT EXISTS itinerary_edits (id TEXT PRIMARY KEY, time TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, updated_at TEXT NOT NULL)');
}

export async function onRequestGet({ env }) {
  if (!env.TRIP_DB) return json({ error: '数据库尚未连接' }, 503);
  await table(env.TRIP_DB);
  const { results } = await env.TRIP_DB.prepare('SELECT id, time, title, description, updated_at FROM itinerary_edits').all();
  return json({ edits: results });
}

export async function onRequestPut({ request, env }) {
  if (!env.TRIP_DB || !env.EDITOR_PASSWORD) return json({ error: '编辑功能尚未配置' }, 503);
  const supplied = request.headers.get('X-Editor-Password') || '';
  const encode = new TextEncoder();
  const [actualHash, suppliedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encode.encode(env.EDITOR_PASSWORD)),
    crypto.subtle.digest('SHA-256', encode.encode(supplied))
  ]);
  const a = new Uint8Array(actualHash), b = new Uint8Array(suppliedHash);
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  if (mismatch || !supplied) return json({ error: '编辑口令不正确' }, 403);
  let body;
  try { body = await request.json(); } catch { return json({ error: '请求格式错误' }, 400); }
  const { id, time, title, description } = body || {};
  if (!/^\d{2}-\d{1,2}$/.test(id || '') || !['17','18','19','20'].includes(String(id).split('-')[0]) ||
      typeof time !== 'string' || time.length > 20 || !time.trim() ||
      typeof title !== 'string' || title.length > 100 || !title.trim() ||
      typeof description !== 'string' || description.length > 600 || !description.trim())
    return json({ error: '请检查时间、标题和说明的长度' }, 400);
  await table(env.TRIP_DB);
  const updated_at = new Date().toISOString();
  await env.TRIP_DB.prepare('INSERT INTO itinerary_edits (id,time,title,description,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET time=excluded.time,title=excluded.title,description=excluded.description,updated_at=excluded.updated_at')
    .bind(id, time.trim(), title.trim(), description.trim(), updated_at).run();
  return json({ edit: { id, time: time.trim(), title: title.trim(), description: description.trim(), updated_at } });
}
