/* KAVOX extra templates.
 * Loaded by build.html. Registers additional named templates on window.KVX and renders them
 * from the same CV data object the built-in templates use (name, title, email, phone, location,
 * linkedin, portfolio, summary, skills, languages, experience, education, labels, rtl).
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var FONTS = {
    serif: "'Georgia','Times New Roman',serif",
    sans: "'Helvetica Neue','Arial',sans-serif",
    humanist: "'Trebuchet MS','Segoe UI',sans-serif",
    mono: "'Courier New','Consolas',monospace",
    display: "'Palatino Linotype','Book Antiqua','Georgia',serif"
  };

  var BASE = { bg: '#ffffff', ink: '#1c1c1f', mute: '#6a6a72', acc: '#2f6fed', side: '#1e2d3d', sideInk: '#eef1f5', soft: '#f4f5f8', line: '#d9dce3', track: 'rgba(0,0,0,0.10)' };

  var PAL = {
    mono: { acc: '#111111', side: '#161616', sideInk: '#f2f2f2', soft: '#f3f3f3', line: '#cfcfcf' },
    ink: { acc: '#1f4fbf', side: '#14213d', sideInk: '#e8eefc', soft: '#eef2fb', line: '#cfd8ee' },
    navy: { acc: '#3d7bff', side: '#1b2a41', sideInk: '#e8edf5', soft: '#eef2f8', line: '#d0d9e8' },
    teal: { acc: '#16897f', side: '#0f4c5c', sideInk: '#e4f6f4', soft: '#eaf5f4', line: '#c7e2df' },
    forest: { acc: '#3f8a5a', side: '#1f4a36', sideInk: '#e6f3ea', soft: '#edf5ef', line: '#cfe3d5' },
    burgundy: { acc: '#a3324f', side: '#5b1a2b', sideInk: '#f7e6ea', soft: '#f8eef0', line: '#e7ccd3' },
    plum: { acc: '#7a4fd0', side: '#3d2a5c', sideInk: '#efe8fb', soft: '#f3eefb', line: '#ddd0f2' },
    charcoal: { acc: '#e0a81f', side: '#2b2b2e', sideInk: '#f2f0ea', soft: '#f3f2ee', line: '#d8d6cf' },
    slate: { acc: '#3f7fb5', side: '#3b4a5a', sideInk: '#e9eef3', soft: '#eef2f5', line: '#d3dbe3' },
    terracotta: { acc: '#c4562f', side: '#8a3b2a', sideInk: '#fbeee6', soft: '#fbf1ec', line: '#ecd5c9' },
    mustard: { acc: '#d99a1f', side: '#25231f', sideInk: '#f6f1e3', soft: '#faf5e6', line: '#ead9aa' },
    coral: { acc: '#f0584a', side: '#2a2230', sideInk: '#fdeeed', soft: '#fdf1ef', line: '#f1d3cf' },
    orange: { acc: '#f07a1a', side: '#f07a1a', sideInk: '#ffffff', soft: '#fdf1e6', line: '#f3d9c0' },
    sky: { acc: '#2f86d6', side: '#e6f1fb', sideInk: '#17304a', soft: '#eef6fd', line: '#cfe2f3' },
    sage: { acc: '#5b8a63', side: '#e9f0e6', sideInk: '#23361f', soft: '#f1f6ee', line: '#d4e2cf' },
    sand: { acc: '#a9793a', side: '#f1e8d8', sideInk: '#3a2e1c', soft: '#f6f0e4', line: '#e1d4bb' },
    blush: { acc: '#c2547a', side: '#f7e6ea', sideInk: '#4a1f30', soft: '#fbf0f3', line: '#efd3db' },
    silver: { acc: '#5d6b7a', side: '#2f343a', sideInk: '#eceff2', soft: '#f1f3f5', line: '#d6dade' },
    gold: { acc: '#c9a84c', side: '#0b0b0d', sideInk: '#f1e8cf', soft: '#f6f1e3', line: '#e6dab5', bg: '#ffffff' },
    goldnavy: { acc: '#c9a84c', side: '#0d1b3a', sideInk: '#e9edf8', soft: '#f3f0e6', line: '#e2d7b2' },
    emerald: { acc: '#d6b86a', side: '#06251c', sideInk: '#e6f3ec', soft: '#eff4ef', line: '#d9d3b6' },
    ivory: { acc: '#9a7b2f', side: '#3a2f17', sideInk: '#f6efdc', soft: '#f6f0e1', line: '#dccfa8', bg: '#fbf7ee' },
    parchment: { acc: '#7b5a2a', side: '#4a3720', sideInk: '#f4e9d0', soft: '#efe3c6', line: '#cdb98c', bg: '#f5ecd3', ink: '#33260f', mute: '#6e5a37' },
    blueprint: { acc: '#a8d4ff', side: '#0f3a82', sideInk: '#ffffff', soft: 'rgba(255,255,255,0.08)', line: 'rgba(255,255,255,0.35)', bg: '#124091', ink: '#ffffff', mute: 'rgba(255,255,255,0.72)', track: 'rgba(255,255,255,0.2)' },
    graph: { acc: '#2b5d9b', side: '#e9e2cf', sideInk: '#2a2a2a', soft: '#f1ecdd', line: '#cfc6ad', bg: '#f7f3e6' },
    noir: { acc: '#ffffff', side: '#0a0a0a', sideInk: '#f5f5f5', soft: '#171717', line: '#333333', bg: '#0f0f10', ink: '#f0f0f0', mute: '#a5a5a5', track: 'rgba(255,255,255,0.15)' },
    rose: { acc: '#c98a76', side: '#2a1d1d', sideInk: '#f6e8e3', soft: '#f8eeea', line: '#e9d3cb' },
    sapphire: { acc: '#c9a84c', side: '#0b2a6b', sideInk: '#e8eefc', soft: '#eef1f8', line: '#d3d9ea' }
  };

  function pal(key) {
    var o = {}, k;
    for (k in BASE) o[k] = BASE[k];
    var p = PAL[key] || {};
    for (k in p) o[k] = p[k];
    return o;
  }

  /* ---------- registry ---------- */
  // [name, tier, categories, layout, font, skill style, palette, options]
  var T = [
    // ----- Pro: simple, single-flow, ATS-friendly -----
    ['Tech Minimal', 'pro', 'simple modern tech', 'twoColLight', 'sans', 'text', 'ink', {}],
    ['Clean Classic', 'pro', 'simple professional', 'centerClassic', 'serif', 'text', 'mono', {}],
    ['The Newsroom', 'pro', 'simple professional creative', 'railDates', 'serif', 'text', 'mono', {}],
    ['Legal Professional', 'pro', 'simple professional', 'centerClassic', 'display', 'text', 'ink', { head: 'caps' }],
    ['Project Manager', 'pro', 'simple professional', 'timeline', 'sans', 'chips', 'navy', {}],
    ['Software Developer', 'pro', 'simple tech', 'compactTable', 'sans', 'chips', 'teal', {}],
    ['Educator', 'pro', 'simple professional', 'twoColLight', 'humanist', 'text', 'sky', {}],
    ['Finance Director', 'pro', 'simple professional', 'compactTable', 'serif', 'text', 'navy', {}],
    ['HR Specialist', 'pro', 'simple professional', 'twoColLight', 'humanist', 'chips', 'blush', {}],
    ['E-commerce Manager', 'pro', 'simple modern', 'railDates', 'sans', 'chips', 'coral', {}],
    ['Operations Head', 'pro', 'simple professional', 'railDates', 'sans', 'text', 'slate', {}],
    ['Healthcare Professional', 'pro', 'simple professional', 'twoColLight', 'humanist', 'text', 'sage', {}],
    ['Academic Scholar', 'pro', 'simple professional', 'centerClassic', 'serif', 'text', 'burgundy', { head: 'rule' }],
    ['Customer Success', 'pro', 'simple modern', 'timeline', 'humanist', 'chips', 'teal', {}],
    // ----- Royal: colour, structure, personality -----
    ['Creative Agency', 'royal', 'creative modern', 'sidebarL', 'humanist', 'dots', 'coral', {}],
    ['Digital Marketing', 'royal', 'creative modern', 'bandTop', 'sans', 'bars', 'orange', {}],
    ['Data Analyst', 'royal', 'tech modern', 'infographic', 'sans', 'rings', 'navy', {}],
    ['Data Scientist', 'royal', 'tech modern', 'infographic', 'sans', 'rings', 'teal', { sideLight: true }],
    ['Retail Management', 'royal', 'professional modern', 'sidebarL', 'sans', 'bars', 'forest', {}],
    ['Hospitality Lead', 'royal', 'professional creative', 'splitHeader', 'display', 'chips', 'burgundy', {}],
    ['Construction & Trades', 'royal', 'professional modern', 'sidebarL', 'sans', 'bars', 'charcoal', { sw: 200 }],
    ['Fashion Designer', 'royal', 'creative', 'bold', 'display', 'text', 'mono', {}],
    ['Marketing Strategist', 'royal', 'creative modern', 'bandTop', 'humanist', 'dots', 'plum', {}],
    ['Travel Consultant', 'royal', 'creative modern', 'sidebarR', 'humanist', 'dots', 'sky', {}],
    ['Sales Champion', 'royal', 'professional modern', 'cardGrid', 'sans', 'bars', 'ink', {}],
    ['Engineer', 'royal', 'professional tech', 'sidebarL', 'sans', 'bars', 'slate', {}],
    ['Eco-Friendly', 'royal', 'creative modern', 'sidebarL', 'humanist', 'dots', 'sage', {}],
    ['Startup Founder', 'royal', 'creative modern', 'bold', 'sans', 'chips', 'mustard', {}],
    ['UX Designer', 'royal', 'creative modern', 'cardGrid', 'humanist', 'chips', 'blush', {}],
    ['Content Writer', 'royal', 'creative simple', 'railDates', 'display', 'text', 'sand', {}],
    ['Student & Graduate', 'royal', 'simple modern', 'twoColLight', 'humanist', 'chips', 'sky', {}],
    // ----- Elite: luxe, ornate, senior -----
    ['Senior Executive', 'elite', 'professional dark executive', 'splitHeader', 'serif', 'text', 'goldnavy', {}],
    ['Corporate Counsel', 'elite', 'professional executive', 'frame', 'display', 'text', 'ivory', {}],
    ['Head of Operations', 'elite', 'professional dark executive', 'sidebarL', 'serif', 'bars', 'charcoal', { sw: 214 }],
    ['Strategic Planner', 'elite', 'tech modern', 'blueprint', 'mono', 'bars', 'blueprint', {}],
    ['Chief Product Officer', 'elite', 'dark executive', 'bandTop', 'sans', 'bars', 'gold', {}],
    ['Investment Strategist', 'elite', 'professional dark executive', 'splitHeader', 'serif', 'bars', 'sapphire', {}],
    ['Heritage Parchment', 'elite', 'professional creative', 'frame', 'serif', 'text', 'parchment', {}],
    ['Architect\u2019s Grid', 'elite', 'creative tech', 'blueprint', 'mono', 'dots', 'graph', { light: true }],
    ['Emerald Authority', 'elite', 'dark executive', 'sidebarL', 'display', 'dots', 'emerald', {}],
    ['Onyx Director', 'elite', 'dark executive', 'bandTop', 'serif', 'text', 'noir', {}],
    ['Rose Gold Executive', 'elite', 'professional executive creative', 'splitHeader', 'display', 'chips', 'rose', {}],
    ['Platinum Partner', 'elite', 'professional executive', 'twoColLight', 'sans', 'bars', 'silver', {}],
    ['Noir Editorial', 'elite', 'dark creative', 'bold', 'serif', 'text', 'noir', {}],
    ['Ivory Consultant', 'elite', 'simple professional executive', 'centerClassic', 'display', 'text', 'ivory', { head: 'caps' }],
    ['Royal Burgundy', 'elite', 'professional dark executive', 'sidebarR', 'display', 'dots', 'burgundy', { gold: true }],
    ['Sapphire Chair', 'elite', 'professional dark executive', 'sidebarL', 'serif', 'bars', 'sapphire', {}],
    ['Magazine Feature', 'elite', 'creative', 'bold', 'serif', 'text', 'ivory', { big: true }]
  ];

  var REG = {};
  T.forEach(function (r) {
    REG[r[0]] = { name: r[0], tier: r[1], cats: r[2], layout: r[3], font: r[4], skills: r[5], pal: r[6], opt: r[7] || {} };
  });

  /* ---------- rendering helpers ---------- */
  function make(d, ctx, cfg) {
    var P = pal(cfg.pal);
    if (cfg.opt.gold) { P.acc = '#d9b45a'; }
    var o = cfg.opt || {};
    var lb = d.labels || {};
    function L(k, def) { return esc(lb[k] || def); }

    var contacts = [d.email, d.phone, d.location, d.linkedin, d.portfolio].filter(Boolean);
    function contactLines(color, size) {
      return contacts.map(function (c) { return '<div style="font-size:' + (size || '8.8pt') + ';color:' + color + ';line-height:1.7;">' + esc(c) + '</div>'; }).join('');
    }
    function contactRow(color, size, sep) {
      return '<div style="font-size:' + (size || '8.8pt') + ';color:' + color + ';line-height:1.7;">' + contacts.map(esc).join(esc(sep || '   \u2022   ')) + '</div>';
    }
    function initials() {
      return String(d.name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
    }
    function monogram(size, bg, ring, ink) {
      return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + bg + ';border:2px solid ' + ring + ';color:' + ink + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:' + Math.round(size * 0.34) + 'px;letter-spacing:1px;">' + esc(initials()) + '</div>';
    }
    function photoImg(size, ring, round) {
      return '<img src="' + d.photo + '" alt="" style="width:' + size + 'px;height:' + size + 'px;object-fit:cover;display:block;border-radius:' + (round === false ? '10px' : '50%') + ';border:3px solid ' + ring + ';">';
    }
    // photo if provided; otherwise the monogram (slots that always show something)
    function avatar(size, bg, ring, ink) {
      return d.photo ? photoImg(size, ring) : monogram(size, bg, ring, ink);
    }
    var pcts = [92, 86, 80, 90, 74, 84, 78, 88];
    function skills(list, style, fg, acc, track, bg) {
      list = list || [];
      if (style === 'text') {
        return '<div style="font-size:9.4pt;color:' + fg + ';line-height:1.75;">' + list.map(esc).join('  \u2022  ') + '</div>';
      }
      if (style === 'chips') {
        return '<div>' + list.map(function (s) {
          return '<span style="display:inline-block;font-size:8.4pt;padding:3px 9px;margin:0 5px 6px 0;border-radius:99px;border:1px solid ' + acc + ';color:' + fg + ';">' + esc(s) + '</span>';
        }).join('') + '</div>';
      }
      if (style === 'dots') {
        return list.map(function (s, i) {
          var n = Math.round(pcts[i % 8] / 20), dots = '';
          for (var k = 0; k < 5; k++) dots += '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-inline-end:4px;background:' + (k < n ? acc : track) + ';"></span>';
          return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:9pt;color:' + fg + ';margin-bottom:6px;"><span>' + esc(s) + '</span><span style="white-space:nowrap;">' + dots + '</span></div>';
        }).join('');
      }
      if (style === 'rings') {
        return '<div style="display:flex;flex-wrap:wrap;gap:8px 0;">' + list.map(function (s, i) {
          var p = pcts[i % 8];
          return '<div style="width:33.33%;text-align:center;"><div style="width:46px;height:46px;border-radius:50%;margin:0 auto 4px;background:conic-gradient(' + acc + ' ' + p + '%,' + track + ' 0);display:flex;align-items:center;justify-content:center;"><div style="width:33px;height:33px;border-radius:50%;background:' + bg + ';"></div></div><div style="font-size:7.6pt;color:' + fg + ';line-height:1.25;">' + esc(s) + '</div></div>';
        }).join('') + '</div>';
      }
      // bars
      return list.map(function (s, i) {
        return '<div class="kv-skill-bar"><div class="kv-skill-bar-label" style="color:' + fg + ';">' + esc(s) + '</div><div class="kv-skill-bar-track" style="background:' + track + ';"><div class="kv-skill-bar-fill" style="width:' + pcts[i % 8] + '%;background:' + acc + ';"></div></div></div>';
      }).join('');
    }
    function langs(color) {
      return (d.languages || []).map(function (l) { return '<div class="kv-lang-item" style="color:' + color + ';">\u2022 ' + esc(l) + '</div>'; }).join('');
    }
    function head(text, kind, color, acc, onDark) {
      kind = kind || o.head || 'rule';
      var base = 'margin-block:16px 8px;text-align:start;';
      if (kind === 'caps') return '<div style="' + base + 'font-size:8pt;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:' + color + ';text-align:center;border-block:1px solid ' + acc + ';padding:4px 0;">' + text + '</div>';
      if (kind === 'bar') return '<div style="' + base + 'font-size:8.6pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:' + color + ';border-inline-start:4px solid ' + acc + ';padding-inline-start:9px;">' + text + '</div>';
      if (kind === 'pill') return '<div style="' + base + '"><span style="display:inline-block;font-size:8pt;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:' + (onDark ? '#111' : '#fff') + ';background:' + acc + ';padding:3px 12px;border-radius:99px;">' + text + '</span></div>';
      if (kind === 'plain') return '<div style="' + base + 'font-size:13pt;font-weight:700;color:' + color + ';">' + text + '</div>';
      return '<div style="' + base + 'font-size:7.8pt;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:' + color + ';border-bottom:1.5px solid ' + acc + ';padding-bottom:3px;">' + text + '</div>';
    }
    function jobs(col) {
      col = col || {};
      return (d.experience || []).map(function (j) {
        return '<div class="kv-job"><div class="kv-job-title" style="color:' + (col.title || P.ink) + ';">' + esc(j.title || '') + '</div>' +
          '<div class="kv-job-meta" style="color:' + (col.meta || P.mute) + ';">' + esc(j.company || '') + (j.dates ? esc(ctx.sep) + esc(j.dates) : '') + '</div>' +
          '<ul>' + (j.bullets || []).map(function (b) { return '<li style="color:' + (col.text || P.ink) + ';">' + esc(b) + '</li>'; }).join('') + '</ul></div>';
      }).join('');
    }
    function edus(col) {
      col = col || {};
      return (d.education || []).map(function (e) {
        return '<div class="kv-edu-item"><div class="kv-edu-degree" style="color:' + (col.title || P.ink) + ';">' + esc(e.degree || '') + '</div>' +
          '<div class="kv-edu-inst" style="color:' + (col.meta || P.mute) + ';">' + esc(e.institution || '') + (e.dates ? esc(ctx.sep) + esc(e.dates) : '') + '</div></div>';
      }).join('');
    }
    function summary(color) { return '<p class="kv-summary" style="color:' + color + ';">' + esc(d.summary || '') + '</p>'; }

    var font = (ctx.isRTL || /Chinese|Japanese/.test(ctx.lang || '')) ? ctx.fontFamily : FONTS[cfg.font];
    var wrapOpen = '<div class="kv-cv" ' + ctx.dir + ' style="font-family:' + font + ';color:' + P.ink + ';background:' + P.bg + ';';
    return { P: P, o: o, avatar: avatar, photoImg: photoImg, hasPhoto: !!d.photo, L: L, contacts: contacts, contactLines: contactLines, contactRow: contactRow, monogram: monogram, skills: skills, langs: langs, head: head, jobs: jobs, edus: edus, summary: summary, wrapOpen: wrapOpen, skillStyle: cfg.skills, headKind: o.head };
  }

  /* ---------- layouts ---------- */
  var LAYOUT = {};

  function sidebarLayout(cfg, d, ctx, right) {
    var h = make(d, ctx, cfg), P = h.P, sw = h.o.sw || 220;
    var lightSide = /^#(e|f)/i.test(P.side);
    var sInk = P.sideInk, sAcc = lightSide ? P.acc : P.acc;
    var track = lightSide ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)';
    var side = '<div style="background:' + P.side + ';color:' + sInk + ';padding:28px 18px;">' +
      '<div style="margin:0 auto 14px;width:' + (d.photo ? 96 : 72) + 'px;">' + h.avatar(d.photo ? 96 : 72, lightSide ? '#fff' : 'rgba(255,255,255,0.08)', sAcc, lightSide ? P.acc : sAcc) + '</div>' +
      '<div style="font-size:13.5pt;font-weight:700;color:' + (lightSide ? P.ink : '#fff') + ';text-align:center;margin-bottom:3px;line-height:1.2;">' + esc(d.name) + '</div>' +
      '<div style="font-size:9pt;color:' + sInk + ';opacity:.8;text-align:center;margin-bottom:16px;">' + esc(d.title) + '</div>' +
      h.head(h.L('contact', 'Contact'), 'rule', sAcc, sAcc) + h.contactLines(sInk, '8.6pt') +
      h.head(h.L('skills', 'Skills'), 'rule', sAcc, sAcc) + h.skills(d.skills, h.skillStyle === 'text' ? 'dots' : h.skillStyle, sInk, sAcc, track, P.side) +
      ((d.languages || []).length ? h.head(h.L('languages', 'Languages'), 'rule', sAcc, sAcc) + h.langs(sInk) : '') + '</div>';
    var main = '<div style="padding:28px 26px;background:' + P.bg + ';">' +
      h.head(h.L('summary', 'Summary'), 'bar', P.ink, P.acc) + h.summary(P.ink) +
      h.head(h.L('experience', 'Experience'), 'bar', P.ink, P.acc) + h.jobs() +
      h.head(h.L('education', 'Education'), 'bar', P.ink, P.acc) + h.edus() + '</div>';
    return h.wrapOpen + 'display:grid;grid-template-columns:' + (right ? '1fr ' + sw + 'px' : sw + 'px 1fr') + ';">' + (right ? main + side : side + main) + '</div>';
  }
  LAYOUT.sidebarL = function (c, d, x) { return sidebarLayout(c, d, x, false); };
  LAYOUT.sidebarR = function (c, d, x) { return sidebarLayout(c, d, x, true); };

  LAYOUT.bandTop = function (cfg, d, ctx) {
    var h = make(d, ctx, cfg), P = h.P;
    var dark = !/^#(e|f)/i.test(P.side) || cfg.pal === 'orange';
    var bandInk = cfg.pal === 'orange' ? '#fff' : P.sideInk;
    var sideBg = P.soft, sideInk = P.ink, track = P.track;
    var bandBg = P.side;
    return h.wrapOpen + '">' +
      '<div style="background:' + bandBg + ';color:' + bandInk + ';padding:30px 32px 22px;display:flex;align-items:center;justify-content:space-between;gap:20px;"><div style="flex:1;">' +
      '<div style="font-size:22pt;font-weight:800;letter-spacing:-.01em;line-height:1.1;color:' + (cfg.pal === 'orange' ? '#fff' : (P.acc === '#ffffff' ? '#fff' : P.acc)) + ';">' + esc(d.name) + '</div>' +
      '<div style="font-size:10.5pt;margin-top:4px;opacity:.9;">' + esc(d.title) + '</div>' +
      '<div style="margin-top:10px;">' + h.contactRow(bandInk, '8.6pt') + '</div></div>' +
      (d.photo ? '<div style="flex:none;">' + h.photoImg(100, (cfg.pal === 'orange' ? '#fff' : P.acc), false) + '</div>' : '') + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 215px;">' +
      '<div style="padding:8px 26px 24px;">' + h.head(h.L('summary', 'Summary'), 'rule', P.ink, P.acc) + h.summary(P.ink) +
      h.head(h.L('experience', 'Experience'), 'rule', P.ink, P.acc) + h.jobs() + '</div>' +
      '<div style="background:' + sideBg + ';color:' + sideInk + ';padding:8px 18px 24px;">' +
      h.head(h.L('skills', 'Skills'), 'rule', P.ink, P.acc) + h.skills(d.skills, h.skillStyle === 'text' ? 'chips' : h.skillStyle, P.ink, P.acc, track, sideBg) +
      h.head(h.L('education', 'Education'), 'rule', P.ink, P.acc) + h.edus() +
      ((d.languages || []).length ? h.head(h.L('languages', 'Languages'), 'rule', P.ink, P.acc) + h.langs(P.ink) : '') + '</div></div></div>';
  };

  LAYOUT.centerClassic = function (cfg, d, ctx) {
    var h = make(d, ctx, cfg), P = h.P, hk = h.o.head || 'caps';
    return h.wrapOpen + 'padding:34px 40px;">' +
      '<div style="text-align:center;margin-bottom:6px;"><div style="font-size:24pt;font-weight:700;letter-spacing:.02em;color:' + P.ink + ';line-height:1.1;">' + esc(d.name) + '</div>' +
      '<div style="font-size:10.5pt;font-style:italic;color:' + P.acc + ';margin-top:5px;">' + esc(d.title) + '</div>' +
      '<div style="margin-top:9px;text-align:center;">' + h.contactRow(P.mute, '8.8pt') + '</div></div>' +
      h.head(h.L('summary', 'Summary'), hk, P.ink, P.acc) + h.summary(P.ink) +
      h.head(h.L('experience', 'Experience'), hk, P.ink, P.acc) + h.jobs() +
      h.head(h.L('education', 'Education'), hk, P.ink, P.acc) + h.edus() +
      h.head(h.L('skills', 'Skills'), hk, P.ink, P.acc) + h.skills(d.skills, h.skillStyle === 'bars' ? 'text' : h.skillStyle, P.ink, P.acc, P.track, P.bg) +
      ((d.languages || []).length ? h.head(h.L('languages', 'Languages'), hk, P.ink, P.acc) + '<div style="font-size:9.4pt;color:' + P.ink + ';">' + (d.languages || []).map(esc).join('  \u2022  ') + '</div>' : '') + '</div>';
  };

  LAYOUT.twoColLight = function (cfg, d, ctx) {
    var h = make(d, ctx, cfg), P = h.P;
    return h.wrapOpen + '">' +
      '<div style="padding:30px 32px 16px;border-bottom:4px solid ' + P.acc + ';display:flex;align-items:center;justify-content:space-between;gap:20px;"><div style="flex:1;">' +
      '<div style="font-size:23pt;font-weight:800;letter-spacing:-.01em;color:' + P.ink + ';line-height:1.1;">' + esc(d.name) + '</div>' +
      '<div style="font-size:11pt;font-weight:600;color:' + P.acc + ';margin-top:4px;">' + esc(d.title) + '</div>' +
      '<div style="margin-top:8px;">' + h.contactRow(P.mute, '8.7pt') + '</div></div>' +
      (d.photo ? '<div style="flex:none;">' + h.photoImg(94, P.acc) + '</div>' : '') + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 210px;">' +
      '<div style="padding:6px 28px 24px 32px;">' + h.head(h.L('summary', 'Summary'), 'bar', P.ink, P.acc) + h.summary(P.ink) +
      h.head(h.L('experience', 'Experience'), 'bar', P.ink, P.acc) + h.jobs() + '</div>' +
      '<div style="background:' + P.soft + ';padding:6px 18px 24px;">' +
      h.head(h.L('skills', 'Skills'), 'rule', P.ink, P.acc) + h.skills(d.skills, h.skillStyle, P.ink, P.acc, P.track, P.soft) +
      h.head(h.L('education', 'Education'), 'rule', P.ink, P.acc) + h.edus() +
      ((d.languages || []).length ? h.head(h.L('languages', 'Languages'), 'rule', P.ink, P.acc) + h.langs(P.ink) : '') + '</div></div></div>';
  };

  LAYOUT.timeline = function (cfg, d, ctx) {
    var h = make(d, ctx, cfg), P = h.P;
    var tl = (d.experience || []).map(function (j) {
      return '<div class="kv-job" style="position:relative;padding-inline-start:20px;margin-bottom:14px;border-inline-start:2px solid ' + P.line + ';">' +
        '<span style="position:absolute;inset-inline-start:-6px;top:3px;width:10px;height:10px;border-radius:50%;background:' + P.acc + ';"></span>' +
        '<div class="kv-job-title" style="color:' + P.ink + ';">' + esc(j.title || '') + '</div>' +
        '<div class="kv-job-meta" style="color:' + P.mute + ';">' + esc(j.company || '') + (j.dates ? esc(ctx.sep) + esc(j.dates) : '') + '</div>' +
        '<ul>' + (j.bullets || []).map(function (b) { return '<li style="color:' + P.ink + ';">' + esc(b) + '</li>'; }).join('') + '</ul></div>';
    }).join('');
    return h.wrapOpen + 'padding:32px 38px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-bottom:2px solid ' + P.ink + ';padding-bottom:12px;">' +
      '<div><div style="font-size:22pt;font-weight:800;line-height:1.1;color:' + P.ink + ';">' + esc(d.name) + '</div><div style="font-size:10.5pt;color:' + P.acc + ';font-weight:600;margin-top:4px;">' + esc(d.title) + '</div></div>' +
      '<div style="text-align:end;">' + h.contactLines(P.mute, '8.5pt') + '</div></div>' +
      h.head(h.L('summary', 'Summary'), 'plain', P.ink, P.acc) + h.summary(P.ink) +
      h.head(h.L('experience', 'Experience'), 'plain', P.ink, P.acc) + tl +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 26px;"><div>' + h.head(h.L('education', 'Education'), 'plain', P.ink, P.acc) + h.edus() + '</div>' +
      '<div>' + h.head(h.L('skills', 'Skills'), 'plain', P.ink, P.acc) + h.skills(d.skills, h.skillStyle, P.ink, P.acc, P.track, P.bg) +
      ((d.languages || []).length ? '<div style="margin-top:6px;">' + h.langs(P.ink) + '</div>' : '') + '</div></div></div>';
  };

  LAYOUT.bold = function (cfg, d, ctx) {
    var h = make(d, ctx, cfg), P = h.P, dark = cfg.pal === 'noir', big = h.o.big;
    var nameSize = big ? '34pt' : '27pt';
    return h.wrapOpen + 'padding:34px 38px;">' +
      '<div style="font-size:' + nameSize + ';font-weight:900;text-transform:uppercase;letter-spacing:-.02em;line-height:.98;color:' + P.ink + ';' + (big ? 'border-bottom:6px double ' + P.acc + ';padding-bottom:12px;' : '') + '">' + esc(d.name) + '</div>' +
      '<div style="display:inline-block;margin-top:12px;background:' + P.acc + ';color:' + (dark ? '#111' : (P.acc === '#111111' ? '#fff' : '#fff')) + ';font-size:10pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:5px 12px;' + (cfg.pal === 'mustard' ? 'color:#111;' : '') + '">' + esc(d.title) + '</div>' +
      '<div style="margin-top:12px;">' + h.contactRow(P.mute, '8.8pt') + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 200px;gap:0 28px;"><div>' +
      h.head(h.L('summary', 'Profile'), 'plain', P.ink, P.acc) + h.summary(P.ink) +
      h.head(h.L('experience', 'Experience'), 'plain', P.ink, P.acc) + h.jobs() + '</div><div>' +
      h.head(h.L('skills', 'Skills'), 'plain', P.ink, P.acc) + h.skills(d.skills, h.skillStyle === 'bars' ? 'bars' : (h.skillStyle === 'text' ? 'chips' : h.skillStyle), P.ink, P.acc, P.track, P.bg) +
      h.head(h.L('education', 'Education'), 'plain', P.ink, P.acc) + h.edus() +
      ((d.languages || []).length ? h.head(h.L('languages', 'Languages'), 'plain', P.ink, P.acc) + h.langs(P.ink) : '') + '</div></div></div>';
  };

  LAYOUT.infographic = function (cfg, d, ctx) {
    var h = make(d, ctx, cfg), P = h.P;
    var light = !!h.o.sideLight;
    var sBg = light ? P.soft : P.side, sInk = light ? P.ink : P.sideInk, track = light ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.18)';
    var side = '<div style="background:' + sBg + ';color:' + sInk + ';padding:26px 16px;">' +
      '<div style="margin:0 auto 12px;width:' + (d.photo ? 92 : 68) + 'px;">' + h.avatar(d.photo ? 92 : 68, light ? '#fff' : 'rgba(255,255,255,0.08)', P.acc, light ? P.acc : '#fff') + '</div>' +
      '<div style="font-size:13pt;font-weight:800;text-align:center;line-height:1.2;color:' + (light ? P.ink : '#fff') + ';">' + esc(d.name) + '</div>' +
      '<div style="font-size:8.8pt;text-align:center;opacity:.8;margin:3px 0 14px;">' + esc(d.title) + '</div>' +
      h.head(h.L('contact', 'Contact'), 'rule', P.acc, P.acc) + h.contactLines(sInk, '8.4pt') +
      h.head(h.L('skills', 'Skills'), 'rule', P.acc, P.acc) + h.skills(d.skills, 'rings', sInk, P.acc, track, sBg) +
      ((d.languages || []).length ? h.head(h.L('languages', 'Languages'), 'rule', P.acc, P.acc) + h.langs(sInk) : '') + '</div>';
    var main = '<div style="padding:26px 26px;">' + h.head(h.L('summary', 'Summary'), 'pill', P.ink, P.acc) + h.summary(P.ink) +
      h.head(h.L('experience', 'Experience'), 'pill', P.ink, P.acc) + h.jobs() +
      h.head(h.L('education', 'Education'), 'pill', P.ink, P.acc) + h.edus() + '</div>';
    return h.wrapOpen + 'display:grid;grid-template-columns:225px 1fr;">' + side + main + '</div>';
  };

  LAYOUT.cardGrid = function (cfg, d, ctx) {
    var h = make(d, ctx, cfg), P = h.P;
    function card(inner, extra) { return '<div style="background:#fff;border:1px solid ' + P.line + ';border-radius:10px;padding:14px 18px;margin-bottom:12px;' + (extra || '') + '">' + inner + '</div>'; }
    return h.wrapOpen + 'background:' + P.soft + ';padding:22px;">' +
      '<div style="background:' + (cfg.pal === 'blush' ? P.acc : P.side) + ';color:#fff;border-radius:12px;padding:22px 24px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:18px;"><div style="flex:1;">' +
      '<div style="font-size:21pt;font-weight:800;line-height:1.1;">' + esc(d.name) + '</div><div style="font-size:10.5pt;margin-top:4px;opacity:.92;">' + esc(d.title) + '</div>' +
      '<div style="margin-top:8px;">' + h.contactRow('#fff', '8.6pt') + '</div></div>' +
      (d.photo ? '<div style="flex:none;">' + h.photoImg(88, 'rgba(255,255,255,0.85)') + '</div>' : '') + '</div>' +
      card(h.head(h.L('summary', 'Summary'), 'plain', P.ink, P.acc).replace('margin-block:16px 8px;', 'margin-block:0 6px;') + h.summary(P.ink)) +
      card(h.head(h.L('experience', 'Experience'), 'plain', P.ink, P.acc).replace('margin-block:16px 8px;', 'margin-block:0 8px;') + h.jobs()) +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
      card(h.head(h.L('skills', 'Skills'), 'plain', P.ink, P.acc).replace('margin-block:16px 8px;', 'margin-block:0 8px;') + h.skills(d.skills, h.skillStyle, P.ink, P.acc, P.track, '#fff'), 'margin-bottom:0;') +
      card(h.head(h.L('education', 'Education'), 'plain', P.ink, P.acc).replace('margin-block:16px 8px;', 'margin-block:0 8px;') + h.edus() +
        ((d.languages || []).length ? h.head(h.L('languages', 'Languages'), 'plain', P.ink, P.acc).replace('margin-block:16px 8px;', 'margin-block:8px 6px;') + h.langs(P.ink) : ''), 'margin-bottom:0;') + '</div></div>';
  };

  LAYOUT.compactTable = function (cfg, d, ctx) {
    var h = make(d, ctx, cfg), P = h.P;
    var rows = (d.experience || []).map(function (j) {
      return '<div style="display:grid;grid-template-columns:105px 1fr;gap:0 14px;margin-bottom:11px;"><div style="font-size:8.6pt;color:' + P.mute + ';font-weight:600;padding-top:2px;">' + esc(j.dates || '') + '</div>' +
        '<div class="kv-job" style="margin-bottom:0;"><div class="kv-job-title" style="color:' + P.ink + ';">' + esc(j.title || '') + '</div><div class="kv-job-meta" style="color:' + P.acc + ';font-style:normal;font-weight:600;">' + esc(j.company || '') + '</div>' +
        '<ul>' + (j.bullets || []).map(function (b) { return '<li style="color:' + P.ink + ';">' + esc(b) + '</li>'; }).join('') + '</ul></div></div>';
    }).join('');
    var edu = (d.education || []).map(function (e) {
      return '<div style="display:grid;grid-template-columns:105px 1fr;gap:0 14px;margin-bottom:8px;"><div style="font-size:8.6pt;color:' + P.mute + ';font-weight:600;">' + esc(e.dates || '') + '</div><div><div class="kv-edu-degree" style="color:' + P.ink + ';">' + esc(e.degree || '') + '</div><div class="kv-edu-inst" style="color:' + P.mute + ';">' + esc(e.institution || '') + '</div></div></div>';
    }).join('');
    return h.wrapOpen + 'padding:30px 36px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:14px;border-bottom:3px solid ' + P.acc + ';padding-bottom:10px;">' +
      '<div><div style="font-size:21pt;font-weight:800;line-height:1.1;color:' + P.ink + ';">' + esc(d.name) + '</div><div style="font-size:10pt;color:' + P.acc + ';font-weight:600;margin-top:3px;">' + esc(d.title) + '</div></div>' +
      '<div style="text-align:end;">' + h.contactLines(P.mute, '8.4pt') + '</div></div>' +
      h.head(h.L('summary', 'Summary'), 'rule', P.ink, P.line) + h.summary(P.ink) +
      h.head(h.L('experience', 'Experience'), 'rule', P.ink, P.line) + rows +
      h.head(h.L('education', 'Education'), 'rule', P.ink, P.line) + edu +
      h.head(h.L('skills', 'Skills'), 'rule', P.ink, P.line) + h.skills(d.skills, h.skillStyle === 'bars' ? 'chips' : h.skillStyle, P.ink, P.acc, P.track, P.bg) +
      ((d.languages || []).length ? h.head(h.L('languages', 'Languages'), 'rule', P.ink, P.line) + '<div style="font-size:9.4pt;">' + (d.languages || []).map(esc).join('  \u2022  ') + '</div>' : '') + '</div>';
  };

  LAYOUT.railDates = function (cfg, d, ctx) {
    var h = make(d, ctx, cfg), P = h.P;
    function row(label, inner) { return '<div style="display:grid;grid-template-columns:118px 1fr;gap:0 18px;padding:14px 0;border-top:1px solid ' + P.line + ';"><div style="font-size:8pt;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:' + P.acc + ';padding-top:2px;">' + label + '</div><div>' + inner + '</div></div>'; }
    return h.wrapOpen + 'padding:34px 38px;">' +
      '<div style="margin-bottom:16px;"><div style="font-size:26pt;font-weight:700;line-height:1.05;color:' + P.ink + ';">' + esc(d.name) + '</div>' +
      '<div style="font-size:11pt;color:' + P.mute + ';margin-top:5px;font-style:italic;">' + esc(d.title) + '</div>' +
      '<div style="margin-top:9px;">' + h.contactRow(P.mute, '8.8pt') + '</div></div>' +
      row(h.L('summary', 'Profile'), h.summary(P.ink)) +
      row(h.L('experience', 'Experience'), h.jobs()) +
      row(h.L('education', 'Education'), h.edus()) +
      row(h.L('skills', 'Skills'), h.skills(d.skills, h.skillStyle === 'bars' ? 'chips' : h.skillStyle, P.ink, P.acc, P.track, P.bg)) +
      ((d.languages || []).length ? row(h.L('languages', 'Languages'), '<div style="font-size:9.4pt;">' + (d.languages || []).map(esc).join('  \u2022  ') + '</div>') : '') + '</div>';
  };

  LAYOUT.splitHeader = function (cfg, d, ctx) {
    var h = make(d, ctx, cfg), P = h.P;
    var lightHead = /^#(e|f)/i.test(P.side);
    var hi = lightHead ? P.ink : '#fff';
    return h.wrapOpen + '">' +
      '<div style="background:' + P.side + ';color:' + P.sideInk + ';padding:28px 34px;display:flex;align-items:center;gap:22px;">' +
      h.avatar(d.photo ? 96 : 78, 'rgba(255,255,255,0.06)', P.acc, P.acc) +
      '<div style="flex:1;"><div style="font-size:21pt;font-weight:700;line-height:1.1;color:' + hi + ';">' + esc(d.name) + '</div>' +
      '<div style="font-size:10.5pt;color:' + P.acc + ';margin-top:4px;letter-spacing:.06em;">' + esc(d.title) + '</div>' +
      '<div style="margin-top:8px;">' + h.contactRow(P.sideInk, '8.5pt') + '</div></div></div>' +
      '<div style="height:4px;background:' + P.acc + ';"></div>' +
      '<div style="display:grid;grid-template-columns:1fr 205px;">' +
      '<div style="padding:8px 26px 24px 34px;">' + h.head(h.L('summary', 'Summary'), 'rule', P.ink, P.acc) + h.summary(P.ink) +
      h.head(h.L('experience', 'Experience'), 'rule', P.ink, P.acc) + h.jobs() + '</div>' +
      '<div style="background:' + P.soft + ';padding:8px 18px 24px;">' +
      h.head(h.L('skills', 'Skills'), 'rule', P.ink, P.acc) + h.skills(d.skills, h.skillStyle === 'text' ? 'chips' : h.skillStyle, P.ink, P.acc, P.track, P.soft) +
      h.head(h.L('education', 'Education'), 'rule', P.ink, P.acc) + h.edus() +
      ((d.languages || []).length ? h.head(h.L('languages', 'Languages'), 'rule', P.ink, P.acc) + h.langs(P.ink) : '') + '</div></div></div>';
  };

  LAYOUT.frame = function (cfg, d, ctx) {
    var h = make(d, ctx, cfg), P = h.P;
    return h.wrapOpen + 'padding:16px;">' +
      '<div style="border:3px solid ' + P.acc + ';padding:5px;"><div style="border:1px solid ' + P.acc + ';padding:28px 34px;">' +
      '<div style="text-align:center;"><div style="font-size:23pt;font-weight:700;letter-spacing:.04em;color:' + P.ink + ';line-height:1.1;">' + esc(d.name) + '</div>' +
      '<div style="color:' + P.acc + ';letter-spacing:.4em;font-size:9pt;margin:6px 0;">\u2014 \u2726 \u2014</div>' +
      '<div style="font-size:10.5pt;font-style:italic;color:' + P.mute + ';">' + esc(d.title) + '</div>' +
      '<div style="margin-top:8px;">' + h.contactRow(P.mute, '8.6pt') + '</div></div>' +
      h.head(h.L('summary', 'Summary'), 'caps', P.acc, P.acc) + h.summary(P.ink) +
      h.head(h.L('experience', 'Experience'), 'caps', P.acc, P.acc) + h.jobs() +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px;"><div>' + h.head(h.L('education', 'Education'), 'caps', P.acc, P.acc) + h.edus() + '</div>' +
      '<div>' + h.head(h.L('skills', 'Skills'), 'caps', P.acc, P.acc) + h.skills(d.skills, 'text', P.ink, P.acc, P.track, P.bg) +
      ((d.languages || []).length ? '<div style="margin-top:8px;">' + h.langs(P.ink) + '</div>' : '') + '</div></div></div></div></div>';
  };

  LAYOUT.blueprint = function (cfg, d, ctx) {
    var h = make(d, ctx, cfg), P = h.P, light = !!h.o.light;
    var gridLine = light ? 'rgba(43,93,155,0.13)' : 'rgba(255,255,255,0.10)';
    var bgImg = 'background-image:linear-gradient(' + gridLine + ' 1px,transparent 1px),linear-gradient(90deg,' + gridLine + ' 1px,transparent 1px);background-size:22px 22px;';
    var ink = P.ink, acc = P.acc;
    function sec(t, inner) { return '<div style="border:1px dashed ' + P.line + ';padding:12px 16px 8px;margin-bottom:12px;position:relative;"><div style="position:absolute;top:-8px;inset-inline-start:12px;background:' + (light ? P.bg : P.bg) + ';padding:0 8px;font-size:8pt;letter-spacing:.2em;text-transform:uppercase;color:' + acc + ';font-weight:700;">' + t + '</div>' + inner + '</div>'; }
    return h.wrapOpen + bgImg + 'padding:32px 34px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:20px;"><div><div style="font-size:21pt;font-weight:700;letter-spacing:.03em;color:' + ink + ';line-height:1.1;">' + esc(d.name) + '</div>' +
      '<div style="font-size:10pt;color:' + acc + ';margin-top:4px;letter-spacing:.1em;text-transform:uppercase;">' + esc(d.title) + '</div></div>' +
      '<div style="text-align:end;">' + h.contactLines(P.mute, '8.3pt') + '</div></div>' +
      sec(h.L('summary', 'Summary'), h.summary(ink)) +
      sec(h.L('experience', 'Experience'), h.jobs({ title: ink, meta: acc, text: ink })) +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 14px;">' +
      sec(h.L('skills', 'Skills'), h.skills(d.skills, h.skillStyle, ink, acc, P.track, P.bg)) +
      sec(h.L('education', 'Education'), h.edus({ title: ink, meta: P.mute }) + ((d.languages || []).length ? '<div style="margin-top:6px;">' + h.langs(ink) + '</div>' : '')) + '</div></div>';
  };

  /* ---------- public API ---------- */
  window.KVX = {
    has: function (name) { return Object.prototype.hasOwnProperty.call(REG, name); },
    PHOTO_LAYOUTS: { sidebarL: 1, sidebarR: 1, infographic: 1, splitHeader: 1, bandTop: 1, cardGrid: 1, twoColLight: 1 },
    hasPhoto: function (name) { var c = REG[name]; return !!(c && this.PHOTO_LAYOUTS[c.layout]); },
    names: function () { return T.map(function (r) { return r[0]; }); },
    get: function (name) { return REG[name]; },
    list: function () { return T.map(function (r) { return REG[r[0]]; }); },
    render: function (name, d, ctx) {
      var cfg = REG[name];
      if (!cfg || !LAYOUT[cfg.layout]) return '';
      return (ctx.baseStyles || '') + LAYOUT[cfg.layout](cfg, d, ctx);
    }
  };
})();
