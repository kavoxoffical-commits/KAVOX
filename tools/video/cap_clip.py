import sys,os,shutil
from playwright.sync_api import sync_playwright
feat=sys.argv[1]; P=sys.argv[2]=='p'
W,H=(800,1000) if P else (1280,720)
Dm={'ats':15.8,'languages':17.3,'linkedin':15.2,'cover':16.4,'edit':14.6,'export':13.6,'interview':18.0,'tailor':19.0,'writing':16.2}[feat]
FPS=30; N=int(FPS*Dm)
d=f'fr_{feat}{"_p" if P else ""}'
shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':W,'height':H})
    pg.goto(f'http://localhost:8012/clip.html?f={feat}'+('&p=1' if P else '')); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(1000)
    pg.evaluate("document.documentElement.style.width='%dpx';document.documentElement.style.height='%dpx'"%(W,H))
    pg.evaluate('initClip()'); pg.wait_for_timeout(300)
    for i in range(N):
        pg.evaluate(f'render({i/FPS})'); pg.screenshot(path=f'{d}/f{i:04d}.jpg',type='jpeg',quality=95)
    b.close()
print(feat,'p' if P else 'd',N)
