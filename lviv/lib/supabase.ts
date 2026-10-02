const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

function baseUrl() {
  if (!url || !secretKey) {
    throw new Error('Supabase не налаштований: додайте SUPABASE_URL та SUPABASE_SECRET_KEY у Vercel Environment Variables.');
  }
  return `${url.replace(/\/$/, '')}/rest/v1/articles`;
}

function headers(extra: Record<string,string> = {}) {
  if (!secretKey) throw new Error('SUPABASE_SECRET_KEY не налаштований.');
  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function request(path = '', init: RequestInit = {}) {
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: headers((init.headers as Record<string,string>) || {}),
  });
  const text = await response.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const message = data?.message || data?.hint || data?.details || data?.error || text || `Supabase HTTP ${response.status}`;
    const err: any = new Error(message);
    err.status = response.status;
    throw err;
  }
  return data;
}

export async function listArticles(includeDrafts = false) {
  const params = new URLSearchParams({
    select: '*',
    order: 'published_at.desc',
  });
  if (!includeDrafts) params.set('status', 'eq.published');
  return request(`?${params.toString()}`);
}

export async function countArticles() {
  const response = await fetch(`${baseUrl()}?select=id&limit=1`, {
    method: 'HEAD',
    headers: headers({ Prefer: 'count=exact' }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase HTTP ${response.status}`);
  }
  const range = response.headers.get('content-range') || '';
  const match = range.match(/\/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

export async function insertArticles(rows: any[]) {
  return request('?select=*', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(rows),
  });
}

export async function insertArticle(row: any) {
  const rows = await insertArticles([row]);
  return rows?.[0];
}

export async function updateArticle(id: string, row: any) {
  const params = new URLSearchParams({ id: `eq.${id}`, select: '*' });
  const rows = await request(`?${params.toString()}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  return rows?.[0] || null;
}

export async function deleteArticle(id: string) {
  const params = new URLSearchParams({ id: `eq.${id}` });
  await request(`?${params.toString()}`, { method: 'DELETE' });
}

export function toArticle(row: any) {
  return {
    id: String(row.id),
    title: row.title ?? '',
    excerpt: row.excerpt ?? '',
    category: row.category ?? 'Львів',
    author: row.author ?? 'Редакція',
    publishedAt: row.published_at ?? row.created_at ?? new Date().toISOString(),
    body: row.body ?? '',
    status: row.status === 'draft' ? 'draft' : 'published',
    featured: Boolean(row.featured),
    tags: Array.isArray(row.tags) ? row.tags : [],
    slug: row.slug ?? '',
    imageUrl: row.image_url ?? '',
    seoTitle: row.seo_title ?? '',
    seoDescription: row.seo_description ?? '',
  };
}

export function fromArticle(input: any) {
  return {
    title: String(input.title ?? '').trim(),
    excerpt: String(input.excerpt ?? ''),
    category: String(input.category ?? 'Львів'),
    author: String(input.author ?? 'Редакція'),
    published_at: input.publishedAt || new Date().toISOString(),
    body: String(input.body ?? ''),
    status: input.status === 'draft' ? 'draft' : 'published',
    featured: Boolean(input.featured),
    tags: Array.isArray(input.tags) ? input.tags : [],
    slug: String(input.slug || input.title || '').toLowerCase().trim()
      .replace(/[^a-z0-9а-яіїєґ\s-]/gi, '')
      .replace(/\s+/g, '-'),
    image_url: String(input.imageUrl ?? ''),
    seo_title: String(input.seoTitle || input.title || ''),
    seo_description: String(input.seoDescription || input.excerpt || ''),
  };
}
