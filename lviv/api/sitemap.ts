import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getArticles } from '../lib/news';
export default function handler(req:VercelRequest,res:VercelResponse){const base=`https://${req.headers.host}`;const urls=getArticles().filter(a=>a.status==='published').map(a=>`<url><loc>${base}/?article=${encodeURIComponent(a.slug)}</loc><lastmod>${a.publishedAt}</lastmod></url>`).join('');res.setHeader('Content-Type','application/xml');res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);}
