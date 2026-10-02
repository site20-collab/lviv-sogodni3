import type { VercelRequest, VercelResponse } from '@vercel/node';
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  const adminEmail = (process.env.ADMIN_EMAIL || 'denys20smm@gmail.com').trim().toLowerCase();
  if (String(email||'').trim().toLowerCase() !== adminEmail || String(password||'') !== String(process.env.ADMIN_PASSWORD||'')) {
    return res.status(401).json({error:'Невірний email або пароль'});
  }
  return res.status(200).json({ok:true,email:adminEmail,token:process.env.ADMIN_PASSWORD});
}
