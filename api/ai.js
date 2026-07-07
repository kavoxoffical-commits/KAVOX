// api/ai.js
// KAVOX — Secure AI proxy. Keys are in Vercel environment variables.

// ── RATE LIMITING (in-memory, resets on cold start) ──────────────
// For production: replace with Supabase-based rate limiting (see comment below)
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 1000;       // max requests — مفتوح مؤقتًا للتجربة، نرجع نضبطه بعدين
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const MAX_PROMPT_LENGTH = 8000; // max characters in prompt

function getRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
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

  // ── RATE LIMITING ─────────────────────────────────────────────────
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown';

  const { allowed, remaining } = getRateLimit(ip);
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', remaining);

  if (!allowed) {
    return res.status(429).json({
      error: 'Too many requests. Please wait before trying again.',
      retryAfter: '1 hour'
    });
  }

  // ── PARSE BODY ────────────────────────────────────────────────────
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); }
    catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }

  const { provider, prompt, systemPrompt, userData } = body || {};

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
