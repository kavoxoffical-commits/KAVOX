# tools/ : production sources (not part of the website)

Everything here was used to *make* assets and to *test* the site. None of it is deployed:
`build.js` skips this folder, so it never reaches `dist/`.

The scripts were written inside a sandbox, so many of them still contain absolute paths such as
`/home/claude/...` and `http://localhost:8011`. Search and replace them for your machine before running.

## Requirements
- Python 3 with `playwright` (`pip install playwright && playwright install chromium`) and `Pillow`, `numpy`
- `ffmpeg` (H.264 + VP9)
- Node 18+
- GSAP files for the page tests: `npm pack gsap@3.12.5`, then use `package/dist/gsap.min.js` and `ScrollTrigger.min.js`
  (the tests answer the CDN requests with these local copies because the sandbox blocks the CDN)

## video/
Deterministic animations: every frame is a pure function of time (`render(t)`), screenshotted one by one,
then encoded. That keeps the result identical on every run.
- `demo2.html`: the big homepage demo (24 s). `?p=1` = phone (portrait) layout. Finale = logo reveal (no sparks).
- `clip.html`: the nine feature explainers. `?f=ats|languages|linkedin|cover|edit|export|interview|tailor|writing`, `&p=1` for phone.
- `cap2.py` (big demo) and `cap_clip.py` (feature clips): record frames. `t2.py` / `tclip.py`: contact sheets of test frames.
- Encode: `ffmpeg -framerate 30 -i frames/f%04d.jpg -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart -an out.mp4`
  and the same with `-c:v libvpx-vp9 -crf 35 -b:v 0` for the WebM fallback.
- `seg0-3.png`, `logo_mask.png`, `segs.json`: the logo cut into K / AV / compass-O / X for the reveal. `fonts/`: Inter, Playfair, Noto Sans Arabic.
- Content in the clips is fictional and labelled "Illustrative sample". Check each clip against the real UI before re-using it
  (see NOTES.md: Export says .docx, the site downloads .doc).

## templates/
- `extract_engine.py` pulls the real `buildCVFromTemplate()` out of `build.html` into `engine.js`.
- `render.html` + `people.js`, `people2.js`, `fill.js`, `photos.js`: 12 fictional personas with portraits; `make_all68.py` renders every template
  with the same function the builder uses and writes the gallery webp files plus the hero CV images.
- `avatars2.py` draws the 12 illustrated portraits (`avatars_v1.py` is the older set). They are drawings, not photographs.
- Needs `kavox-templates.js` next to `render.html` (copy it from the repo root).

## tests/
`e2e.py` (builder + gallery + engine), `photo_e2e.py` (upload flow), `fix_test.py` (saved-CV view and day mode with a mocked Supabase),
`cmp_pages.py` (source vs minified build, screenshot diff), `langdetect.js` + `ld_test*.js` (language detector), `scroll_shots.py`, `hero_shot.py`, `vid_test.py`, `audit.py` (contrast audit).
