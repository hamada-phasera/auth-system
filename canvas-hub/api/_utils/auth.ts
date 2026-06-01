import type { VercelRequest, VercelResponse } from '@vercel/node';

export function authenticate(req: VercelRequest, res: VercelResponse): boolean {
  const apiKey = process.env.API_SECRET_KEY;
  // If no API key is configured, allow all requests (dev mode)
  if (!apiKey) return true;

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== apiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
