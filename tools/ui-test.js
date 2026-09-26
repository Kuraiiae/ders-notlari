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

function build(file, pre, drive, xform) {
  let t = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (xform) t = xform(t);
  t = t.replace('</head>', '<script>try{' + pre + '}catch(e){}</script>' + NO_ANIM + '\n</head>');
  /* surucu betigi cokerse sessizce log'suz kalmasin: hatayi test kaydina yaz
     (load icinde olusan hatalar icin ayrica 'error' dinleyicisi eklenir) */
  t = t.replace(/<\/body>\s*<\/html>\s*$/i,
    '<script>window.addEventListener("error",function(ev){' +
    'document.documentElement.setAttribute("data-testlog","TEST HATASI: " + (ev.message || "bilinmeyen") ' +
    '+ " | " + (ev.filename || "") + ":" + (ev.lineno || 0));});</script>\n' +
    '<script>try{' + drive + '}catch(err){' +
    'document.documentElement.setAttribute("data-testlog","TEST HATASI: " + ' +
    '(err && err.message ? err.message : String(err)) + " | " + ' +
    '((err && err.stack ? err.stack.split("\\n")[1] : "") || "").trim());}' +
    '</script>\n</body>\n</html>');
  const tmp = path.join(ROOT, '_t_' + path.basename(file, '.html') + '_uitest.html');
  fs.writeFileSync(tmp, t, 'utf8');
  return tmp;
}

