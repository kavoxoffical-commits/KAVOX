import sys
from playwright.sync_api import sync_playwright
from PIL import Image
feat=sys.argv[1]; P=len(sys.argv)>2 and sys.argv[2]=='p'
TS={'ats':[1.2,2.6,4.4,5.9,7.6,9.0,10.8,12.0,13.2,15.0],'languages':[0.9,2.4,4.6,6.2,8.6,11.0,13.4,14.8,16.3],'linkedin':[1.9,3.9,5.6,8.4,10.2,11.2,12.6,14.5],'cover':[1.5,4.6,7.4,10.4,12.0,13.5],'edit':[1.6,3.0,4.2,5.2,7.5,9.8,11.5],'export':[1.5,4.2,6.0,8.0,10.0],'interview':[1.0,4.4,6.8,8.8,11.0,14.0],'tailor':[1.5,3.5,5.0,7.5,10.8,14.0],'writing':[1.5,3.0,5.0,7.5,9.0,12.0]}[feat]
W,H=(800,1000) if P else (1280,720)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':W,'height':H})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://localhost:8012/clip.html?f={feat}'+('&p=1' if P else '')); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(900)
    pg.evaluate("document.documentElement.style.width='%dpx';document.documentElement.style.height='%dpx'"%(W,H))
    pg.evaluate('initClip()'); pg.wait_for_timeout(300)
    fs=[]
    for t in TS:
        pg.evaluate(f'render({t})'); pg.wait_for_timeout(100); f=f'/home/claude/demo/c_{feat}_{t}.png'; pg.screenshot(path=f); fs.append(f)
    print('errs',errs[:5]); b.close()
cols=4 if not P else 5; sc=0.33 if not P else 0.24
ims=[Image.open(f).resize((int(W*sc),int(H*sc))) for f in fs]
w,h=ims[0].size; rows=(len(ims)+cols-1)//cols
sheet=Image.new('RGB',(cols*(w+6)+6,rows*(h+6)+6),'#444')
for i,im in enumerate(ims): sheet.paste(im,(6+(i%cols)*(w+6),6+(i//cols)*(h+6)))
sheet.save(f'/home/claude/demo/c_{feat}{"_p" if P else ""}.png'); print(sheet.size)
