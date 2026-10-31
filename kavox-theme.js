/* KAVOX day/night mode
 * Loaded in <head> of each page (blocking, so there is no flash):
 *   <script src="kavox-theme.js"></script>
 * Night is the default. Day mode inverts the whole page (logo included),
 * then dims it slightly so it is not glaring. Photos and CV template previews
 * are flipped back so they keep their true colours.
 * The toggle lives in the top nav (desktop) and in the hamburger menu (mobile).
 */
(function () {
  var KEY = 'kavox-theme';
  var root = document.documentElement;
  var NIGHT_BG = '#0a0a0c';
  var DAY_BG = '#dcdcd9';

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  /* page = invert + dim; media = exact undo of the invert, brightened to offset the dim */
  var PAGE = 'invert(1) hue-rotate(180deg) brightness(.88) contrast(1.06)';
  var MEDIA = 'invert(1) hue-rotate(180deg) brightness(1.1)';

  var SUN = '<svg class="kv-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<circle cx="12" cy="12" r="4"/>'
    + '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg class="kv-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  var L = 'html[data-theme="light"] ';
  var FAINT = [
    '.marquee-label', '.marquee-track span', '.paths-label', '.hero-title .light', '.scroll-cue span',
    '.plus', '.footer-col h4', '.footer-bottom span', '.footer-brand p', '.feat-num', '.tier-note',
    '.compare-note', '.price-cycle', '.updated', '.hint', '.field-hint', '.form-footnote',
    '.upload-zone-hint', '.btn-skip', '.optional-toggle-icon'
  ];
  var faintSel = FAINT.map(function (x) { return L + x; }).join(',');

  var css = ''
    + L + '{filter:' + PAGE + ';}'
    /* photos / video flip back to true colour */
    + L + 'img,' + L + 'video{filter:' + MEDIA + ';}'
    /* photo cards keep their dark look (overlay + white text), and CV previews keep true colour */
    + L + '.slide,' + L + '.tpl-card,' + L + '#tpl-preview-mock{filter:' + MEDIA + ';}'
    + L + '.slide img,' + L + '.tpl-card img,' + L + '.tpl-card .tpl-mock{filter:none;}'
    + L + '.tpl-mock{filter:' + MEDIA + ';}'
    /* logo: inverted with the page; its black box is made transparent so no pale patch shows */
    + L + '.logo img{filter:none;mix-blend-mode:lighten;}'
    /* text that was deliberately dim on black gets too faint on light: lift it */
    + faintSel + '{color:rgba(255,255,255,.62) !important;}'
    + L + '.statement p{color:rgba(255,255,255,.5);}'
    + L + '.statement p .accent{color:#a89f88;}'
    + L + '.footer-social a{border-color:rgba(255,255,255,.3);}'
    + 'html.kv-theme-anim{transition:filter .4s ease;}'
    /* toggle buttons */
    + '.kv-tg{background:none;border:0;margin:0;padding:0;font:inherit;color:inherit;cursor:pointer;'
    + 'display:inline-flex;align-items:center;gap:8px;-webkit-tap-highlight-color:transparent;}'
    + '.kv-tg svg{width:16px;height:16px;flex:none;display:block;}'
    + '.kv-tg .kv-moon{display:none;}'
    + 'html[data-theme="light"] .kv-tg .kv-sun{display:none;}'
    + 'html[data-theme="light"] .kv-tg .kv-moon{display:block;}'
    + '.nav-links .kv-tg{font-size:13px;color:rgba(255,255,255,.7);}'
    + '.nav-links .kv-tg:hover{color:#fff;}'
    + '.nav-mobile-menu .kv-tg{width:100%;padding:17px 4px;font-size:15.5px;color:rgba(255,255,255,.75);'
    + 'border-bottom:1px solid rgba(255,255,255,.06);text-align:left;}'
    + '.nav-mobile-menu .kv-tg svg{width:18px;height:18px;}'
    + '.kv-tg-icon{color:#f5f2ea;padding:8px;margin-left:auto;margin-right:4px;}'
    + '.kv-tg-icon svg{width:20px;height:20px;}'
    + '@media(min-width:769px){.kv-tg-icon.kv-only-mobile{display:none;}}';

  var style = document.createElement('style');
  style.id = 'kv-theme-style';
  style.appendChild(document.createTextNode(css));
  (document.head || root).appendChild(style);

  function current() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function refreshButtons() {
    var light = current() === 'light';
    var all = document.querySelectorAll('.kv-tg');
    for (var i = 0; i < all.length; i++) {
      all[i].setAttribute('aria-label', light ? 'Switch to night mode' : 'Switch to day mode');
      all[i].setAttribute('aria-pressed', light ? 'true' : 'false');
      var lbl = all[i].querySelector('.kv-lbl');
      if (lbl) lbl.textContent = light ? 'Night mode' : 'Day mode';
    }
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? DAY_BG : NIGHT_BG);
    refreshButtons();
  }

  function set(theme, persist) {
    root.classList.add('kv-theme-anim');
    apply(theme);
    if (persist !== false) write(theme);
    setTimeout(function () { root.classList.remove('kv-theme-anim'); }, 450);
    try {
      window.dispatchEvent(new CustomEvent('kavox-theme-change', { detail: { theme: theme } }));
    } catch (e) {}
  }

  function toggle() { set(current() === 'light' ? 'dark' : 'light'); }

  /* first paint is already in the right mode */
  apply(read() === 'light' ? 'light' : 'dark');

  function makeBtn(extraClass, withLabel) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'kv-tg ' + extraClass;
    b.innerHTML = SUN + MOON + (withLabel ? '<span class="kv-lbl"></span>' : '');
    b.addEventListener('click', toggle);
    return b;
  }

  function mount() {
    if (document.querySelector('.kv-tg')) return;
    var links = document.querySelector('nav .nav-links');
    var menu = document.querySelector('.nav-mobile-menu');
    var nav = document.querySelector('nav');

    if (links) links.appendChild(makeBtn('kv-tg-desktop', true));
    if (menu) menu.appendChild(makeBtn('kv-tg-mobile', true));

    /* pages with no hamburger menu (legal pages, login, account): small icon in the nav bar */
    if (nav && !menu) {
      var icon = makeBtn('kv-tg-icon' + (links ? ' kv-only-mobile' : ''), false);
      var burger = nav.querySelector('.nav-toggle');
      if (burger) nav.insertBefore(icon, burger); else nav.appendChild(icon);
    }
    refreshButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  window.addEventListener('storage', function (e) {
    if (e.key === KEY) apply(e.newValue === 'light' ? 'light' : 'dark');
  });

  window.KavoxTheme = {
    get: current,
    set: function (t) { set(t === 'light' ? 'light' : 'dark'); },
    toggle: toggle
  };
})();