function checks(file, size, pre, drive, xform) {
  const tmp = build(file, pre, drive, xform);
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
/* isaret karsilastirmasi: ✓/✗ karakterleri hem dogrudan hem kod yaninda
   (\u2713) gelebilir; ikisini de ayni etikete cevirir. */
function hid(x){ return String(x).replace(/\u2713/g,'U2713').replace(/\u2717/g,'U2717'); }
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

  /* 4. odak modu: ok yerinde + saydam, kapatma sol ustte */
  document.getElementById('btnFocus').click();
  ck('odak acilir', '1', has('focus'));
  ck('odakta ok gizlenmez', 'true', String(!!document.getElementById('edgeLeft') && getComputedStyle(document.getElementById('edgeLeft')).display !== 'none'));
  ck('odakta ok saydam', 'true', String(parseFloat(getComputedStyle(document.getElementById('edgeLeft')).opacity) < 0.9));
  ck('odak kapatma sol ustte gorunur', '1', String((function(){ var b = document.getElementById('focusExit'); if (!b) return false; var r = b.getBoundingClientRect(); return getComputedStyle(b).display !== 'none' && r.left < 60 && r.top < 60; })() ? '1' : '0'));
  ck('odak sakli', '1', localStorage.getItem('oku.odak'));
  document.getElementById('focusExit').click();
  ck('odak kapatma dugmesi kapatir', '0', has('focus'));

  /* 5. akordeon: Dersler / Denemeler acilip kapanir */
  var grpD = document.querySelector(".grpbtn[data-grp='ders']");
  ck('ders grubu baslangicta acik', '0', has('grp-ders-kapali'));
  grpD.click();
  ck('ders grubu kapanir', '1', has('grp-ders-kapali'));
  ck('grup tercihi sakli', '0', localStorage.getItem('oku.grp.ders'));
  grpD.click();
  ck('ders grubu acilir', '0', has('grp-ders-kapali'));

  /* 6. yardimci balon: sol altta, acilip kapanir, zum yapar */
  var fab = document.getElementById('fab');
  var fr = fab.getBoundingClientRect();
  ck('yardimci sol altta', '1', String(fr.left < 60 && (window.innerHeight - fr.bottom) < 60 ? '1' : '0'));
  document.getElementById('fabMain').click();
  ck('yardimci acilir', '1', fab.classList.contains('open') ? '1' : '0');
  var w0 = document.documentElement.style.getPropertyValue('--colw');
  document.getElementById('fabZoomIn').click();
  ck('yardimci zum yapar', '1', String(document.documentElement.style.getPropertyValue('--colw') !== w0 ? '1' : '0'));
  document.getElementById('fabMain').click();
  ck('yardimci kapanir', '0', fab.classList.contains('open') ? '1' : '0');

  /* 7. konu ozeti: cekmece acilir, basliklar renkli */
  document.getElementById('btnOzet').click();
  ck('ozet cekmecesi acilir', '1', String(!document.getElementById('ozDrawer').hidden ? '1' : '0'));
  ck('ozet basligi renkli', '1', String(document.querySelector('#ozBody h5.oz-t1') ? '1' : '0'));
  document.getElementById('ozClose').click();
  ck('ozet cekmecesi kapanir', '0', document.getElementById('ozDrawer').classList.contains('show') ? '1' : '0');

  /* 8. duyarli ust bar + gece opakligi */
  var dar = window.innerWidth < 761;
  ck('ust bar duyarli', dar ? '1' : '0', String(getComputedStyle(document.getElementById('subjectSeg')).display === 'none' ? '1' : '0'));
  var css = '';
  try { for (var sh of document.styleSheets) { try { for (var rl of sh.cssRules) { css += rl.cssText + ' '; } } catch (e) {} } } catch (e) {}
  ck('gece opak bar kurali', '1', String(css.indexOf('html[data-theme="dark"] header.bar') > -1 ? '1' : '0'));
  bitir();

});
`;

/* ---------- OKU (Kitap Modu): Kart Modu / test akisi (A–E isaretleme) ----------
   Kart Modu cevap anahtari GEREKTIRMEZ: her soruda A–E secenekleri cikar,
   secim kirmizi isaretlenir ve yesil tik alir. Anahtar (varsa) yalnizca
   "Denemeyi bitir" sonrasi puanlamada kullanilir. */
const QUIZ_PRE = "localStorage.setItem('oku.ders','turkce-test');" +
  "localStorage.removeItem('oku.quiz.turkce-test');" +
  "localStorage.setItem('oku.panel.lib','0');";

const QUIZ_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  function kart(i){ return document.querySelectorAll('#pages .qcard, #pages .page')[i] || document.querySelectorAll('#pages .qhotspots')[i]; }
  function dug(i){
    var hs = Array.prototype.slice.call(document.querySelectorAll('#pages .qhotspot'));
    if (hs.length) {
      var qids = [];
      hs.forEach(function(b){ if (b.dataset.qid && qids.indexOf(b.dataset.qid) === -1) qids.push(b.dataset.qid); });
      var id = qids[i] || qids[0];
      return document.querySelectorAll('#pages .qhotspot[data-qid="' + id + '"]');
    }
    var k = kart(i); return k ? k.querySelectorAll('.qo button') : [];
  }

  ck('test modu acildi', '1', has('quiz'));
  ck('soru karti cizildi', '1', kart(0) ? '1' : '0');
  var cubuk = document.getElementById('quizBar');
  ck('cubuk okuma kolonunda', '1', document.querySelector('main.col').contains(cubuk) ? '1' : '0');
  ck('cubuk kart akisinin ustunde', '1',
     cubuk.getBoundingClientRect().top < document.getElementById('pages').getBoundingClientRect().top ? '1' : '0');
  ck('cubuk yapiskan', 'sticky', getComputedStyle(cubuk).position);
  var d = dug(0);
  ck('her soruda bes sik', '5', String(d.length));
  ck('siklar A-E', 'ABCDE', Array.prototype.map.call(d, function(b){ return b.dataset.h; }).join(''));
  ck('bitirmeden anahtar gorunmez', '0', String(document.querySelectorAll('#pages .qhotspot.ok,#pages .qhotspot.bad,#pages .qo button.ok,#pages .qo button.bad').length));
  ck('toplam soru sayaci', '222', document.getElementById('quizTotal').textContent);
  ck('anahtarli sette puanlama gorunur', '1', document.getElementById('quizScoreBox').hidden ? '0' : '1');
  ck('anahtar bekleme notu gizli', '1', document.getElementById('quizWait').hidden ? '1' : '0');

  /* isaretleme: secim kirmizi + yesil tik, saklanir */
  dug(0)[1].click();
  ck('secili sik isaretli', '1', dug(0)[1].classList.contains('sel') ? '1' : '0');
  ck('kart tamamlandi', '1', (kart(0) && (kart(0).classList.contains('done') || document.querySelectorAll('#pages .qhotspot.sel').length > 0)) ? '1' : '0');
  ck('sayac isaretli 1', '1', document.getElementById('quizMarked').textContent);
  ck('secim saklandi', 'B', (function(){ try { return JSON.parse(localStorage.getItem('oku.quiz.turkce-test') || '{}')['2:11'] || '-'; } catch (e) { return 'hata'; } })());
  dug(0)[1].click();
  ck('ayni sik isareti kaldirir', '0', (kart(0) && kart(0).classList.contains('done')) ? '1' : '0');

  /* "Anahtari goster": sonuc penceresini ACMADAN anahtar/renkli siklar */
  ck('anahtar dugmesi var', '1', document.getElementById('quizAnahtar') ? '1' : '0');
  document.getElementById('quizAnahtar').click();
  ck('anahtar acikken dogru sik yesil', '1', String(document.querySelectorAll('#pages .qhotspot.ok, #pages .qo button.ok').length ? '1' : '0'));
  ck('anahtar dugmesi gizle yazar', '1',
     document.getElementById('quizAnahtar').textContent.indexOf('gizle') > -1 ? '1' : '0');
  ck('anahtar sonuc penceresi acmaz', '1', document.getElementById('quizModal').hidden ? '1' : '0');
  ck('anahtar acikken puanlama gorunur', '1', document.getElementById('quizScoreBox').hidden ? '0' : '1');
  document.getElementById('quizAnahtar').click();
  ck('anahtar gizlenince tikler kalkar', '0', String(document.querySelectorAll('#pages .qhotspot.ok,#pages .qo button.ok').length));
  ck('anahtar dugmesi goster yazar', '1',
     document.getElementById('quizAnahtar').textContent.indexOf('göster') > -1 ? '1' : '0');

  /* ikinci soruyu bos birak: sonuc dagilimi olussun */
  dug(0)[0].click();
  dug(1)[3].click();
  ck('iki soru isaretli', '2', document.getElementById('quizMarked').textContent);

  /* "Denemeyi bitir" sonrasi ok/bad */
  document.getElementById('quizFinish').click();
  ck('bitir sonrasi dogru sik ok', '1', String(document.querySelectorAll('#pages .qhotspot.ok').length ? '1' : '0'));
  document.getElementById('quizClose').click();

  document.getElementById('quizFinish').click();
  ck('sonuc penceresi acilir', '1', !document.getElementById('quizModal').hidden ? '1' : '0');
  ck('zorluk analizi tablosu', '1', document.querySelector('#quizRows .ad') ? '1' : '0');
  ck('analizde bes sik satiri', '5', String(document.querySelectorAll('#quizRows .ad .gr:not(.sum)').length));
  ck('sonuc satirlari tum sorular', '222', String(document.querySelectorAll('#quizRows .row').length));
  ck('sonuc satirinda sik ozeti', '1', String(document.querySelectorAll('#quizRows .row .a').length ? '1' : '0'));
  ck('dogru/yanlis isareti var', '1', String(/Dogru|Yanlis|Bo\u015f/.test(document.getElementById('quizRows').textContent) ? '1' : '0'));
  document.getElementById('quizClose').click();
  ck('sonuc penceresi kapanir', '0', document.getElementById('quizModal').classList.contains('open') ? '1' : '0');
  document.getElementById('quizReset').click();
  ck('sifirla isaretleri temizler', '{}', localStorage.getItem('oku.quiz.turkce-test'));
  ck('sifirla tikleri kaldirir', '0', String(document.querySelectorAll('#pages .qcard.done').length));
  bitir();
});
`;

