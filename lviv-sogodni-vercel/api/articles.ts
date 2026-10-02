import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getArticles, setArticles, nextId, type Article } from '../lib/news';

const allowed = (req: VercelRequest) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i,'');
  return token && process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return res.status(200).json({ articles: getArticles() });
  if (!allowed(req)) return res.status(403).json({ error: 'Admin access required' });

  if (req.method === 'POST') {
    const b = req.body || {};
    const article: Article = {
      id: nextId(), title: String(b.title||'').trim(), excerpt:String(b.excerpt||''),
      category:String(b.category||'Львів'), author:String(b.author||'Редакція'),
      publishedAt:b.publishedAt||new Date().toISOString(), body:String(b.body||''),
      status:b.status==='draft'?'draft':'published', featured:Boolean(b.featured),
      tags:Array.isArray(b.tags)?b.tags:[], slug:String(b.slug||b.title||'').toLowerCase().replace(/[^a-z0-9а-яіїєґ\s-]/gi,'').replace(/\s+/g,'-'),
      imageUrl:b.imageUrl||'', seoTitle:b.seoTitle||b.title, seoDescription:b.seoDescription||b.excerpt
    };
    setArticles([article,...getArticles()]);
    return res.status(201).json({article});
  }

  if (req.method === 'PUT') {
    const id = String(req.query.id || '');
    const b=req.body||{};
    const current=getArticles().find(a=>a.id===id);
    if(!current) return res.status(404).json({error:'Not found'});
    const updated={...current,...b,id};
    setArticles(getArticles().map(a=>a.id===id?updated:a));
    return res.status(200).json({article:updated});
  }

  if (req.method === 'DELETE') {
    const id=String(req.query.id||'');
    setArticles(getArticles().filter(a=>a.id!==id));
    return res.status(200).json({ok:true});
  }
  return res.status(405).end();
}
