// api/config.js
// KAVOX — Secure config endpoint. Returns Supabase public credentials from env vars.
//
// ⚠️ مهم: تأكد إن CONFIG_SECRET موجود بـ Vercel Environment Variables
//    (موجود فعلاً بحسابك ✓)

// ── ALLOWED ORIGINS ───────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://kavox-zeta.vercel.app',
  'https://kavox.vercel.app',
  // أضف دومينك المخصص هنا لو عندك واحد
];

export default async function handler(req, res) {

  // ── CORS (مقيّد لدومين KAVOX فقط) ───────────────────────────────
  const origin = req.headers['origin'];
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-internal-token');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── TOKEN CHECK (من environment variable، مش hardcoded) ──────────
  const expectedToken = process.env.CONFIG_SECRET;
  if (!expectedToken) {
    console.error('INTERNAL_TOKEN environment variable not set');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const token = req.headers['x-internal-token'];
  if (!token || token !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ── RETURN ENV VARS ────────────────────────────────────────────
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY; // anon/public key فقط، مش service key

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase env vars not configured' });
  }

  return res.status(200).json({ supabaseUrl, supabaseKey });
}