/* telefonda: isaretleyince otomatik sonraki soruya gecilir */
const QUIZ_TEL_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  function kart(i){ return document.querySelectorAll('#pages .qcard, #pages .page')[i] || document.querySelectorAll('#pages .qhotspots')[i]; }
  function dug(i){
    var hs = Array.prototype.slice.call(document.querySelectorAll('#pages .qhotspot'));
    if (hs.length) {
      var qids = [];
      hs.forEach(function(b){ if (b.dataset.qid && qids.indexOf(b.dataset.qid) === -1) qids.push(b.dataset.qid); });
      var id = qids[i] || qids[0];
      return document.querySelectorAll('#pages .qhotspot[data-qid="' + id + '"]');
    }
    var k = kart(i); return k ? k.querySelectorAll('.qo button') : [];
  }
  ck('telefonda kart var', '1', kart(0) ? '1' : '0');
  var bar = document.getElementById('quizBar');
  ck('cubuk telefonda yapiskan', 'sticky', getComputedStyle(bar).position);
  ck('cubuk basligin altinda', '62px', getComputedStyle(bar).top);
  document.body.classList.add('hide-top');
  ck('baslik gizlenince cubuk yukari kayar', '8px', getComputedStyle(bar).top);
  document.body.classList.remove('hide-top');
  var d0 = dug(0);
  ck('dokunmatik hedef buyuk', '1',
     (d0 && d0[0] && d0[0].getBoundingClientRect().height >= 10) ? '1' : '0');
  if (d0 && d0[2]) d0[2].click();
  setTimeout(function(){
    var r = (function(){
      var kartlar = Array.prototype.slice.call(document.querySelectorAll('#pages .qcard, #pages .page'));
      for (var i = 0; i < kartlar.length; i++) {
        if (kartlar[i].dataset.qid === '3:1') return kartlar[i + 1] ? kartlar[i + 1].getBoundingClientRect() : null;
      }
      return kart(1) ? kart(1).getBoundingClientRect() : null;
    })();
    ck('isaret sonrasi sonraki soru ekranda', '1',
       r && r.top > -80 && r.top < window.innerHeight ? '1' : '0');
    bitir();
  }, 1200);
});
`;

/* anahtarsiz set: turkce-cikmis ARTIK anahtarli; test icin HTML duzeyinde
   (build asamasinda) ANAHTARLAR silinir — anahtarlar quizData blogunun
   "keys" alaninda durur (quizText yalnizca kok metnidir). Calisma aninda
   silmek gec kalir: ana betik DOMContentLoaded'dan once veriyi okuyup
   onbellege alir. Boylece anahtarsiz mod davranisi (bekleme notu, puanlama
   kapali) yine dogrulanir. */
const anahtarsizYap = t => t.replace(
  /(<script[^>]*id="quizData"[^>]*>)([\s\S]*?)(<\/script>)/,
  (m, acik, govde, kapanis) => {
    try {
      const v = JSON.parse(govde);
      if (v['turkce-cikmis'] && v['turkce-cikmis'].keys) v['turkce-cikmis'].keys = {};
      return acik + JSON.stringify(v) + kapanis;
    } catch (e) { return m; }
  });

const QUIZ_KEYLESS_PRE = "localStorage.setItem('oku.ders','turkce-cikmis');" +
  "localStorage.removeItem('oku.quiz.turkce-cikmis');" +
  "localStorage.setItem('oku.panel.lib','0');";

const QUIZ_KEYLESS_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  function kart(i){ return document.querySelectorAll('#pages .qcard, #pages .page')[i] || document.querySelectorAll('#pages .qhotspots')[i]; }
  function dug(i){
    var hs = Array.prototype.slice.call(document.querySelectorAll('#pages .qhotspot'));
    if (hs.length) {
      var qids = [];
      hs.forEach(function(b){ if (b.dataset.qid && qids.indexOf(b.dataset.qid) === -1) qids.push(b.dataset.qid); });
      var id = qids[i] || qids[0];
      return document.querySelectorAll('#pages .qhotspot[data-qid="' + id + '"]');
    }
    var k = kart(i); return k ? k.querySelectorAll('.qo button') : [];
  }
  ck('anahtarsiz sette kart var', '1', kart(0) ? '1' : '0');
  ck('anahtarsiz sette puanlama kapali', '1', document.getElementById('quizScoreBox').hidden ? '1' : '0');
  ck('anahtarsiz sette bekleme notu', '1', document.getElementById('quizWait').hidden ? '0' : '1');
  ck('anahtarsiz sette de bes sik', '5', String(dug(0).length));
  var bs = dug(0);
  for(var j=0;j<bs.length;j++){ if(bs[j].dataset.h==='E') bs[j].click(); }
  ck('anahtarsiz sette isaret calisir', '1', (kart(0) && (kart(0).classList.contains('done') || document.querySelectorAll('#pages .qhotspot.sel').length > 0)) ? '1' : '0');
  ck('anahtarsiz sette secim saklandi', 'E', (function(){ try { return JSON.parse(localStorage.getItem('oku.quiz.turkce-cikmis') || '{}')['1:1'] || '-'; } catch (e) { return 'hata'; } })());
  document.getElementById('quizFinish').click();
  ck('anahtarsiz sette sonuc acilir', '1', document.getElementById('quizModal').hidden ? '0' : '1');
  ck('anahtarsiz sette analiz yok', '0', document.querySelector('#quizRows .ad') ? '1' : '0');
  ck('anahtarsiz sette satir uyarisi', '1',
     /anahtar yok/.test(document.getElementById('quizRows').textContent) ? '1' : '0');
  document.getElementById('quizClose').click();
  bitir();
});
`;

