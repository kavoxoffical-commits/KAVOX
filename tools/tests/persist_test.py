from playwright.sync_api import sync_playwright
G='/home/claude/vendor/package/dist/'
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':800})
    def route(r):
        u=r.request.url
        if 'gsap.min.js' in u: r.fulfill(path=G+'gsap.min.js',content_type='application/javascript')
        elif 'ScrollTrigger.min.js' in u: r.fulfill(path=G+'ScrollTrigger.min.js',content_type='application/javascript')
        elif u.startswith('http://localhost'): r.continue_()
        else: r.abort()
    ctx.route('**/*',route)
    pg=ctx.new_page()
    pg.goto('http://localhost:8011/index.html'); pg.wait_for_timeout(800)
    print('index start:',pg.evaluate("document.documentElement.dataset.theme"))
    pg.click('nav .nav-links .kv-tg'); pg.wait_for_timeout(500)
    print('index after click:',pg.evaluate("document.documentElement.dataset.theme"))
    for name in ['pricing.html','templates.html','feature-ats.html','login.html','terms.html','account.html','build.html']:
        pg.goto('http://localhost:8011/'+name); pg.wait_for_timeout(600)
        print(name, pg.evaluate("document.documentElement.dataset.theme || 'NO SCRIPT (stays dark)'"))
    # toggle back from another page, check index follows
    pg.goto('http://localhost:8011/pricing.html'); pg.wait_for_timeout(500)
    pg.click('nav .nav-links .kv-tg'); pg.wait_for_timeout(500)
    pg.goto('http://localhost:8011/index.html'); pg.wait_for_timeout(500)
    print('index after toggling back on pricing:',pg.evaluate("document.documentElement.dataset.theme"))
    b.close()
