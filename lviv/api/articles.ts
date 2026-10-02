import type { VercelRequest, VercelResponse } from '@vercel/node';
import { countArticles, deleteArticle, fromArticle, insertArticle, insertArticles, listArticles, toArticle, updateArticle } from '../lib/supabase.js';
import { validToken } from '../lib/auth.js';
import { seedArticles } from '../lib/news.js';

const isAdmin = (req: VercelRequest) => validToken(req.headers.authorization?.replace(/^Bearer\s+/i, ''));

async function seedIfEmpty() {
  const count = await countArticles();
  if (count > 0) return;
  await insertArticles(seedArticles.map(fromArticle));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const admin = isAdmin(req);

    if (req.method === 'GET') {
      await seedIfEmpty();
      const data = await listArticles(admin);
      return res.status(200).json({ articles: (data || []).map(toArticle) });
    }

    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    if (req.method === 'POST') {
      const row = fromArticle(req.body || {});
      if (!row.title) return res.status(400).json({ error: 'Заголовок обовʼязковий' });
      const data = await insertArticle(row);
      return res.status(201).json({ article: toArticle(data) });
    }

    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ error: 'ID новини не вказаний' });

    if (req.method === 'PUT') {
      const row = fromArticle(req.body || {});
      const data = await updateArticle(id, row);
      if (!data) return res.status(404).json({ error: 'Новину не знайдено' });
      return res.status(200).json({ article: toArticle(data) });
    }

    if (req.method === 'DELETE') {
      await deleteArticle(id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('articles API error', error);
    return res.status(error?.status === 401 || error?.status === 403 ? error.status : 500).json({ error: error?.message || 'Помилка сервера' });
  }
}
