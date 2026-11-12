"""Extract escHtml + the photo helpers + buildCVFromTemplate() from build.html into engine.js,
so render.html can render every template (old and new) with sample data, exactly like the builder does."""
L = open('../../build.html', encoding='utf-8', errors='replace').read().split('\n')
start = [i for i, l in enumerate(L) if l.startswith('const KV_PHOTO_OLD')][0]
fs = [i for i, l in enumerate(L) if l.startswith('function buildCVFromTemplate(')][0]
end = [i for i in range(fs, fs + 900) if L[i] == '}'][0]
esc = [i for i, l in enumerate(L) if l.startswith('function escHtml')][0]
open('engine.js', 'w').write('\n'.join(L[esc:esc + 3]) + '\n' + '\n'.join(L[start:end + 1]) + '\n')
print('engine.js written, lines', end - start)
