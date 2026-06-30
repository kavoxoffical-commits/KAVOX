// api/contact.js — KAVOX Support Contact via Resend

const ALLOWED_ORIGINS = [
  'https://kavox-zeta.vercel.app',
  'https://kavox.vercel.app',
];

export default async function handler(req, res) {
  const origin = req.headers['origin'];
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }

  const { name, email, message } = body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });

  const key = process.env.RESEND_KEY;
  if (!key) return res.status(500).json({ error: 'Mail service not configured' });

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        from: 'KAVOX Support <onboarding@resend.dev>',
        to: ['kavoxoffical@gmail.com'],
        reply_to: email,
        subject: `KAVOX Support: ${name}`,
        html: `
          <h2>New Support Message — KAVOX</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      })
    });

    if (!r.ok) throw new Error('Resend failed');
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