/* deneme seti: 20 testlik karma banka; anahtar 289/320 (kalanlar konu
   anlatimi icinden cozum/ornek bloklari + cikarilamayan 9 soru) */
const QUIZ_DENEME_PRE = "localStorage.setItem('oku.ders','deneme');" +
  "localStorage.removeItem('oku.quiz.deneme');" +
  "localStorage.setItem('oku.panel.lib','0');";

const QUIZ_DENEME_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  function kart(i){ return document.querySelectorAll('#pages .qcard, #pages .page')[i] || document.querySelectorAll('#pages .qhotspots')[i]; }
  function dug(i){
    var hs = Array.prototype.slice.call(document.querySelectorAll('#pages .qhotspot'));
    if (hs.length) {
      var qids = [];
      hs.forEach(function(b){ if (b.dataset.qid && qids.indexOf(b.dataset.qid) === -1) qids.push(b.dataset.qid); });
      var id = qids[i] || qids[0];
      return document.querySelectorAll('#pages .qhotspot[data-qid="' + id + '"]');
    }
    var k = kart(i); return k ? k.querySelectorAll('.qo button') : [];
  }
  ck('deneme test modu acildi', '1', has('quiz'));
  ck('deneme toplam soru sayaci', '320', document.getElementById('quizTotal').textContent);
  ck('deneme puanlama kutusu gorunur', '1', document.getElementById('quizScoreBox').hidden ? '0' : '1');
  /* ilk iki anahtarli soru: s.29 n1 (E) ve s.32 n14 (B) */
  dug(9)[4].click();
  ck('deneme sik E isaretli', '1', dug(9)[4].classList.contains('sel') ? '1' : '0');
  dug(14)[1].click();
  ck('deneme sik B isaretli', '1', dug(14)[1].classList.contains('sel') ? '1' : '0');
  ck('deneme iki isaret', '2', document.getElementById('quizMarked').textContent);
  document.getElementById('quizFinish').click();
  ck('deneme sonuc acilir', '1', !document.getElementById('quizModal').hidden ? '1' : '0');
  ck('deneme analiz tablosu', '1', document.querySelector('#quizRows .ad') ? '1' : '0');
  ck('deneme dogru sikta okey', '1', dug(9)[4].classList.contains('ok') ? '1' : '0');
  ck('deneme dogru sikta okey 2', '1', dug(14)[1].classList.contains('ok') ? '1' : '0');
  ck('deneme kart basligi tik', '0', String(kart(9).querySelector('.tick.bad') ? '1' : '0'));
  ck('deneme sonucta dogru satiri', '1', /Do\\u011fru/.test(document.getElementById('quizRows').textContent) ? '1' : '0');
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

  /* 4. akordeon: Dersler / Denemeler acilip kapanir */
  var grpD = document.querySelector(".grpbtn[data-grp='ders']");
  ck('ders grubu baslangicta acik', '0', has('grp-ders-kapali'));
  grpD.click();
  ck('ders grubu kapanir', '1', has('grp-ders-kapali'));
  ck('grup tercihi sakli', '0', localStorage.getItem('dn.grp.ders'));
  grpD.click();
  ck('ders grubu acilir', '0', has('grp-ders-kapali'));

  /* 5. yardimci balon: sol altta, zum + tema yapar */
  var fab = document.getElementById('fab');
  var fr = fab.getBoundingClientRect();
  ck('yardimci sol altta', '1', String(fr.left < 60 && (window.innerHeight - fr.bottom) < 60 ? '1' : '0'));
  document.getElementById('fabMain').click();
  ck('yardimci acilir', '1', fab.classList.contains('open') ? '1' : '0');
  document.getElementById('fabZoomIn').click();
  ck('yardimci zum yapar', '1', String(document.getElementById('zoomVal').textContent !== '100%' ? '1' : '0'));
  document.getElementById('fabTheme').click();
  ck('yardimci tema degisir', 'light', document.documentElement.dataset.theme);
  document.getElementById('fabMain').click();
  ck('yardimci kapanir', '0', fab.classList.contains('open') ? '1' : '0');

  /* 6. duyarli ust bar + gece opakligi */
  var dar = window.innerWidth < 901;
  ck('ust bar duyarli', dar ? '1' : '0', String(getComputedStyle(document.getElementById('subjectSeg')).display === 'none' ? '1' : '0'));
  var css = '';
  try { for (var sh of document.styleSheets) { try { for (var rl of sh.cssRules) { css += rl.cssText + ' '; } } catch (e) {} } } catch (e) {}
  ck('gece opak bar kurali', '1', String(css.indexOf('html[data-theme="dark"] header.bar') > -1 ? '1' : '0'));

  /* 7. ayraclar */

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

