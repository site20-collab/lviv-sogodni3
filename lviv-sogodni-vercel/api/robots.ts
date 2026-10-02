import type { VercelRequest, VercelResponse } from '@vercel/node';
export default function handler(req: VercelRequest,res:VercelResponse){res.setHeader('Content-Type','text/plain; charset=utf-8');res.status(200).send('User-agent: *\nAllow: /\nSitemap: /sitemap.xml');}
