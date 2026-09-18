#!/usr/bin/env node
/* Davranis testi (bagimlilik yok): headless Chrome/Edge + --dump-dom.
 *
 * Dogrulananlar (oku.html = Kitap Modu, galeri.html = Galeri Modu):
 *   1. Asagi kaydirinca ust bar VE yan panel birlikte kapanir; kucuk/tepe kaydirmada kapanmaz.
 *   2. Yukari kaydirinca SADECE ust bar geri gelir; panel yalnizca elle (ok / K) acilir.
 *   3. Kenardaki ok panel ile tek parca: acikken panelin sag kenarina ve dikey ortasina
 *      yapisir, kapaliyken ekran kenarina (10px) doner; panel kayarken onu takip eder.
 *   4. Panel ve ust bar durumu localStorage'da saklanir.
 *   5. Okunan sayfa (kaldigi yer) yeniden acilista geri gelir.
 *   6. Ayraclar (B) konur/kaldirilir; sayfa seridinde isaretlenir ve saklanir.
 *
 * Kullanim:  node tools/ui-test.js
 * Cikis kodu: 0 = tumu gecti, 1 = en az bir kontrol basarisiz (CI icin uygun).
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const FILE_URL = 'file:///' + ROOT.replace(/\\/g, '/');

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const browser = CANDIDATES.find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
if (!browser) {
  console.log('! Chrome/Edge bulunamadi; davranis testi atlandi.');
  process.exit(0);
}

/* animasyonlari kapat: sanal zamanda donmus ara deger yerine nihai yerlesimi olcelim */
const NO_ANIM = '<style>*,*::before,*::after{transition:none!important;animation:none!important}</style>';

function build(file, pre, drive) {
  let t = fs.readFileSync(path.join(ROOT, file), 'utf8');
  t = t.replace('</head>', '<script>try{' + pre + '}catch(e){}</script>' + NO_ANIM + '\n</head>');
  t = t.replace(/<\/body>\s*<\/html>\s*$/i, '<script>' + drive + '</script>\n</body>\n</html>');
  const tmp = path.join(ROOT, '_t_' + path.basename(file, '.html') + '_uitest.html');
  fs.writeFileSync(tmp, t, 'utf8');
  return tmp;
}

function checks(file, size, pre, drive) {
  const tmp = build(file, pre, drive);
  const profile = path.join(os.tmpdir(), 'dn-uitest-' + Date.now() + '-' + Math.round(Math.random() * 1e6));
  let dom = '';
  try {
    dom = execFileSync(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-sandbox',
      '--window-size=' + size, '--user-data-dir=' + profile, '--virtual-time-budget=12000', '--dump-dom',
      FILE_URL + '/' + path.basename(tmp)], { encoding: 'utf8', maxBuffer: 1 << 28 });
  } finally {
    fs.unlinkSync(tmp);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) { /* yoksay */ }
  }
  const m = dom.match(/data-testlog="([^"]*)"/);
  if (!m) return [['kayit', 'log', 'yok (' + dom.length + ' karakter)']];
  return m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .split('~~').map(l => l.split('|'));
}

/* ---------- ortak test yardimcilari (sayfaya enjekte edilir) ---------- */
const HELPERS = `
var out = [];
function ck(ad, beklenen, gercek){ out.push(ad + '|' + beklenen + '|' + gercek); }
function has(c){ return document.body.classList.contains(c) ? '1' : '0'; }
function okEdge(panelId){
  var p = document.getElementById(panelId);
  return Math.max(10, Math.round(p.getBoundingClientRect().right - 9)) + 'px';
}
function okMid(panelId){
  var r = document.getElementById(panelId).getBoundingClientRect();
  return Math.round(r.top + r.height / 2) + 'px';
}
function bitir(){ document.documentElement.setAttribute('data-testlog', out.join('~~')); }
`;
/* ---------- OKU (Kitap Modu): pencere kaydirmasi ---------- */
const OKU_PRE = "localStorage.setItem('oku.ders','turkce');" +
  "localStorage.setItem('oku.sayfa.turkce','7');" +
  "localStorage.setItem('oku.panel.lib','0');";