/* ---------- VIEWER (Dinamik Sunum): set secimi + test modu ----------
   viewer.html tarih disindaki setleri assets/<set>/page-NNN.jpg gorseli
   olarak acar; test modu (A–E) Kitap Modu/Galeri ile ayni `oku.quiz.<set>`
   isaret deposunu kullanir. Anahtar "Anahtari goster" ya da "Denemeyi
   bitir" sonrasi gorunur. */
const VIEWER_PRE = "localStorage.setItem('dn.viewer.ders','deneme');" +
  "localStorage.setItem('dn.viewer.sayfa.deneme','1');" +
  "localStorage.removeItem('oku.quiz.deneme');" +
  "sessionStorage.removeItem('dn.qz.kapali');";

const VIEWER_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  var veri = {};
  try { veri = JSON.parse(document.getElementById('quizData').textContent)['deneme'] || {}; } catch (e) {}
  /* iki anahtarli sorusu olan ilk sayfa: puanlama dogrulanabilsin */
  var secim = null, cift = [];
  Object.keys(veri.pages || {}).map(Number).sort(function(a, b){ return a - b; }).forEach(function(p){
    if (secim) return;
    var m = (veri.keys || {})[String(p)] || {};
    var nos = (veri.pages[String(p)] || []).filter(function(n){ return !!m[String(n)]; });
    if (nos.length >= 2) { secim = p; cift = nos.slice(0, 2); }
  });
  function kart(n){ return document.querySelector('.qcard[data-qid="' + secim + ':' + n + '"]'); }
  function dug(n){ return kart(n).querySelectorAll('.qo button'); }

  ck('gorsel set (deneme) acildi', '1', document.getElementById('sbSet').textContent.indexOf('Deneme') > -1 ? '1' : '0');
  ck('deneme sayfa sayisi', '102', document.getElementById('tbTot').textContent);
  ck('tarih disi set gorsel modda', '1', document.querySelector('.pg-card.pg-img img') ? '1' : '0');
  ck('sayfa gorseli assets yolunda', '1',
     String(document.querySelector('.pg-card.pg-img img').getAttribute('src')).indexOf('assets/deneme/page-001.jpg') > -1 ? '1' : '0');
  ck('sorusuz sayfada test dugmesi gizli', '1', document.getElementById('qzToggle').hidden ? '1' : '0');
  ck('sorusuz sayfada cekmece kapali', '0', has('qz-open'));

  selectPage(secim);
  setTimeout(function(){
    var b1 = dug(cift[0]), b2 = dug(cift[1]);
    var k1 = veri.keys[String(secim)][String(cift[0])], k2 = veri.keys[String(secim)][String(cift[1])];
    var yanlis = (k1 === 'A') ? 'B' : 'A';
    ck('soru sayfasi acildi', String(secim), document.getElementById('tbCur').textContent);
    ck('sorular kart olarak cizildi', String(veri.pages[String(secim)].length),
       String(document.querySelectorAll('#qzCards .qcard').length));
    ck('her soruda bes sik', '5', String(b1.length));
    ck('test dugmesi gorunur', '0', document.getElementById('qzToggle').hidden ? '1' : '0');
    ck('dugmede soru sayisi', String(veri.pages[String(secim)].length), document.getElementById('qzBadge').textContent);
    ck('soru sayfasinda cekmece acilir', '1', has('qz-open'));
    ck('anahtar kendiliginden gorunmez', '0', String(document.querySelectorAll('#qzCards .qo button.ok').length));

    b1[yanlis.charCodeAt(0) - 65].click();
    b2[k2.charCodeAt(0) - 65].click();
    ck('secim kartta isaretlendi', '1', kart(cift[0]).classList.contains('done') ? '1' : '0');
    ck('secim saklandi', '2', String(Object.keys(JSON.parse(localStorage.getItem('oku.quiz.deneme') || '{}')).length));
    ck('sayac iki isaret', '2', document.getElementById('qzMarked').textContent);

    /* "Anahtari goster": sayfa anahtari serit halinde + renkli siklar */
    document.getElementById('qzKeyBtn').click();
    b1 = dug(cift[0]);
    ck('anahtar seridi acildi', '1', document.getElementById('qzKeyStrip').classList.contains('on') ? '1' : '0');
    ck('seritte sayfa anahtari', '1',
       document.getElementById('qzKeyStrip').textContent.indexOf('Sayfa ' + secim) > -1 ? '1' : '0');
    ck('seritte gercek harf', '1',
       document.getElementById('qzKeyStrip').textContent.indexOf('S.' + cift[0] + ' ' + k1) > -1 ? '1' : '0');
    ck('dogru sik yesil', '1', b1[k1.charCodeAt(0) - 65].classList.contains('ok') ? '1' : '0');
    ck('yanlis secim kirmizi', '1', b1[yanlis.charCodeAt(0) - 65].classList.contains('bad') ? '1' : '0');
    ck('yanlis kartta carpi', '1', kart(cift[0]).querySelector('.tick.bad') ? '1' : '0');
    ck('dugme metni anahtari gizler', '1',
       document.getElementById('qzKeyBtn').textContent.indexOf('gizle') > -1 ? '1' : '0');
    bitir();
  }, 1000);
});
`;

/* tarih seti: HTML sayfalar iframe ile acilir, test modu YOK (regresyon) */
const VIEWER_TARIH_PRE = "localStorage.setItem('dn.viewer.ders','tarih');" +
  "localStorage.setItem('dn.viewer.sayfa.tarih','1');" +
  "sessionStorage.removeItem('dn.qz.kapali');";

const VIEWER_TARIH_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  ck('tarih seti secildi', '1', document.getElementById('sbSet').textContent.indexOf('Tarih') > -1 ? '1' : '0');
  ck('tarih sayfa sayisi', '169', document.getElementById('tbTot').textContent);
  ck('tarih iframe modda', '1', document.querySelector('iframe.pg-card') ? '1' : '0');
  ck('iframe kaynagi page_1', '1',
     String(document.querySelector('iframe.pg-card').getAttribute('src')).indexOf('page_1.html') > -1 ? '1' : '0');
  ck('tarihte test dugmesi gizli', '1', document.getElementById('qzToggle').hidden ? '1' : '0');
  ck('tarihte cekmece kapali', '0', has('qz-open'));
  ck('set rozetleri listelendi', '7', String(document.querySelectorAll('.sb-set-b').length));
  ck('tek set secili', '1', String(document.querySelectorAll('.sb-set-b.on').length));
  bitir();
});
`;

