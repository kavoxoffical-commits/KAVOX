import sys,os,shutil
from playwright.sync_api import sync_playwright
P=sys.argv[1]=='p'
W,H=(800,1000) if P else (1280,720)
FPS=30; N=int(30*24.4)
d='frames2p' if P else 'frames2'
shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':W,'height':H})
    pg.goto('http://localhost:8012/demo2.html'+('?p=1' if P else '')); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(1200)
    pg.evaluate("document.documentElement.style.width='%dpx';document.documentElement.style.height='%dpx'"%(W,H))
    pg.evaluate('initDemo()'); pg.wait_for_timeout(500)
    for i in range(N):
        pg.evaluate(f'render({i/FPS})')
        pg.screenshot(path=f'{d}/f{i:04d}.jpg',type='jpeg',quality=95)
    pg.evaluate('render(8.8)'); pg.screenshot(path=f'poster_{"p" if P else "d"}.png')
    b.close()
print('frames',N)
