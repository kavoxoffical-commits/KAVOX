import sys,glob,os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops
import numpy as np
G='/home/claude/vendor/package/dist/'
pages=sys.argv[1].split(',')
FREEZE="*{animation:none!important;transition:none!important;caret-color:transparent!important} video{visibility:hidden!important}"
def shot(b,base,name,w,h,theme,out):
    ctx=b.new_context(viewport={'width':w,'height':h})
    ctx.add_init_script(f"try{{localStorage.setItem('kavox-theme','{theme}')}}catch(e){{}}")
    def route(r):
        u=r.request.url
        if 'gsap.min.js' in u: r.fulfill(path=G+'gsap.min.js',content_type='application/javascript')
        elif 'ScrollTrigger.min.js' in u: r.fulfill(path=G+'ScrollTrigger.min.js',content_type='application/javascript')
        elif u.startswith('http://localhost'): r.continue_()
        else: r.abort()
    ctx.route('**/*',route); pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'{base}/{name}',wait_until='load'); pg.add_style_tag(content=FREEZE); pg.wait_for_timeout(2500)
    H=pg.evaluate('document.documentElement.scrollHeight'); y=0
    while y<H: pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(120); y+=h//2
    pg.wait_for_timeout(1200); pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(600)
    pg.screenshot(path=out,full_page=True); ctx.close(); return errs,H
rows=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for name in pages:
        for (w,h,tag) in [(1280,800,'d'),(390,844,'m')]:
            for theme in ['dark','light'] if name in ('index.html','templates.html','pricing.html') else ['dark']:
                e1,h1=shot(b,'http://localhost:8015',name,w,h,theme,'/tmp/a.png'); e2,h2=shot(b,'http://localhost:8011',name,w,h,theme,'/tmp/b.png')
                A=Image.open('/tmp/a.png').convert('RGB'); B=Image.open('/tmp/b.png').convert('RGB')
                if A.size!=B.size: rows.append((name,tag,theme,'SIZE',A.size,B.size,e2)); print(rows[-1],flush=True); continue
                d=np.abs(np.asarray(A).astype(int)-np.asarray(B).astype(int)).max(axis=2); frac=(d>24).mean()
                rows.append((name,tag,theme,round(float(frac)*100,3),e1[:1],e2[:1])); print(rows[-1],flush=True)
    b.close()
