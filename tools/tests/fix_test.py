import json,base64
from playwright.sync_api import sync_playwright
from PIL import Image
import numpy as np, io
G='/home/claude/vendor/package/dist/'
AV=json.load(open('/home/claude/tpl/av2/avatars.json'))[3]
MOCK="""
window.supabase={createClient:function(){return {
 auth:{getSession:async function(){return {data:{session:window.__NOSESS?null:{user:{id:'u1'}}}}},getUser:async function(){return {data:{user:{id:'u1'}}}},onAuthStateChange:function(){return {data:{subscription:{unsubscribe:function(){}}}}}},
 from:function(t){var q={select:function(){return q},eq:function(){return q},single:async function(){return window.__ROW||{data:{cv_html:'<div class="kv-cv" style="background:#fff;color:#111;padding:24px;font-family:Georgia"><h1>Saved Jane Doe</h1><p>Product Manager</p></div>',cv_data:{},tier:'pro',language:'English',name:'Jane'},error:null}}};return q}}}};
"""
def ctx_for(b,w=1280,h=900,mock=True):
    ctx=b.new_context(viewport={'width':w,'height':h})
    if mock: ctx.add_init_script(MOCK)
    def route(r):
        u=r.request.url
        if '/api/config' in u: r.fulfill(status=200,content_type='application/json',body='{"supabaseUrl":"https://x.supabase.co","supabaseKey":"k"}')
        elif 'gsap.min.js' in u: r.fulfill(path=G+'gsap.min.js',content_type='application/javascript')
        elif 'ScrollTrigger.min.js' in u: r.fulfill(path=G+'ScrollTrigger.min.js',content_type='application/javascript')
        elif u.startswith('http://localhost'): r.continue_()
        else: r.abort()
    ctx.route('**/*',route); return ctx
with sync_playwright() as p:
    b=p.chromium.launch()
    # ---- A) saved CV "View"
    ctx=ctx_for(b); pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); dlg=[]; pg.on('dialog',lambda d:(dlg.append(d.message),d.dismiss()))
    pg.goto('http://localhost:8011/build.html?view=7',wait_until='load'); pg.wait_for_timeout(2500)
    out=pg.evaluate("document.getElementById('cv-output').innerText")
    vis=pg.evaluate("(()=>{const e=document.getElementById('cv-output');const r=e.getBoundingClientRect();return r.width>100&&r.height>20&&getComputedStyle(e).visibility!=='hidden'&&e.offsetParent!==null})()")
    print('A1 view shows saved CV text:', 'Saved Jane Doe' in out, '| visible on screen:',vis,'| alerts:',dlg,'| errs:',errs)
    # not signed in -> login
    ctx2=ctx_for(b); p2=ctx2.new_page(); p2.add_init_script("window.__NOSESS=true"); p2.goto('http://localhost:8011/build.html?view=7',wait_until='domcontentloaded'); p2.wait_for_timeout(2500); print('A2 signed out goes to:',p2.url.split('/')[-1])
    # row missing -> friendly message, stays on builder
    ctx3=ctx_for(b); p3=ctx3.new_page(); d3=[]; p3.on('dialog',lambda d:(d3.append(d.message),d.dismiss())); p3.add_init_script("window.__ROW={data:null,error:{message:'nope'}}"); p3.goto('http://localhost:8011/build.html?view=999',wait_until='load'); p3.wait_for_timeout(2200); print('A3 missing CV message:',d3[:1])
    # ---- B) theme on the builder: toggle present, CV output keeps true colours
    ctx4=ctx_for(b); pb=ctx4.new_page(); eb=[]; pb.on('pageerror',lambda e:eb.append(str(e)))
    pb.goto('http://localhost:8011/build.html?view=7',wait_until='load'); pb.wait_for_timeout(2200)
    CVHTML="<div class='kv-cv' style='background:#fff;color:#222;padding:30px;width:500px'><div style='height:60px;background:#c0392b'></div><img src='"+AV+"' style='width:120px;height:120px;border-radius:50%;margin:10px'><h1>Colour check</h1></div>"
    pb.evaluate("(h)=>{document.getElementById('cv-output').innerHTML=h}",CVHTML)
    print('B1 toggle in builder nav:',pb.evaluate("!!document.querySelector('.kv-tg')"),'| script on page:',pb.evaluate("!!window.KavoxTheme"))
    def grab(theme):
        pb.evaluate(f"KavoxTheme.set('{theme}')"); pb.wait_for_timeout(700)
        el=pb.query_selector('#cv-output .kv-cv'); el.scroll_into_view_if_needed(); pb.wait_for_timeout(300); png=el.screenshot(); return np.asarray(Image.open(io.BytesIO(png)).convert('RGB')).astype(int)
    d=grab('dark'); l=grab('light'); h=min(d.shape[0],l.shape[0]); diff=np.abs(d[:h]-l[:h]).mean()
    print('B2 CV output dark vs day mean pixel diff:',round(float(diff),2),'(small = same colours) | sample red bar dark',d[20,20].tolist(),'day',l[20,20].tolist(),'| avatar centre dark',d[110,80].tolist(),'day',l[110,80].tolist())
    # ---- C) account-style avatar: element with an inline background-image
    ctx5=ctx_for(b); pi=ctx5.new_page(); pi.goto('http://localhost:8011/index.html',wait_until='load'); pi.wait_for_timeout(1800)
    pi.evaluate("(u)=>{const d=document.createElement('div');d.id='avt';d.style.cssText='position:fixed;left:20px;top:100px;width:120px;height:120px;border-radius:50%;z-index:99999;background-size:cover;background-position:center';d.style.backgroundImage=\"url('\"+u+\"')\";document.body.appendChild(d)}",AV)
    def grab2(theme):
        pi.evaluate(f"KavoxTheme.set('{theme}')"); pi.wait_for_timeout(700); png=pi.query_selector('#avt').screenshot(); return np.asarray(Image.open(io.BytesIO(png)).convert('RGB')).astype(int)
    d2=grab2('dark'); l2=grab2('light'); print('C avatar (background-image) dark vs day mean pixel diff:',round(float(np.abs(d2-l2).mean()),2))
    print('errs',eb); b.close()