/* ---------- GALERI test modu (deneme): alt panel + anahtar dugmeleri ---------- */
const GALERI_QUIZ_PRE = "localStorage.setItem('dn.subject','deneme');" +
  "localStorage.setItem('dn.page.deneme','1');" +
  "localStorage.setItem('dn.spread','0');" +
  "localStorage.removeItem('oku.quiz.deneme');" +
  "sessionStorage.removeItem('dn.qz.kapali');";

const GALERI_QUIZ_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  var veri = {};
  try { veri = JSON.parse(document.getElementById('quizData').textContent)['deneme'] || {}; } catch (e) {}
  var secim = null, cift = [];
  Object.keys(veri.pages || {}).map(Number).sort(function(a, b){ return a - b; }).forEach(function(p){
    if (secim) return;
    var m = (veri.keys || {})[String(p)] || {};
    var nos = (veri.pages[String(p)] || []).filter(function(n){ return !!m[String(n)]; });
    if (nos.length >= 2) { secim = p; cift = nos.slice(0, 2); }
  });
  function kart(n){ return document.querySelector('.qcard[data-qid="' + secim + ':' + n + '"]'); }
  function dug(n){ return kart(n).querySelectorAll('.qo button'); }
  function sonDugme(ad){ return document.querySelector('.qz-son [data-qz="' + ad + '"]'); }

  ck('deneme dersi acildi', '1', document.getElementById('pageTotal').textContent === '/ 102' ? '1' : '0');
  ck('sorusuz sayfada test dugmesi gizli', '1', document.getElementById('qzToggle').hidden ? '1' : '0');
  ck('sorusuz sayfada panel kapali', '0', has('qz-acik'));

  go(secim);
  setTimeout(function(){
    var k1 = veri.keys[String(secim)][String(cift[0])];
    var k2 = veri.keys[String(secim)][String(cift[1])];
    var yanlis = (k1 === 'A') ? 'B' : 'A';
    ck('soru sayfasi acildi', String(secim), document.getElementById('pageInput').value);
    ck('sorular kart olarak cizildi', String(veri.pages[String(secim)].length),
       String(document.querySelectorAll('#qzCards .qcard').length));
    ck('her soruda bes sik', '5', String(dug(cift[0]).length));
    ck('sayfa sonunda anahtar dugmesi', '1', sonDugme('key') ? '1' : '0');
    ck('sayfa sonunda bitir dugmesi', '1', sonDugme('finish') ? '1' : '0');
    ck('test paneli kendiliginden acilir', '1', has('qz-acik'));
    ck('anahtar kendiliginden gorunmez', '0', String(document.querySelectorAll('#qzCards .qo button.ok').length));

    dug(cift[0])[yanlis.charCodeAt(0) - 65].click();
    dug(cift[1])[k2.charCodeAt(0) - 65].click();
    ck('secim kartta isaretlendi', '1', kart(cift[0]).classList.contains('done') ? '1' : '0');
    ck('secim saklandi', '2', String(Object.keys(JSON.parse(localStorage.getItem('oku.quiz.deneme') || '{}')).length));
    ck('panel sayaci iki isaret', '2', document.getElementById('qzMarked').textContent);

    /* sayfa sonundaki "Cevap anahtarini goster" */
    sonDugme('key').click();
    ck('anahtar seridi acildi', '1', document.getElementById('qzKeyStrip').classList.contains('on') ? '1' : '0');
    ck('seritte sayfa anahtari', '1',
       document.getElementById('qzKeyStrip').textContent.indexOf('Sayfa ' + secim) > -1 ? '1' : '0');
    ck('seritte gercek harf', '1',
       document.getElementById('qzKeyStrip').textContent.indexOf('S.' + cift[0] + ' ' + k1) > -1 ? '1' : '0');
    ck('dogru sik yesil', '1', dug(cift[0])[k1.charCodeAt(0) - 65].classList.contains('ok') ? '1' : '0');
    ck('yanlis secim kirmizi', '1', dug(cift[0])[yanlis.charCodeAt(0) - 65].classList.contains('bad') ? '1' : '0');
    ck('yanlis kartta carpi', '1', kart(cift[0]).querySelector('.tick.bad') ? '1' : '0');

    /* sayfa sonundaki "Denemeyi bitir" */
    sonDugme('finish').click();
    ck('sonuc penceresi acilir', '1', document.getElementById('qzModal').classList.contains('open') ? '1' : '0');
    ck('A–E analizi var', '1', document.querySelector('#qzRows .ad') ? '1' : '0');
    ck('analizde bes sik satiri', '5', String(document.querySelectorAll('#qzRows .ad .gr:not(.sum)').length));
    ck('sonucta tum set sorulari',
       String(Object.keys(veri.pages).reduce(function(a, p){ return a + veri.pages[p].length; }, 0)),
       String(document.querySelectorAll('#qzRows .row').length));
    ck('sonucta dogru/yanlis yazisi', '1', /Do\u011fru/.test(document.getElementById('qzRows').textContent) ? '1' : '0');
    document.getElementById('qzModalClose').click();
    ck('sonuc penceresi kapanir', '0', document.getElementById('qzModal').classList.contains('open') ? '1' : '0');

    /* Q tusu paneli kapatir; A tusu anahtari acip kapatir (sirayla) */
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
    ck('Q tusu paneli kapatir', '0', has('qz-acik'));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    ck('A tusu anahtari gizler', '0', document.getElementById('qzKeyStrip').classList.contains('on') ? '1' : '0');
    ck('gizlenince tikler kalkar', '0', String(document.querySelectorAll('#qzCards .qo button.ok').length));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    ck('A tusu anahtari yeniden acar', '1', document.getElementById('qzKeyStrip').classList.contains('on') ? '1' : '0');

    document.getElementById('qzReset').click();
    ck('temizle isaretleri siler', '{}', localStorage.getItem('oku.quiz.deneme'));
    ck('temizle tikleri kaldirir', '0', String(document.querySelectorAll('#qzCards .qcard.done').length));
    bitir();
  }, 900);
});
`;

/* ---------- kosum ---------- */
const CASES = [
  { ad: 'OKU masaustu 1440x1000', file: 'oku.html', size: '1440,1000', pre: OKU_PRE, drive: OKU_DRIVE },
  { ad: 'OKU telefon 412x880', file: 'oku.html', size: '412,880', pre: OKU_PRE, drive: OKU_DRIVE },
  { ad: 'TEST MODU masaustu 1440x1000 (turkce-test)', file: 'oku.html', size: '1440,1000', pre: QUIZ_PRE, drive: QUIZ_DRIVE },
  { ad: 'TEST MODU telefon 412x880 (turkce-test)', file: 'oku.html', size: '412,880', pre: QUIZ_PRE, drive: QUIZ_TEL_DRIVE },
  { ad: 'TEST MODU anahtarsiz set 1440x1000 (turkce-cikmis)', file: 'oku.html', size: '1440,1000', pre: QUIZ_KEYLESS_PRE, drive: QUIZ_KEYLESS_DRIVE, xform: anahtarsizYap },
  { ad: 'TEST MODU deneme 1440x1000', file: 'oku.html', size: '1440,1000', pre: QUIZ_DENEME_PRE, drive: QUIZ_DENEME_DRIVE },
  { ad: 'VIEWER deneme 1440x1000 (test modu)', file: 'viewer.html', size: '1440,1000', pre: VIEWER_PRE, drive: VIEWER_DRIVE },
  { ad: 'VIEWER tarih 1440x1000 (iframe modu)', file: 'viewer.html', size: '1440,1000', pre: VIEWER_TARIH_PRE, drive: VIEWER_TARIH_DRIVE },
  { ad: 'GALERI masaustu 1440x1000', file: 'galeri.html', size: '1440,1000', pre: GALERI_PRE, drive: GALERI_DRIVE },
  { ad: 'GALERI test modu deneme 1440x1000', file: 'galeri.html', size: '1440,1000', pre: GALERI_QUIZ_PRE, drive: GALERI_QUIZ_DRIVE },
  { ad: 'GALERI test modu deneme telefon 412x880', file: 'galeri.html', size: '412,880', pre: GALERI_QUIZ_PRE, drive: GALERI_QUIZ_DRIVE },
  { ad: 'GALERI telefon 412x880', file: 'galeri.html', size: '412,880', pre: GALERI_PRE, drive: GALERI_DRIVE },
];

let gecen = 0, kalan = 0;
CASES.forEach(c => {
  console.log('=== ' + c.ad + ' ===');
  checks(c.file, c.size, c.pre, c.drive, c.xform).forEach(r => {
    const ad = r[0], beklenen = r[1], gercek = r[2];
    const ok = beklenen === gercek;
    ok ? gecen++ : kalan++;
    console.log('  ' + (ok ? 'GECTI' : 'KALDI') + '  ' + ad +
      (ok ? '' : '   (beklenen: ' + beklenen + ' | gercek: ' + gercek + ')'));
  });
});
console.log('\nSONUC: ' + gecen + ' gecti, ' + kalan + ' basarisiz');
process.exit(kalan ? 1 : 0);
