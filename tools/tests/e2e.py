import json
from playwright.sync_api import sync_playwright
G='/home/claude/vendor/package/dist/'
PEOPLE=open('/home/claude/tpl/people.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':900})
    def route(r):
        u=r.request.url
        if 'gsap.min.js' in u: r.fulfill(path=G+'gsap.min.js',content_type='application/javascript')
        elif 'ScrollTrigger.min.js' in u: r.fulfill(path=G+'ScrollTrigger.min.js',content_type='application/javascript')
        elif u.startswith('http://localhost'): r.continue_()
        else: r.abort()
    ctx.route('**/*',route)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    # builder: preselect by slug + engine hook
    pg.goto('http://localhost:8011/build.html?template=architect-s-grid',wait_until='load'); pg.wait_for_timeout(1500)
    print('options:',pg.evaluate("document.querySelectorAll('#f-template option[data-tier]').length"))
    print('preselected:',pg.evaluate("(function(){var s=document.getElementById('f-template');return s.options[s.selectedIndex].textContent+' / '+s.options[s.selectedIndex].dataset.tier})()"))
    pg.evaluate(PEOPLE)
    res=pg.evaluate("""() => { const out={}; const names=KVX.names(); let bad=[]; names.forEach((n,i)=>{ const h=buildCVFromTemplate(n, window.PEOPLE[i%6], 'pro'); if(!h||h.length<800||h.indexOf('kv-cv')<0||h.indexOf('undefined')>-1) bad.push(n); });
       const rtl=Object.assign({}, window.PEOPLE[0], {rtl:true, lang:'Arabic'}); const hr=buildCVFromTemplate('Creative Agency', rtl, 'royal');
       return {n:names.length, bad, rtlOk: hr.indexOf('dir=\"rtl\"')>-1}; }""")
    print('engine via build.html:',res)
    # old template still intact
    print('old template ok:',pg.evaluate("buildCVFromTemplate('The Minimalist', window.PEOPLE[0],'pro').length>800"))
    print('unknown falls back:',pg.evaluate("buildCVFromTemplate('Nope', window.PEOPLE[0],'pro').length>800"))
    print('errs',errs)
    pt=ctx.new_page(); pt.goto('http://localhost:8011/templates.html',wait_until='load'); pt.wait_for_timeout(2500)
    print('cards:',pt.evaluate("document.querySelectorAll('.tcard').length"),'count label:',pt.evaluate("document.getElementById('galCount').textContent"))
    for cat in ['creative','tech','executive','dark','simple']:
        pt.click(f'#catChips .chip[data-cat="{cat}"]'); pt.wait_for_timeout(150)
        print(cat, pt.evaluate("document.querySelectorAll('.tcard:not(.hide)').length"), end=' | ')
    pt.click('#catChips .chip[data-cat="all"]'); pt.click('#tierChips .chip[data-tier="Pro"]'); pt.wait_for_timeout(150)
    print('\nPro:',pt.evaluate("document.querySelectorAll('.tcard:not(.hide)').length"))
    pt.click('#tierChips .chip[data-tier="all"]'); pt.evaluate("window.scrollTo(0,420)"); pt.wait_for_timeout(1500)
    pt.screenshot(path='/home/claude/g68_desk.png')
    pm=b.new_context(viewport={'width':390,'height':844}); pm.route('**/*',route)
    pmp=pm.new_page(); pmp.goto('http://localhost:8011/templates.html',wait_until='load'); pmp.wait_for_timeout(2200); pmp.evaluate("window.scrollTo(0,500)"); pmp.wait_for_timeout(1200); pmp.screenshot(path='/home/claude/g68_mob.png')
    b.close()
