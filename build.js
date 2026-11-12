/* KAVOX build: copies the static site to dist/ and shrinks it.
 * - HTML: whitespace/comments removed, inline CSS and JS minified (top-level names are kept,
 *   so inline onclick handlers keep working)
 * - the logo that was embedded as base64 in every page becomes one cached file (assets/logo.webp)
 * - root .js files are minified
 * Sources in the repo stay readable; only dist/ (what Vercel serves) is minified. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { minify: minifyHtml } = require('html-minifier-terser');
const { minify: terser } = require('terser');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
const SKIP = new Set(['api', 'dist', 'node_modules', '.git', '.gitignore', 'package.json', 'package-lock.json', 'build.js', 'vercel.json', 'NOTES.md', 'tools']);

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name), d = path.join(dst, name);
    if (src === ROOT && SKIP.has(name)) continue;
    const st = fs.statSync(s);
    if (st.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

// the logo is the only embedded image; find its base64 form so it can be swapped for the file
const LOGO_B64 = (() => {
  const m = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  return m ? m[0] : null;
})();

const htmlOpts = {
  collapseWhitespace: true,
  conservativeCollapse: true,   // keep one space where whitespace separates inline items
  removeComments: true,
  minifyCSS: true,
  minifyJS: { compress: { passes: 1 }, mangle: true, format: { comments: false } }
};

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  copyDir(ROOT, OUT);
  let before = 0, after = 0, swapped = 0;
  for (const name of fs.readdirSync(OUT)) {
    const f = path.join(OUT, name);
    if (!fs.statSync(f).isFile()) continue;
    if (name.startsWith('google') && name.endsWith('.html')) continue;   // site-verification file: untouched
    if (name.endsWith('.html')) {
      let s = fs.readFileSync(f, 'utf8'); before += Buffer.byteLength(s);
      if (LOGO_B64) { const n = s.split(LOGO_B64).length - 1; swapped += n; s = s.split(LOGO_B64).join('assets/logo.webp'); }
      s = await minifyHtml(s, htmlOpts);
      fs.writeFileSync(f, s); after += Buffer.byteLength(s);
    } else if (name.endsWith('.js')) {
      const s = fs.readFileSync(f, 'utf8'); before += Buffer.byteLength(s);
      const r = await terser(s, { compress: true, mangle: true, format: { comments: false } });
      fs.writeFileSync(f, r.code); after += Buffer.byteLength(r.code);
    }
  }
  console.log('built dist/: ' + (before / 1024 | 0) + 'KB -> ' + (after / 1024 | 0) + 'KB (' + Math.round((1 - after / before) * 100) + '% smaller), logo files swapped: ' + swapped);
})().catch(e => { console.error(e); process.exit(1); });
