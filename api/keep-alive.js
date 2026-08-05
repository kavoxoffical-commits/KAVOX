// api/keep-alive.js — Prevents Supabase free-tier auto-pause by pinging the DB periodically.
// Only callable by Vercel Cron (protected by CRON_SECRET env var). Not exposed to the browser.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Only Vercel Cron (which sends this header automatically when CRON_SECRET is set) may call this.
  const authHeader = req.headers['authorization'];
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const r = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    });
    return res.status(200).json({ ok: true, supabaseStatus: r.status, checkedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Keep-alive ping failed:', err);
    return res.status(500).json({ ok: false, error: 'Ping failed' });
  }
}
