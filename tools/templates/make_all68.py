import json,os,re
from playwright.sync_api import sync_playwright
from PIL import Image
OUT='/home/claude/kavox/assets/templates'; os.makedirs(OUT,exist_ok=True)
slug=lambda n:re.sub(r'[^a-z0-9]+','-',n.lower().strip()).strip('-')
OLD=['The Minimalist','The Executive Clean','The Modern Slate','The Classic Serif','The Soft Tech','Royal Dark Mode','Crimson Career','The Visionary','Onyx Office','Golden Graph','Royal Grid','Sapphire Showcase','Gilded Grid','The Charcoal Signature','The Obsidian Scroll','The Sapphire Sultan','The Elite Emblem','The Marble Monarch','The Royal Parchment','The Celestial Signature']
PH_OLD={'The Minimalist','The Modern Slate','The Soft Tech','The Visionary','Sapphire Showcase','The Charcoal Signature','The Elite Emblem'}
dims={}; photo={}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':794,'height':1123},device_scale_factor=1.6)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8013/render.html'); pg.wait_for_timeout(500)
    new=pg.evaluate("KVX.names()")
    allnames=OLD+new
    for i,n in enumerate(allnames):
        pi=i%12
        h=pg.evaluate(f"renderT({json.dumps(n)},{pi})"); h=int(min(1123,round(h)))
        pg.wait_for_timeout(60)
        f=f'/home/claude/tpl/new/all_{i:02d}.png'
        pg.screenshot(path=f,clip={'x':0,'y':0,'width':794,'height':h})
        im=Image.open(f).convert('RGB'); w=640; hh=round(im.height*w/im.width)
        im.resize((w,hh),Image.LANCZOS).save(f'{OUT}/{slug(n)}.webp',quality=82,method=6)
        dims[n]=[w,hh]
        photo[n]= (n in PH_OLD) or pg.evaluate(f"KVX.has({json.dumps(n)}) && KVX.hasPhoto({json.dumps(n)})")
    # hero images with photo
    pg2=b.new_page(viewport={'width':794,'height':1123},device_scale_factor=2)
    pg2.goto('http://localhost:8013/render.html'); pg2.wait_for_timeout(400)
    for hn,persona,fn in [('The Modern Slate',0,'cv-main'),('Sapphire Showcase',1,'cv-left'),('The Soft Tech',4,'cv-right')]:
        h=pg2.evaluate(f"renderT({json.dumps(hn)},{persona})"); h=int(min(1123,round(h)))
        pg2.screenshot(path=f'/home/claude/tpl/new/{fn}.png',clip={'x':0,'y':0,'width':794,'height':h})
    b.close(); print('errs',errs[:3])
json.dump({'dims':dims,'photo':photo},open('/home/claude/tpl/meta68.json','w'))
print(len(dims),'images;',sum(photo.values()),'photo templates')
# hero webps
for fn,w in [('cv-main',880),('cv-left',620),('cv-right',620)]:
    im=Image.open(f'/home/claude/tpl/new/{fn}.png').convert('RGB'); hh=round(im.height*w/im.width)
    im.resize((w,hh),Image.LANCZOS).save(f'/home/claude/kavox/assets/hero/{fn}.webp',quality=86,method=6); print(fn,w,hh)
# contact sheet of the photo ones
ph=[n for n in dims if photo[n]]
cols=6; W=200; H=270
rows=(len(ph)+cols-1)//cols
sheet=Image.new('RGB',(cols*(W+6)+6,rows*(H+6)+6),'#444')
names=OLD+new
for k,n in enumerate(ph):
    im=Image.open(f'/home/claude/tpl/new/all_{names.index(n):02d}.png').convert('RGB'); im.thumbnail((W,H)); sheet.paste(im,(6+(k%cols)*(W+6),6+(k//cols)*(H+6)))
sheet.save('/home/claude/tpl/new/photo_sheet.png'); print(sheet.size,len(ph))
