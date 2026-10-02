import { createHmac, timingSafeEqual } from 'node:crypto';

const fallbackEmail = 'denys20smm@gmail.com';

export function adminEmail() {
  return (process.env.ADMIN_EMAIL || fallbackEmail).trim().toLowerCase();
}

export function adminPassword() {
  const value = process.env.ADMIN_PASSWORD;
  if (!value) throw new Error('ADMIN_PASSWORD не налаштований у Vercel Environment Variables.');
  return value;
}

function sessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error('SESSION_SECRET не налаштований у Vercel Environment Variables.');
  return value;
}

export function makeToken(email: string) {
  const payload = `${email.toLowerCase()}:${Date.now()}`;
  const signature = createHmac('sha256', sessionSecret()).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

export function validToken(token: string | undefined) {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    const [email, timestamp, signature] = parts;
    if (email !== adminEmail()) return false;
    const age = Date.now() - Number(timestamp);
    if (!Number.isFinite(age) || age < 0 || age > 7 * 24 * 60 * 60 * 1000) return false;
    const expected = createHmac('sha256', sessionSecret()).update(`${email}:${timestamp}`).digest('hex');
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
