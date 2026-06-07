// api/ai.js
// KAVOX — Secure AI proxy. Keys are in Vercel environment variables.

export default async function handler(req, res) {

  // ── CORS ─────────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;

  if (typeof body === 'string') {
    try { body = JSON.parse(body); }
    catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }

  const { provider, prompt, systemPrompt, userData } = body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    let text = '';

    if (!provider || provider === 'gemini') {
      const key = process.env.GEMINI_KEY;
      if (!key) throw new Error('GEMINI_KEY not set');
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${prompt}` : prompt;
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
          })
        }
      );
      if (r.status === 429 || r.status === 403) throw new Error('LIMIT');
      if (!r.ok) throw new Error('GEMINI_ERROR');
      const data = await r.json();
      text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    } else if (provider === 'openrouter') {
      const key = process.env.OPENROUTER_KEY;
      if (!key) throw new Error('OPENROUTER_KEY not set');
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': 'https://kavox.vercel.app',
          'X-Title': 'KAVOX CV Generator'
        },
        body: JSON.stringify({ model: 'google/gemini-2.0-flash-001', messages, max_tokens: 2048, temperature: 0.7 })
      });
      if (r.status === 429 || r.status === 403) throw new Error('LIMIT');
      if (!r.ok) throw new Error('OPENROUTER_ERROR');
      const data = await r.json();
      text = data?.choices?.[0]?.message?.content || '';

    } else if (provider === 'groq') {
      const key = process.env.GROQ_KEY;
      if (!key) throw new Error('GROQ_KEY not set');
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 2048, temperature: 0.7 })
      });
      if (r.status === 429 || r.status === 403) throw new Error('LIMIT');
      if (!r.ok) throw new Error('GROQ_ERROR');
      const data = await r.json();
      text = data?.choices?.[0]?.message?.content || '';

    } else {
      throw new Error('Unknown provider: ' + provider);
    }

    // ── SAVE TO SUPABASE ─────────────────────────────────────────
    try {
      const sbUrl = process.env.SUPABASE_URL;
      const sbKey = process.env.SUPABASE_KEY;
      if (sbUrl && sbKey && userData) {
        await fetch(`${sbUrl}/rest/v1/cvs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': sbKey,
            'Authorization': `Bearer ${sbKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            name:     userData.name     || null,
            email:    userData.email    || null,
            language: userData.language || null,
            tier:     userData.tier     || 'free',
            cv_html:  text
          })
        });
      }
    } catch (sbErr) {
      console.warn('Supabase save failed:', sbErr.message);
    }

    return res.status(200).json({ text });

  } catch (err) {
    const isLimit = err.message === 'LIMIT';
    return res.status(isLimit ? 429 : 500).json({ error: err.message });
  }
}
