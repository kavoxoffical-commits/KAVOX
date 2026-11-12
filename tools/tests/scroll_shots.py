import sys
from playwright.sync_api import sync_playwright
from PIL import Image
G='/home/claude/vendor/package/dist/'
def run(page_name,w,h,theme,prefix,step,maxn=12):
    with sync_playwright() as p:
        b=p.chromium.launch()
        ctx=b.new_context(viewport={'width':w,'height':h})
        ctx.add_init_script(f"try{{localStorage.setItem('kavox-theme','{theme}')}}catch(e){{}}")
        def route(r):
            u=r.request.url
            if 'gsap.min.js' in u: r.fulfill(path=G+'gsap.min.js',content_type='application/javascript')
            elif 'ScrollTrigger.min.js' in u: r.fulfill(path=G+'ScrollTrigger.min.js',content_type='application/javascript')
            elif u.startswith('http://localhost'): r.continue_()
            else: r.abort()
        ctx.route('**/*',route)
        pg=ctx.new_page()
        pg.goto(f'http://localhost:8011/{page_name}',wait_until='load'); pg.wait_for_timeout(1500)
        H=pg.evaluate('document.documentElement.scrollHeight')
        files=[];y=0;i=0
        while y<H and i<maxn:
            pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(1300)
            f=f'{prefix}_{i}.png'; pg.screenshot(path=f); files.append(f); y+=step; i+=1
        b.close()
    # contact sheets of 4
    for s in range(0,len(files),4):
        ims=[Image.open(f) for f in files[s:s+4]]
        sheet=Image.new('RGB',(sum(i.width for i in ims)+10*(len(ims)-1),ims[0].height),'#777')
        x=0
        for im in ims: sheet.paste(im,(x,0)); x+=im.width+10
        sheet.save(f'{prefix}_sheet{s//4}.png')
    print(len(files),'shots, H',H)
a=sys.argv
run(a[1],int(a[2]),int(a[3]),a[4],a[5],int(a[6]))
