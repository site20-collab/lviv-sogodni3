import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminEmail, adminPassword, makeToken } from '../lib/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body || {};
  if (String(email || '').trim().toLowerCase() !== adminEmail() || String(password || '') !== adminPassword()) {
    return res.status(401).json({ error: 'Невірний email або пароль' });
  }
  return res.status(200).json({ ok: true, email: adminEmail(), token: makeToken(adminEmail()) });
}
