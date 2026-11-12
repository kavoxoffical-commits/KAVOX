from playwright.sync_api import sync_playwright
G='/home/claude/vendor/package/dist/'
def mk(b,w,h,theme='dark'):
    ctx=b.new_context(viewport={'width':w,'height':h})
    ctx.add_init_script(f"try{{localStorage.setItem('kavox-theme','{theme}')}}catch(e){{}}")
    def route(r):
        u=r.request.url
        if 'gsap.min.js' in u: r.fulfill(path=G+'gsap.min.js',content_type='application/javascript')
        elif 'ScrollTrigger.min.js' in u: r.fulfill(path=G+'ScrollTrigger.min.js',content_type='application/javascript')
        elif u.startswith('http://localhost'): r.continue_()
        else: r.abort()
    ctx.route('**/*',route); return ctx
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=mk(b,1280,900); pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8011/templates.html',wait_until='load'); pg.wait_for_timeout(2500)
    pg.evaluate("window.scrollTo(0,300)"); pg.wait_for_timeout(1200)
    pg.screenshot(path='/home/claude/tp_desk.png')
    pg.click('#catChips .chip[data-cat="dark"]'); pg.wait_for_timeout(300)
    print('dark visible:',pg.evaluate("document.querySelectorAll('.tcard:not(.hide)').length"))
    pg.click('#tierChips .chip[data-tier="Elite"]'); pg.wait_for_timeout(300)
    print('dark+elite visible:',pg.evaluate("document.querySelectorAll('.tcard:not(.hide)').length"))
    pg.click('#catChips .chip[data-cat="all"]'); pg.click('#tierChips .chip[data-tier="all"]'); pg.wait_for_timeout(200)
    pg.click('.tcard >> nth=0'); pg.wait_for_timeout(500)
    print('modal open:',pg.evaluate("document.getElementById('tpl-preview-modal').classList.contains('open')"), pg.evaluate("document.getElementById('tpl-preview-start').getAttribute('href')"))
    pg.screenshot(path='/home/claude/tp_modal.png'); print('errs',errs)
    ctx2=mk(b,390,844); pm=ctx2.new_page(); pm.goto('http://localhost:8011/templates.html',wait_until='load'); pm.wait_for_timeout(2500)
    pm.evaluate("window.scrollTo(0,420)"); pm.wait_for_timeout(1200); pm.screenshot(path='/home/claude/tp_mob.png')
    b.close()
