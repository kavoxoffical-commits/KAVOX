import json,base64,io
from playwright.sync_api import sync_playwright
from PIL import Image
G='/home/claude/vendor/package/dist/'
# test images: a big landscape JPEG, a PNG, a tiny image, a text file
Image.open('/home/claude/tpl/avatars/a1.jpg').resize((3200,2000)).save('/tmp/big.jpg',quality=92)
Image.open('/home/claude/tpl/avatars/a3.jpg').save('/tmp/face.png')
Image.new('RGB',(90,90),'red').save('/tmp/tiny.jpg')
open('/tmp/not_image.txt','w').write('hello')
PEOPLE=open('/home/claude/tpl/people.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':900})
    def route(r):
        u=r.request.url
        if 'gsap.min.js' in u: r.fulfill(path=G+'gsap.min.js',content_type='application/javascript')
        elif 'ScrollTrigger.min.js' in u: r.fulfill(path=G+'ScrollTrigger.min.js',content_type='application/javascript')
        elif u.startswith('http://localhost'): r.continue_()
        else: r.abort()
    ctx.route('**/*',route); pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8011/build.html?template=the-modern-slate',wait_until='load'); pg.wait_for_timeout(1500)
    pg.evaluate("document.getElementById('photo-input').scrollIntoView()")
    def state(): return pg.evaluate("({len:(window._kvPhoto||'').length, prev:document.getElementById('photo-preview-state').style.display, err:document.getElementById('photo-error').textContent, hint:document.getElementById('photo-template-hint').textContent})")
    print('initial hint (preselected via ?template=):',state()['hint'])
    pg.set_input_files('#photo-input','/tmp/not_image.txt'); pg.wait_for_timeout(300); print('text file:',state())
    pg.set_input_files('#photo-input','/tmp/tiny.jpg'); pg.wait_for_timeout(500); print('tiny:',state())
    pg.set_input_files('#photo-input','/tmp/big.jpg'); pg.wait_for_timeout(800); st=state(); print('big landscape:',st['len']//1024,'KB data url, preview',st['prev'])
    dims=pg.evaluate("new Promise(r=>{const i=new Image();i.onload=()=>r([i.naturalWidth,i.naturalHeight]);i.src=window._kvPhoto})"); print('stored size:',dims)
    pg.screenshot(path='/home/claude/ph_form.png',clip={'x':0,'y':0,'width':1280,'height':900})
    # photo flows into the real render
    pg.evaluate(PEOPLE)
    r=pg.evaluate("""()=>{const d=Object.assign({},window.PEOPLE[0]); delete d.photo; const out={};
      ['The Modern Slate','The Minimalist','Creative Agency','Digital Marketing','Tech Minimal','Clean Classic'].forEach(n=>{const h=buildCVFromTemplate(n,d,'pro'); out[n]=h.indexOf('data:image/jpeg')>-1;}); return out;}""")
    print('photo appears in render:',r)
    # template switch updates hint
    pg.evaluate("(()=>{const s=document.getElementById('f-template');for(let i=0;i<s.options.length;i++){if(s.options[i].textContent.trim()==='Clean Classic'){s.selectedIndex=i;s.dispatchEvent(new Event('change'));}}})()"); pg.wait_for_timeout(200); print('hint on no-photo template:',state()['hint'])
    pg.evaluate("(()=>{const s=document.getElementById('f-template');for(let i=0;i<s.options.length;i++){if(s.options[i].textContent.trim()==='Creative Agency'){s.selectedIndex=i;s.dispatchEvent(new Event('change'));}}})()"); pg.wait_for_timeout(200); print('hint on photo template:',state()['hint'])
    pg.evaluate("document.getElementById('removePhotoBtn').click()"); pg.wait_for_timeout(200); print('after remove:',state()['len'], 'no photo in render:',pg.evaluate("buildCVFromTemplate('The Modern Slate',(()=>{const d=Object.assign({},window.PEOPLE[0]);delete d.photo;return d})(),'pro').indexOf('data:image')<0"))
    pg.set_input_files('#photo-input','/tmp/face.png'); pg.wait_for_timeout(500); print('png ok:',state()['len']>1000)
    print('errs',errs); b.close()
