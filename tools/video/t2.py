import sys
from playwright.sync_api import sync_playwright
from PIL import Image
P=len(sys.argv)>1 and sys.argv[1]=='p'
W,H=(800,1000) if P else (1280,720)
ts=[0.7,1.6,2.5,4.4,5.5,7.4,9.9,10.6,13.0,14.3,16.2,17.9,19.5,20.5,21.7,22.6]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':W,'height':H})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto('http://localhost:8012/demo2.html'+('?p=1' if P else '')); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(900)
    pg.evaluate("document.documentElement.style.width='%dpx';document.documentElement.style.height='%dpx'"%(W,H))
    pg.evaluate('initDemo()'); pg.wait_for_timeout(400)
    fs=[]
    for t in ts:
        pg.evaluate(f'render({t})'); pg.wait_for_timeout(120); f=f'/home/claude/demo/v2_{t}.png'; pg.screenshot(path=f); fs.append(f)
    print('errs',errs[:4]); b.close()
cols=4; sc=0.33 if not P else 0.30
ims=[Image.open(f).resize((int(W*sc*(1 if not P else 1)),int(H*sc))) for f in fs]
w,h=ims[0].size
sheet=Image.new('RGB',(cols*(w+6)+6,4*(h+6)+6),'#444')
for i,im in enumerate(ims): sheet.paste(im,(6+(i%cols)*(w+6),6+(i//cols)*(h+6)))
sheet.save('/home/claude/demo/v2_sheet%s.png'%('_p' if P else '')); print(sheet.size)
