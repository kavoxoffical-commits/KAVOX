/* KAVOX day/night mode
 * Add to <head> of each page (blocking, so there is no flash):
 *   <script src="kavox-theme.js"></script>
 * Night is the default. Day mode inverts the whole page (logo included).
 * Photos and CV template previews are re-inverted so they keep true colours.
 */
(function () {
  var KEY = 'kavox-theme';
  var root = document.documentElement;
  var NIGHT_BG = '#0a0a0c';
  var DAY_BG = '#f5f5f3';

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  var FLIP = 'invert(1) hue-rotate(180deg)';
  var css = ''
    + 'html[data-theme="light"]{filter:' + FLIP + ';}'
    /* things that must keep their real colours */
    + 'html[data-theme="light"] img,'
    + 'html[data-theme="light"] video,'
    + 'html[data-theme="light"] .tpl-mock,'
    + 'html[data-theme="light"] #tpl-preview-mock{filter:' + FLIP + ';}'
    /* the logo is the one image that stays inverted */
    + 'html[data-theme="light"] .logo img{filter:none;}'
    + 'html.kv-theme-anim{transition:filter .4s ease;}'
    + '.kv-theme-toggle{position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));'
    + 'z-index:9999;width:44px;height:44px;padding:0;border-radius:50%;'
    + 'border:1px solid rgba(255,255,255,.18);background:#141416;color:#f5f2ea;'
    + 'display:flex;align-items:center;justify-content:center;cursor:pointer;'
    + '-webkit-tap-highlight-color:transparent;}'
    + '.kv-theme-toggle svg{width:20px;height:20px;display:block;}'
    + '.kv-theme-toggle .kv-sun{display:block;}'
    + '.kv-theme-toggle .kv-moon{display:none;}'
    + 'html[data-theme="light"] .kv-theme-toggle .kv-sun{display:none;}'
    + 'html[data-theme="light"] .kv-theme-toggle .kv-moon{display:block;}';

  var style = document.createElement('style');
  style.id = 'kv-theme-style';
  style.appendChild(document.createTextNode(css));
  (document.head || root).appendChild(style);

  function setMeta(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? DAY_BG : NIGHT_BG);
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    setMeta(theme);
    var btn = document.getElementById('kvThemeToggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to night mode' : 'Switch to day mode');
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
  }

  function current() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
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

  /* apply immediately (no animation) so the first paint is already right */
  apply(read() === 'light' ? 'light' : 'dark');

  function buildButton() {
    if (document.getElementById('kvThemeToggle')) return;
    var btn = document.createElement('button');
    btn.id = 'kvThemeToggle';
    btn.type = 'button';
    btn.className = 'kv-theme-toggle';
    btn.innerHTML =
      '<svg class="kv-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<circle cx="12" cy="12" r="4"/>'
      + '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
      + '<svg class="kv-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    btn.addEventListener('click', function () {
      set(current() === 'light' ? 'dark' : 'light');
    });
    document.body.appendChild(btn);
    apply(current());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildButton);
  } else {
    buildButton();
  }

  /* keep several open tabs in sync */
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) apply(e.newValue === 'light' ? 'light' : 'dark');
  });

  window.KavoxTheme = {
    get: current,
    set: function (t) { set(t === 'light' ? 'light' : 'dark'); },
    toggle: function () { set(current() === 'light' ? 'dark' : 'light'); }
  };
})();