const OKU_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  var fake = 0;
  try { Object.defineProperty(window, 'scrollY', { configurable: true, get: function(){ return fake; } }); }
  catch (e) { ck('scrollY taklidi', 'ok', e.message); }
  function step(y){ fake = y; window.dispatchEvent(new Event('scroll')); }

  /* 5. kalinan yerden devam */
  ck('kalinan sayfa sakli', '7', localStorage.getItem('oku.sayfa.turkce'));
  var rb = document.getElementById('resumeBtn');
  ck('devam dugmesi gorunur', '1', rb && !rb.hidden ? '1' : '0');
  ck('devam dugmesi sayfa 7', '1', rb && /sayfa\\s*7\\b/.test(rb.textContent) ? '1' : '0');

  /* 1. ust bar + panel: asagi kaydirinca IKISI de kapanir */
  var arrow = document.getElementById('edgeLeft');
  ck('baslangicta panel kapali', '1', has('no-lib'));
  step(0);
  ck('tepede ust bar acik', '0', has('hide-top'));
  step(40);
  ck('kucuk kaydirma gizlemez', '0', has('hide-top'));
  step(600);
  ck('asagi kaydirma ust bari gizler', '1', has('hide-top'));

  /* 2. yukari kaydirinca SADECE ust bar gelir; panel elle acilir */
  ck('asagi kaydirma paneli kapatir', '1', has('no-lib'));
  step(400);
  ck('yukari kaydirma ust bari geri getirir', '0', has('hide-top'));
  ck('yukari kaydirma paneli ACMAZ', '1', has('no-lib'));

  /* 3. ok panel ile tek parca */
  arrow.click();
  ck('ok paneli acar', '0', has('no-lib'));
  ck('ok acik durumuna gecer', '1', arrow.classList.contains('open') ? '1' : '0');
  ck('ok panel kenarina yapisik', okEdge('lib'), arrow.style.left);
  ck('ok panelin dikey ortasinda', okMid('lib'), arrow.style.top);
  ck('panel durumu sakli', '1', localStorage.getItem('oku.panel.lib'));

  /* elle acilan panel hemen kapanmaz; sonra asagi kaydirma kapatir */
  step(700);
  ck('elle acilan panel hemen kapanmaz', '0', has('no-lib'));
  var gercekNow = Date.now;
  Date.now = function(){ return gercekNow() + 4000; };
  step(900);
  ck('sonra asagi kaydirma paneli kapatir', '1', has('no-lib'));
  Date.now = gercekNow;
  ck('kapali ok ekran kenarinda', '10px', arrow.style.left);
  ck('ok kapali durumuna gecer', '0', arrow.classList.contains('open') ? '1' : '0');

  /* geri tepe */
  step(50);
  ck('tepeye donunce ust bar gelir', '0', has('hide-top'));
  bitir();
});
`;

/* ---------- GALERI: sahne kaydirmasi + ayraclar ---------- */
const GALERI_PRE = "localStorage.setItem('dn.subject','turkce');" +
  "localStorage.setItem('dn.page.turkce','7');" +
  "localStorage.setItem('dn.side','0');" +
  "localStorage.removeItem('dn.ayrac.turkce');";

const GALERI_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  var st = document.getElementById('stage');
  var fake = 0;
  try {
    Object.defineProperty(st, 'scrollTop', {
      configurable: true, get: function(){ return fake; }, set: function(v){ fake = v; }
    });
  } catch (e) { ck('scrollTop taklidi', 'ok', e.message); }
  function step(y){ fake = y; st.dispatchEvent(new Event('scroll')); }

  /* 5. kalinan yerden devam */
  ck('kalinan sayfa sakli', '7', localStorage.getItem('dn.page.turkce'));
  ck('kalinan sayfa acildi', '7', document.getElementById('pageInput').value);
  var img = document.querySelector('#paper img');
  ck('acilan sayfa dosyasi', '1', img && String(img.getAttribute('src')).indexOf('page-007') > -1 ? '1' : '0');

  /* 1. ust bar + panel: asagi kaydirinca IKISI de kapanir */
  var arrow = document.getElementById('edgeLeft');
  ck('baslangicta panel kapali', '1', has('no-side'));
  step(0);
  ck('tepede ust bar acik', '0', has('hide-top'));
  step(20);
  ck('kucuk kaydirma gizlemez', '0', has('hide-top'));
  step(600);
  ck('asagi kaydirma ust bari gizler', '1', has('hide-top'));

  /* 2. yukari kaydirinca SADECE ust bar gelir; panel elle acilir */
  ck('asagi kaydirma paneli kapatir', '1', has('no-side'));
  step(400);
  ck('yukari kaydirma ust bari geri getirir', '0', has('hide-top'));
  ck('yukari kaydirma paneli ACMAZ', '1', has('no-side'));

  /* 3. ok panel ile tek parca */
  arrow.click();
  ck('ok paneli acar', '0', has('no-side'));
  ck('ok acik durumuna gecer', '1', arrow.classList.contains('open') ? '1' : '0');
  ck('ok panel kenarina yapisik', okEdge('side'), arrow.style.left);
  ck('ok panelin dikey ortasinda', okMid('side'), arrow.style.top);
  ck('panel durumu sakli', '1', localStorage.getItem('dn.side'));

  /* elle acilan panel hemen kapanmaz; sonra asagi kaydirma kapatir */
  step(700);
  ck('elle acilan panel hemen kapanmaz', '0', has('no-side'));
  var gercekNow = Date.now;
  Date.now = function(){ return gercekNow() + 4000; };
  step(900);
  ck('sonra asagi kaydirma paneli kapatir', '1', has('no-side'));
  Date.now = gercekNow;
  ck('kapali ok ekran kenarinda', '10px', arrow.style.left);
  ck('ok kapali durumuna gecer', '0', arrow.classList.contains('open') ? '1' : '0');

  /* 6. ayraclar */
  ck('baslangicta ayrac yok', '0', String(document.querySelectorAll('#bmList .bm').length));
  document.getElementById('btnBm').click();
  ck('ayrac eklendi (satir)', '1', String(document.querySelectorAll('#bmList .bm').length));
  ck('ayrac saklandi', '[7]', localStorage.getItem('dn.ayrac.turkce'));
  ck('sayac guncellendi', '1', document.getElementById('bmCount').textContent);
  ck('seritte isaretlendi', '1', String(document.querySelectorAll('.thumb.bm').length));
  ck('dugme aktif', '1', document.getElementById('btnBm').classList.contains('on') ? '1' : '0');
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
  ck('B tusu ayraci kaldirir', '[]', localStorage.getItem('dn.ayrac.turkce'));
  ck('liste bosaldi', '0', String(document.querySelectorAll('#bmList .bm').length));
  document.querySelectorAll('.thumb')[3].click();
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
  var go = document.querySelector('#bmList .bm .go');
  ck('liste satiri sayfayi gosterir', 'Sayfa 4', go ? go.textContent : '-');
  bitir();
});
`;

