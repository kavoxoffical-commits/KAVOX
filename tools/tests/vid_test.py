from playwright.sync_api import sync_playwright
G='/home/claude/vendor/package/dist/'
def go(w,h,theme,out):
    with sync_playwright() as p:
        b=p.chromium.launch(); ctx=b.new_context(viewport={'width':w,'height':h})
        ctx.add_init_script(f"try{{localStorage.setItem('kavox-theme','{theme}')}}catch(e){{}}")
        def route(r):
            u=r.request.url
            if 'gsap.min.js' in u: r.fulfill(path=G+'gsap.min.js',content_type='application/javascript')
            elif 'ScrollTrigger.min.js' in u: r.fulfill(path=G+'ScrollTrigger.min.js',content_type='application/javascript')
            elif u.startswith('http://localhost'): r.continue_()
            else: r.abort()
        ctx.route('**/*',route)
        pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('http://localhost:8011/index.html',wait_until='load'); pg.wait_for_timeout(1000)
        print(theme,w,'canPlay h264:',pg.evaluate("document.createElement('video').canPlayType('video/mp4; codecs=\"avc1.42E01E\"')||'no'"))
        pg.evaluate("document.getElementById('demo').scrollIntoView({block:'center'})"); pg.wait_for_timeout(2500)
        print(' src set:',pg.evaluate("!!document.getElementById('demoVideo').src"),' paused:',pg.evaluate("document.getElementById('demoVideo').paused"),' t:',pg.evaluate("document.getElementById('demoVideo').currentTime"),'errs',errs)
        pg.screenshot(path=out); b.close()
go(1280,800,'dark','/home/claude/vid_desk_dark.png')
go(390,844,'light','/home/claude/vid_mob_light.png')
