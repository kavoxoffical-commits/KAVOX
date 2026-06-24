// api/config.js
// Securely exposes PUBLIC Supabase credentials to the frontend.
// The Supabase "anon" key is designed to be public — protection comes from
// Row Level Security (RLS) policies on the database tables, not from hiding this key.
// We still restrict CORS to our own domain to avoid casual scraping/abuse.

const ALLOWED_ORIGINS = [
  'https://kavox-zeta.vercel.app',
  'https://kavox-kavox-s-projects.vercel.app',
  'https://kavox-git-main-kavox-s-projects.vercel.app'
];

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  return res.status(200).json({
    supabaseUrl,
    supabaseKey
  });
};
