// api/ai.js
// KAVOX — Secure AI proxy. Keys are in Vercel environment variables.

// ── RATE LIMITING (persistent, Supabase-backed — survives cold starts) ──
// Single unified limit for now (no paid tiers exist yet). Revisit when payment ships.
const RATE_LIMIT_MAX = 15;                 // requests per identity per window
const RATE_LIMIT_WINDOW_SECONDS = 24 * 60 * 60; // 24 hours
const MAX_PROMPT_LENGTH = 8000; // max characters in prompt

async function getRateLimit(identity, requestId) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Rate limiting disabled: missing SUPABASE_URL/SUPABASE_KEY');
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }

  try {
    const r = await fetch(`${supabaseUrl}/rest/v1/rpc/check_rate_limit_dedup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        p_identity: identity,
        p_request_id: requestId,
        p_max: RATE_LIMIT_MAX,
        p_window_seconds: RATE_LIMIT_WINDOW_SECONDS
      })
    });
    if (!r.ok) {
      console.error('Rate limit check failed:', r.status, await r.text());
      return { allowed: true, remaining: RATE_LIMIT_MAX }; // fail-open
    }
    const rows = await r.json();
    const row = Array.isArray(rows) ? rows[0] : rows;
    return { allowed: !!row?.allowed, remaining: row?.remaining ?? 0 };
  } catch (err) {
    console.error('Rate limit check error:', err.message);
    return { allowed: true, remaining: RATE_LIMIT_MAX }; // fail-open
  }
}

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── PARSE BODY ────────────────────────────────────────────────────
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); }
    catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }

  const { provider, prompt, systemPrompt, userData, requestId } = body || {};

  // ── RATE LIMITING ─────────────────────────────────────────────────
  // Prefer logged-in user_id (stable identity); fall back to IP for guests
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown';
  const identity = (userData && userData.user_id) ? `user:${userData.user_id}` : `ip:${ip}`;
  // requestId groups provider-fallback retries of the SAME generation attempt so they only
  // consume one slot from the daily limit. Falls back to a random id (no dedup) if the client
  // didn't send one — never trust the client to skip the check, only to group retries.
  const effectiveRequestId = (typeof requestId === 'string' && requestId.length > 0)
    ? requestId
    : `${identity}:${Date.now()}:${Math.random()}`;

  const { allowed, remaining } = await getRateLimit(identity, effectiveRequestId);
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', remaining);

  if (!allowed) {
    return res.status(429).json({
      error: 'Too many requests. Please wait before trying again.',
      retryAfter: '24 hours'
    });
  }

  // ── VALIDATE PROMPT ───────────────────────────────────────────────
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  if (typeof prompt !== 'string') return res.status(400).json({ error: 'Invalid prompt' });
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: `Prompt too long (max ${MAX_PROMPT_LENGTH} characters)` });
  }
  if (systemPrompt && systemPrompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: 'System prompt too long' });
  }

  // ── VALIDATE USER DATA (اختياري، لكن لو موجود لازم يكون صحيح) ────
  if (userData) {
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (userData.name && userData.name.length > 200) {
      return res.status(400).json({ error: 'Name too long' });
    }
  }

  try {
    let text = '';

    // ── GEMINI ────────────────────────────────────────────────────
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

    // ── OPENROUTER ────────────────────────────────────────────────
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
          'HTTP-Referer': 'https://kavox-zeta.vercel.app',
          'X-Title': 'KAVOX CV Generator'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages,
          max_tokens: 2048,
          temperature: 0.7
        })
      });
      if (r.status === 429 || r.status === 403) throw new Error('LIMIT');
      if (!r.ok) throw new Error('OPENROUTER_ERROR');
      const data = await r.json();
      text = data?.choices?.[0]?.message?.content || '';

    // ── GROQ ──────────────────────────────────────────────────────
    } else if (provider === 'groq') {
      const key = process.env.GROQ_KEY;
      if (!key) throw new Error('GROQ_KEY not set');
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          max_tokens: 2048,
          temperature: 0.7
        })
      });
      if (r.status === 429 || r.status === 403) throw new Error('LIMIT');
      if (!r.ok) throw new Error('GROQ_ERROR');
      const data = await r.json();
      text = data?.choices?.[0]?.message?.content || '';

    } else {
      return res.status(400).json({ error: 'Unknown provider: ' + provider });
    }

    if (!text) {
      return res.status(500).json({ error: 'Empty response from AI provider' });
    }

   

    return res.status(200).json({ text });

  } catch (err) {
    const isLimit = err.message === 'LIMIT';
    return res.status(isLimit ? 429 : 500).json({ error: err.message });
  }
}
