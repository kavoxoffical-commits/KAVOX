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

## Still to do
- Test 1 and 2 with a real account, then merge.
- ATS: honest "re-check" after the user adds a missing keyword (read the scoring code first; add a note "only add skills you really have").
- Export video says `.docx` but the site downloads `.doc`: fix the video.
- Re-check every feature video against the real UI and re-record the wrong ones (language chip, ATS re-check, extras cards).
- Check the Refiner path (uploaded CV) for the same language-detection gap.
- Last: real licensed portrait photos for the previews (owner must supply licensed photos).

## Gotchas
- No GitHub tool in chat: pushing needs a short-lived fine-grained token from the owner (Contents: read/write on this repo). Revoke it afterwards.
- AI generation cannot be run from the sandbox, so full end-to-end generation was never tested there.
