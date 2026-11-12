import sys,json
from playwright.sync_api import sync_playwright
from PIL import Image
NAMES=['The Minimalist','The Executive Clean','The Modern Slate','The Classic Serif','The Soft Tech','Royal Dark Mode','Crimson Career','The Visionary','Onyx Office','Golden Graph','Royal Grid','Sapphire Showcase','Gilded Grid','The Charcoal Signature','The Obsidian Scroll','The Sapphire Sultan','The Elite Emblem','The Marble Monarch','The Royal Parchment','The Celestial Signature']
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':794,'height':1123},device_scale_factor=1.5)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8013/render.html'); pg.wait_for_timeout(300)
    for i,n in enumerate(NAMES):
        h=pg.evaluate(f"renderT({json.dumps(n)},{i%6})")
        pg.wait_for_timeout(80)
        slug=n.lower().replace('the ','').replace(' ','-')
        pg.screenshot(path=f'raw_{i:02d}.png',clip={'x':0,'y':0,'width':794,'height':1123})
        print(i,n,'content h',h)
    b.close(); print('errs',errs)
sheet=Image.new('RGB',(5*300+40,4*424+30),'#444')
for i in range(20):
    im=Image.open(f'raw_{i:02d}.png').resize((290,410)); sheet.paste(im,(10+(i%5)*300,10+(i//5)*424))
sheet.save('sheet_all.png')
