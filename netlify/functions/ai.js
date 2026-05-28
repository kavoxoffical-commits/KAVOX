// netlify/functions/ai.js
// KAVOX — Secure AI proxy. Keys are in Netlify environment variables.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { provider, prompt, systemPrompt } = body;
  if (!prompt) return { statusCode: 400, body: JSON.stringify({ error: 'Missing prompt' }) };

  const HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    let text = '';

    // ── GEMINI ───────────────────────────────────────────────────
    if (!provider || provider === 'gemini') {
      const key = process.env.GEMINI_KEY;
      if (!key) throw new Error('GEMINI_KEY not set');

      // Combine systemPrompt + prompt for Gemini (no native system role)
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${prompt}` : prompt;

      const res = await fetch(
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
      if (res.status === 429 || res.status === 403) throw new Error('LIMIT');
      if (!res.ok) throw new Error('GEMINI_ERROR');
      const data = await res.json();
      text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // ── OPENROUTER ───────────────────────────────────────────────
    } else if (provider === 'openrouter') {
      const key = process.env.OPENROUTER_KEY;
      if (!key) throw new Error('OPENROUTER_KEY not set');

      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': 'https://kavox.netlify.app',
          'X-Title': 'KAVOX CV Generator'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages,
          max_tokens: 2048,
          temperature: 0.7
        })
      });
      if (res.status === 429 || res.status === 403) throw new Error('LIMIT');
      if (!res.ok) throw new Error('OPENROUTER_ERROR');
      const data = await res.json();
      text = data?.choices?.[0]?.message?.content || '';

    // ── GROQ ─────────────────────────────────────────────────────
    } else if (provider === 'groq') {
      const key = process.env.GROQ_KEY;
      if (!key) throw new Error('GROQ_KEY not set');

      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
      if (res.status === 429 || res.status === 403) throw new Error('LIMIT');
      if (!res.ok) throw new Error('GROQ_ERROR');
      const data = await res.json();
      text = data?.choices?.[0]?.message?.content || '';

    } else {
      throw new Error('Unknown provider: ' + provider);
    }

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ text }) };

  } catch (err) {
    const isLimit = err.message === 'LIMIT';
    return {
      statusCode: isLimit ? 429 : 500,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
