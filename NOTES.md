# KAVOX: project state (written so a new chat can pick up where the last one stopped)

Owner: solo developer (Arabic speaker). Wants: direct step-by-step work, act autonomously, blunt feedback, nothing pushed to `main` before it was tested (previews are branch deployments on Vercel).

## Live on `main` (as of commit 63c7e93)
- 68 templates in the builder: 20 original (in `build.html`, `buildCVFromTemplate`) + 48 from `kavox-templates.js` (parametric engine, registry at the top). Tiers: Pro 19, Royal 25, Elite 24.
- Photo upload in the builder (crop + downscale, memory only, never sent to the AI). 35 templates have a photo slot; the others say they are no-photo designs. Previews use illustrated portraits (not real people).
- Day/night mode: `kavox-theme.js` (full-page invert filter, media flipped back). Toggle sits in the nav / hamburger.
- Language: `kvDetectLang()` in `build.html` detects Latin-script languages (before this only non-Latin scripts were detected, so German/Spanish/French input produced an English CV). Live chip + dropdown of 25 languages.
- Videos: homepage demo (`assets/hero-demo*.mp4/webm`, desktop + phone cuts) and one explainer per feature page (`assets/features/*`). Built from deterministic HTML (`demo2.html` / `clip.html`, recorded frame by frame). Not in the repo: those source files live only in the chat sandbox.
- Build: Vercel runs `npm run build` (`build.js`) which minifies HTML/JS and swaps the embedded logo for `assets/logo.webp`. Sources stay readable. Do not delete `package.json` or `build.js`.

## Unfinished work on branch `fix-theme-saved` (NOT on main, NOT tested on a real login)
1. Day mode now covers `build.html` (script tag added) and protects user content: `<img>`, `<video>`, `<canvas>`, `<iframe>`, any element whose inline style has `url(` (account avatar is a div with `background-image`), and `#cv-output`. Printing and PDF export disable the filter. Media undo filter was re-derived so photos keep their true colours (pure white tops out ~230).
2. `viewSavedCV(id)` was called by `build.html?view=ID` (the account page "View" button) but never defined, so the link only opened the empty form. Added: loads the row from `cvs` (RLS + `user_id`), hides the form steps, renders the result. Tested with a mocked Supabase client only.

## State at the end of the long session (main = b71f7c3, production READY)
Everything listed above under "Live on main" plus: day mode on the builder with protected photos/CV, saved-CV View fix, ATS "Check again" + generic-word filter + hyphenated compounds, language-name tables for Czech/Romanian/Malay/Thai, working hamburger menu on terms/privacy/refund/feature-linkedin, corrected feature videos (the LinkedIn phone mp4 had been corrupted and was re-encoded), sitemap with all 17 public pages + robots.txt, build step, and `tools/`.

## Known issues / decisions for the owner (found while auditing, NOT changed)
- Payments are not wired: the Stripe price ids in `build.html` are placeholders (`price_REPLACE_PRO` ...), tiers are only a UI choice, the server does not enforce them. A download writes a row to `kavox_orders` with status `paid` and the tier price although nothing was charged, so revenue data from that table is wrong.
- Pricing FAQ copy: says plans can be cancelled "from your account" (no such feature) and that Pro "gives you the full template library" (it unlocks 19 of 68).
- AI proxy (`api/ai.js`): 15 requests per 24 h per user/IP, 8000-char prompt, 2048 output tokens, CORS allows only kavox-zeta.vercel.app and kavox.vercel.app, so generation does not work on preview deployments. Providers: Gemini 2.5 Flash, falling back to OpenRouter, then Groq.
- Never tested: a full AI generation, the saved-CV View button and day mode on the account page with a real login.
- Six feature clips (cover letter, edit, interview, tailor, linkedin, writing) use simplified screens.
- Previews use illustrated portraits; real licensed photos are still to do.

## Sources of the generated assets
`tools/` holds the video recorder (`demo2.html`, `clip.html`), the template renderer and the tests. See `tools/README.md`. It is skipped by `build.js`, so it is not deployed.

## Gotchas
- No GitHub tool in chat: pushing needs a short-lived fine-grained token from the owner (Contents: read/write on this repo). Revoke it afterwards.
- AI generation cannot be run from the sandbox, so full end-to-end generation was never tested there.
