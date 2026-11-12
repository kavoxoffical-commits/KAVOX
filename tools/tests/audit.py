import sys, json
from playwright.sync_api import sync_playwright
G='/home/claude/vendor/package/dist/'
JS = r"""
() => {
  const parse = c => { const m=c.match(/rgba?\(([^)]+)\)/); if(!m) return null; const p=m[1].split(',').map(s=>parseFloat(s)); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; };
  const lum = ({r,g,b}) => { const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
  const blend = (fg,bg)=>({r:fg.r*fg.a+bg.r*(1-fg.a),g:fg.g*fg.a+bg.g*(1-fg.a),b:fg.b*fg.a+bg.b*(1-fg.a),a:1});
  const bgOf = el => { let stack=[]; let e=el; while(e){ const cs=getComputedStyle(e); const bi=cs.backgroundImage; const c=parse(cs.backgroundColor); if(bi&&bi!=='none') return null; if(c&&c.a>0){ stack.push(c); if(c.a>=1) break; } e=e.parentElement; } let base={r:10,g:10,b:12,a:1}; for(let i=stack.length-1;i>=0;i--) base=blend(stack[i],base); return base; };
  const out=[]; const seen=new Set();
  document.querySelectorAll('body *').forEach(el=>{
    if(['SCRIPT','STYLE','svg','path','IMG'].includes(el.tagName)) return;
    const txt=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
    if(!txt) return;
    const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none') return;
    const fg=parse(cs.color); if(!fg) return;
    const bg=bgOf(el); if(!bg) return;
    const eff=blend(fg,bg); const L1=lum(eff),L2=lum(bg);
    const ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
    if(ratio<4.0){ const key=el.tagName+'.'+el.className+'|'+cs.color; if(seen.has(key)) return; seen.add(key); out.push([ratio.toFixed(2),key,txt.slice(0,40),cs.color]); }
  });
  return out;
}
"""
def run(pages):
    with sync_playwright() as p:
        b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':900})
        def route(r):
            u=r.request.url
            if 'gsap.min.js' in u: r.fulfill(path=G+'gsap.min.js',content_type='application/javascript')
            elif 'ScrollTrigger.min.js' in u: r.fulfill(path=G+'ScrollTrigger.min.js',content_type='application/javascript')
            elif u.startswith('http://localhost'): r.continue_()
            else: r.abort()
        ctx.route('**/*',route)
        for name in pages:
            pg=ctx.new_page(); pg.goto(f'http://localhost:8011/{name}',wait_until='load'); pg.wait_for_timeout(800)
            # force reveal states: set opacity of everything gsap hid, ignore
            res=pg.evaluate(JS)
            print('==',name)
            for r in sorted(res,key=lambda x:float(x[0])): print(r)
            pg.close()
        b.close()
run(sys.argv[1:])