/* ---------- kosum ---------- */
const CASES = [
  { ad: 'OKU masaustu 1440x1000', file: 'oku.html', size: '1440,1000', pre: OKU_PRE, drive: OKU_DRIVE },
  { ad: 'OKU telefon 412x880', file: 'oku.html', size: '412,880', pre: OKU_PRE, drive: OKU_DRIVE },
  { ad: 'GALERI masaustu 1440x1000', file: 'galeri.html', size: '1440,1000', pre: GALERI_PRE, drive: GALERI_DRIVE },
  { ad: 'GALERI telefon 412x880', file: 'galeri.html', size: '412,880', pre: GALERI_PRE, drive: GALERI_DRIVE },
];

let gecen = 0, kalan = 0;
CASES.forEach(c => {
  console.log('=== ' + c.ad + ' ===');
  checks(c.file, c.size, c.pre, c.drive).forEach(r => {
    const ad = r[0], beklenen = r[1], gercek = r[2];
    const ok = beklenen === gercek;
    ok ? gecen++ : kalan++;
    console.log('  ' + (ok ? 'GECTI' : 'KALDI') + '  ' + ad +
      (ok ? '' : '   (beklenen: ' + beklenen + ' | gercek: ' + gercek + ')'));
  });
});
console.log('\nSONUC: ' + gecen + ' gecti, ' + kalan + ' basarisiz');
process.exit(kalan ? 1 : 0);
