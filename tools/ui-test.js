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

/* RAPOR kayitlari icin: beklenen alan "RAPOR" ise deger ornek (rapor)
   alanindadir. ck() cagirisinda rp() bunu ayrica uretir. */


/* ---------- ortak test yardimcilari (sayfaya enjekte edilir) ---------- */
const HELPERS = `
var out = [];
/* DIKKAT: satir protokolu "ad|beklenen|gercek" ve kayitlar "~~" ile birlestirilir.
   ad veya degerlerin icinde "|" veya "~~" KULLANILAMAZ; ayirici yerine " :: "
   veya " -> " kullan. (Bunu ihlal eden bir kontrol, gercek degeri sessizce
   kirpar ve yesil gorunurdu.) */
function ck(ad, beklenen, gercek){
  var a = String(ad), b = String(beklenen), c = String(gercek);
  if (a.indexOf('|') > -1 || b.indexOf('|') > -1 || c.indexOf('|') > -1 ||
      a.indexOf('~~') > -1 || b.indexOf('~~') > -1 || c.indexOf('~~') > -1)
    throw new Error('ck degerinde ayirici karakter: ' + a);
  out.push(a + '|' + b + '|' + c);
}
/* Sadece RAPOR: gecmek zorunda degildir, degeri sadece okunur. Kanit
   metni "beklenen" alanina konur, boylece asiri denetim yapmaz. */
function rp(ad, metin){
  var a = String(ad), t = String(metin === undefined ? 'yok' : metin);
  if (a.indexOf('|') > -1 || t.indexOf('|') > -1 ||
      a.indexOf('~~') > -1 || t.indexOf('~~') > -1)
    throw new Error('rp degerinde ayirici karakter: ' + a);
  /* "RAPOR" beklenen alanina yazilir; deger ornek alaninda kalir.
     bitir() bunlari gecmis/failmis saymaz. */
  out.push(a + '|RAPOR|' + t);
}
function has(c){ return document.body.classList.contains(c) ? '1' : '0'; }
function okEdge(panelId){
  var p = document.getElementById(panelId);
  return Math.max(10, Math.round(p.getBoundingClientRect().right - 9)) + 'px';
}
function okMid(panelId){
  var r = document.getElementById(panelId).getBoundingClientRect();
  return Math.round(r.top + r.height / 2) + 'px';
}
/* Kayit: "gecti" | "kaldi" | "rapor".
   "rapor" SADECE olcumdir; gecmis/failmis sayilmaz, gostergebilir.
   Kanit metni icin: beklenen alanine konur, boylece asiri denetim yapmaz. */
function bitir(){
  var g = out.filter(function(s){ return s.indexOf('|RAPOR|') < 0; });
  var r = out.filter(function(s){ return s.indexOf('|RAPOR|') > -1; });
  document.documentElement.setAttribute(
    'data-testlog', g.join('~~') + (r.length ? '~~RAPOR~~' + r.join('~~') : ''));
}
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

  /* --- K7: cozum maskesi kendi A-E kutularini YUTMAMALI ---
     Neden ham koordinatla DENETIM YAPILAMAZ: hizalaSiklar her satir bandini
     dikeyde DY (0.004) buyutur, modlar ayrica taban min genislik/yukseklik
     uygular. Ham [x0,y0,x1,y1] uzerinden "cakisma yok" demek cizilen
     hotspot'un ALT kenarini icinde birakir -> ortusme yapisel olarak
     GORUNMEZ. Bu yuzden olcum tarayicinin CIZDIGI getBoundingClientRect
     uzerinden, piksel olarak yapilir. */
  var kapH = 0;
  Array.prototype.forEach.call(document.querySelectorAll('.qhotspots, .qz-overlay'), function(k){
    var h = k.getBoundingClientRect().height;
    if (h > kapH) kapH = h;
  });
  /* Sayfa gorselleri depoda yokken katman 0'a cokebilir; o zaman piksel
     esigi anlamsizlasir (0.5px = %3). Boyle durumda K7 denetimi ATLANIR
     ve yalnizca RAPOR yazilir — yanlis kirmizi uretmez. */
  var olcek = kapH >= 200;
  var mks = Array.prototype.slice.call(document.querySelectorAll('.qsolution-mask'));
  var qidYok = 0, kendiCak = 0, enKendi = 0, enKendiKanit = '';
  mks.forEach(function(mk){
    var q = mk.dataset.qid;
    if (!q) { qidYok++; return; }
    var m = mk.getBoundingClientRect(), oy = 0, en = '';
    Array.prototype.forEach.call(
      document.querySelectorAll('.qhotspot[data-qid="' + q + '"], .qz-hot[data-qid="' + q + '"]'),
      function(h){
        var r = h.getBoundingClientRect();
        var a = Math.min(m.right, r.right) - Math.max(m.left, r.left);
        var b = Math.min(m.bottom, r.bottom) - Math.max(m.top, r.top);
        if (a > 0.5 && b > 0.5 && b > oy){ oy = b; en = h.dataset.h + '@' + Math.round(r.top) + '+' + Math.round(r.height); }
      });
    if (oy > 0){ kendiCak++; if (oy > enKendi){ enKendi = oy; enKendiKanit = q + ' sik ' + en; } }
  });
  ck('k7: cozum maskesi soru kimligi tasiyor', '0', String(qidYok));
  ck('k7: maske kendi siklarini yutmuyor', '0',
     (olcek && kendiCak) ? kendiCak + ' -> ' + enKendiKanit + ' ' + enKendi.toFixed(1) + 'px' : '0');
  rp('k7: olculebilir katman yuksekligi (px)', Math.round(kapH) + (olcek ? '' : ' (K7 atlandi)'));
  rp('k7: cizilen cozum maskesi', String(mks.length));
  rp('k7: en buyuk kendi-sik ortusme (px)', enKendi.toFixed(1) + ' / ' + enKendiKanit);

    bitir();
  }, 900);
});
`;

/* ---------- OKU (Kitap Modu): Tarih konu ozeti + karsilastirma tablosu ---------- */
const OKU_TARIH_PRE = "localStorage.setItem('oku.ders','tarih');" +
  "localStorage.setItem('oku.sayfa.tarih','1');" +
  "localStorage.setItem('oku.panel.lib','0');";

const OKU_TARIH_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  var b = document.getElementById('btnOzet');
  ck('tarihte ozet butonu gorunur', '1', b && !b.hidden ? '1' : '0');
  ck('tarih giris karti var', '1', document.querySelector('#pages .intro-card') ? '1' : '0');

  b.click();
  var dr = document.getElementById('ozDrawer');
  ck('tarih ozet cekmecesi acilir', '1', dr.hidden ? '0' : '1');
  ck('tarih ozet basligi renkli', '1', document.querySelector('#ozBody h5.oz-t1') ? '1' : '0');
  ck('tarih ozetinde 16 bolum', '16', String(document.querySelectorAll('#ozBody details.oz').length));

  /* karsilastirma tablolari: Ilkler, Selcuklu, Vakif, Ezber listesi */
  var tb = document.querySelectorAll('#ozBody table.ozt');
  ck('tarih ozetinde 4 tablo', '4', String(tb.length));
  var selc = tb[1];
  ck('Selcuklu tablosu 3 sutun', '3', selc ? String(selc.querySelectorAll('thead th').length) : '0');
  ck('Selcuklu tablosu 7 satir', '7', selc ? String(selc.querySelectorAll('tbody tr').length) : '0');
  ck('Selcuklu tablosunda Koca Hasan Paşa var', '1',
     selc && selc.textContent.indexOf('Koca Hasan Paşa') > -1 ? '1' : '0');
  ck('tablo basliklari dolu', '1',
     tb[0] && tb[0].querySelectorAll('thead th').length === 2 ? '1' : '0');

  /* tam sayfa linki ders anahtarindan turemeli */
  ck('tam sayfa linki tarih-ozet.html', '1',
     dr.querySelector('a[href="tarih-ozet.html"]') ? '1' : '0');
  ck('turkce linki sizmadi', '0',
     dr.querySelector('a[href="turkce-ozet.html"]') ? '1' : '0');
  ck('cekmece aria-labeli ders adi', '1',
     dr.getAttribute('aria-label').indexOf('Tarih') > -1 ? '1' : '0');

  document.getElementById('ozClose').click();
  ck('tarih ozet cekmecesi kapanir', '0', dr.classList.contains('show') ? '1' : '0');
  bitir();
});
`;

/* ---------- Bagimsiz ozet sayfalari: dar ekranda yatay tasma olmamali ----------
   .ozt tablolari min-width kazandigi icin sayfayi genisletmemeli; tasma
   .tablo icinde yatay kaydirma olarak kalmali. */
const OZET_SAYFA_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  var d = document.documentElement;
  ck('sayfa yatay tasmasi', '0', String(d.scrollWidth - d.clientWidth));
  ck('wrap ekrana sigar', '1',
     String(document.querySelector('.wrap').getBoundingClientRect().width <= d.clientWidth + 1 ? '1' : '0'));
  var t = document.querySelector('.tablo');
  if (t) {
    ck('tablo kendi icinde kaydirilir', '1',
       String(getComputedStyle(t).overflowX === 'auto' ? '1' : '0'));
  } else {
    ck('tablo yok (temmiz)', '1', '1');
  }
  bitir();
});
`;

/* ---------- SIMETRI: kutularin olcekleri gercek DOM'dan (K2 + K4) ----------
   Amac: algoritma qz-core.test.js'te ve verify-layout.js'de dogrulandi ama
   bunlar NORMALIZE koordinatlar uzerinde calisir. Burada tarayicinin
   gercekte cizdigi PIKSEL olculur: CSS yuvarlama, zoom ve transform
   etkileri yakalanir.

   KAPSAM: yalnizca oku.html test modu. Sayfa gorseli uzerine cizilen
   hotspot'lar (.qhotspot) yalnizca orada uretilir; viewer.html ve
   galeri.html test modunda KART modu (.qo button) kullanir, gorsu ustu
   hotspot uretmez. Uc mod ayni cekirdegi (QuizCore.hizalaSiklar)
   kullandigi icin normalize duzeydeki denetim 702 soruda
   verify-layout.js ile yapilir; buradaki ek deger tarayici olcusudur.

   SERT SINIRLAR (gecmek ZORUNDA):
     - ust uste binme 0
     - yayinevi bandi 0  (K4)
     - sayfa disi kutu sayisi ve 8px ustu genislik farki sayisi: BILINEN
       bozuk veri sayisiyla esit olmali.

   NEDEN "8px" BIR ESIK DEGIL: bazi sorularda iki sik AYNIsI satirda
   olsa da FARKLI sutunlardadir. turkce-test s.23 s.7 ornegi:
     A  x 0.5526-0.6441  (sol sutun)
     B  x 0.6903-0.9290  (sag sutun)
   A'yi B kadar genisletmek B'nin metnini keser; daraltmak A'ninkini keser.
   "Tam esit genislik" ve "metni tam kapsama" bu yerlesimde MATEMATISEL
   OLARAK BIRLIKTE MUMKUN DEGILDIR (spec bolum 7). Bu yuzden 8px bir
   GECIT degil, sadece bir OLÇUMdur; regresyon korumasini sayim denetimi
   saglar.

   BILINEN BOZUK VERI: quiz-data.json'da 2 sorunun koordinatlari sayfa
   disinda (turkce-test s.50 s.3, deneme s.27 s.3). Bu sette 1 tanesi
   gorunur. Duzeltilirse veya yeni bozulma olursa sayim kontrolu kirmizi
   verir -> sessizce gecmis olmaz.
*/
const SIMETRI_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  var hs = Array.prototype.slice.call(document.querySelectorAll('#pages .qhotspot'));
  ck('simetri: hotspot var', '1', hs.length ? '1' : '0');
  if (!hs.length) { bitir(); return; }

  /* Her hotspot icin kendi sorusu, kendi sayfa kabu (en yakin konumlu ata)
     ve kendi kutusu. Sayfa kabu SORU BASINA degil HOTSPOT BASINA cozulur:
     cok sayfa ayni anda cizili olabilir; tek referans tum sayfalara
     uygulanirsa her sey "tasmis" sayilir. */
  function kapu(b){
    var n = b.parentElement;
    while (n && n !== document.body){
      var cs = getComputedStyle(n);
      if (cs.position === 'relative' || cs.position === 'absolute') return n;
      n = n.parentElement;
    }
    return b.parentElement;
  }
  function yaz(xs){ return xs.map(function(x){
    return x.h + '@' + Math.round(x.r.left) + ',' + Math.round(x.r.top)
         + ' ' + Math.round(x.r.width) + 'x' + Math.round(x.r.height); }).join(' '); }

  var sira = [], g = {};
  hs.forEach(function(b){
    var id = b.dataset.qid || 'qid-yok';
    if (!g[id]) { g[id] = []; sira.push(id); }
    g[id].push({ r: b.getBoundingClientRect(), h: b.dataset.h || '?', kapu: kapu(b) });
  });
  ck('simetri: soru gruplari bulundu', '1', String(sira.length ? '1' : '0'));

  /* Sorulari ikiye ayir: GECERLI (tum kutulari kendi sayfa kabulun icinde)
     ve BOZUK VERI (en az biri disarda -> kaynak veri hatasi). */
  var gecerli = [], bozuk = [], bozukKanit = '';
  sira.forEach(function(id){
    var q = g[id], kotu = null;
    q.forEach(function(x){
      if (kotu) return;
      var k = x.kapu.getBoundingClientRect();
      if (x.r.left < k.left - 1 || x.r.right > k.right + 1 ||
          x.r.top < k.top - 1 || x.r.bottom > k.bottom + 1) kotu = x;
    });
    if (kotu) {
      bozuk.push(id);
      if (!bozukKanit) {
        var kk = kotu.kapu.getBoundingClientRect();
        bozukKanit = id + ' ' + kotu.h +
          ' box=[' + [kotu.r.left, kotu.r.top, kotu.r.right, kotu.r.bottom].map(Math.round).join(',') + ']' +
          ' sayfa=[' + [kk.left, kk.top, kk.right, kk.bottom].map(Math.round).join(',') + ']';
      }
    } else gecerli.push(id);
  });
  /* SERT: sayim bilinen bozuk veri degerine esit olmali. */
  ck('simetri: sayfa disi kutu sayisi (bilinen bozuk veri)', '1', String(bozuk.length));
  rp('simetri: bozuk veri kaniti', bozukKanit);

  if (!gecerli.length) {
    ck('simetri: soru ici ust uste binme yok', '0', '0');
    ck('simetri: yeni genislik ihlali yok', '0', '0');
    ck('simetri: bilinen cift sutun sayisi', '1', '0');
    rp('simetri: genislik kaniti', 'yok');
    rp('simetri: olculen en buyuk sapma', '0.0');
    ck('simetri: yayinevi bandi yok', '0', String(document.querySelectorAll('.qpub-mask').length));
    bitir(); return;
  }

  /* --- SERT: ust uste binme (ayni soru icinde) --- */
  var binme = 0, kotu = [];
  gecerli.forEach(function(id){
    var q = g[id];
    for (var i = 0; i < q.length; i++)
      for (var j = i + 1; j < q.length; j++){
        var a = q[i].r, b = q[j].r;
        var ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        var oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 0.5 && oy > 0.5) {
          binme++;
          kotu.push(id + ' ' + q[i].h + '/' + q[j].h + ' ' + ox.toFixed(1) + 'x' + oy.toFixed(1) + 'px');
        }
      }
  });
  ck('simetri: soru ici ust uste binme yok', '0',
     binme ? binme + ' -> ' + kotu.slice(0, 3).join(' ; ') : '0');

  /* --- OLÇÜM: satir ici genislik farki --- */
  var enSapma = 0, sapmaKanit = '', sapmali = 0, sapmaliIdler = [];
  gecerli.forEach(function(id){
    var bant = {}, enBuSoru = 0;
    g[id].forEach(function(x){
      var k = Math.round(x.r.top / 2) * 2;    /* ~2px tolerans */
      (bant[k] = bant[k] || []).push(x);
    });
    Object.keys(bant).forEach(function(k){
      var q = bant[k];
      if (q.length < 2) return;
      var ws = q.map(function(x){ return x.r.width; });
      var d = Math.max.apply(null, ws) - Math.min.apply(null, ws);
      /* SORU BASINA sayilir: ayni sorunun 5 bandi olsa bile tek sorudur.
         Aksi halde 5x1 duzende 5 band x 4 soru = 20 "soru" sanilir. */
      if (d > 8 && d > enBuSoru) { enBuSoru = d; }
      if (d > enSapma) { enSapma = d; sapmaKanit = id + ' bant@' + k + ' :: ' + yaz(q); }
    });
    if (enBuSoru > 0) { sapmali++; sapmaliIdler.push(id); }
  });
  /* SERT: regresyon korumasi.
     Bilinen, KARSILANILAMAZ durumlar acikca listelenir; kontrol yalnizca
     LISTEDE OLMAYAN ihlalleri sayar. Boylece:
       - algoritma kotulesirse  -> yeni soru kirazim listeye girer -> KALDI
       - kaynak veri duzeltilirse -> eski kayit listeden dusulur -> GECTI
     Sabit sayiya karsilastirmak ikisini de yanlis kilar: duzeltilince
     kontrol kirilir (yanlis alarm), kotulesince de "bilinen" sanilir.
     SATIR SAYISI degil SORU SAYISI karsilastirilir. */
  var BILINEN_CIFT_SUTUN = { '23:7': 1 };   /* A sol sutun, B sag sutun */
  var yeni = [];
  sapmaliIdler.forEach(function(id){
    if (!BILINEN_CIFT_SUTUN[id]) yeni.push(id);
  });
  ck('simetri: yeni genislik ihlali yok', '0',
     yeni.length ? yeni.length + ' -> ' + yeni.join(' ') : '0');
  ck('simetri: bilinen cift sutun sayisi', String(Object.keys(BILINEN_CIFT_SUTUN).length),
     String(sapmaliIdler.filter(function(id){ return BILINEN_CIFT_SUTUN[id]; }).length));
  rp('simetri: genislik kaniti', sapmaKanit);
  /* RAPOR: saf olcum, esik uygulanmaz. */
  rp('simetri: olculen en buyuk sapma', enSapma.toFixed(1) + 'px');

  /* --- SERT: yayinevi bandi icerik gizlememeli (K4) --- */
  ck('simetri: yayinevi bandi yok', '0', String(document.querySelectorAll('.qpub-mask').length));

  /* --- K7: cozum maskesi kendi A-E kutularini YUTMAMALI ---
     Neden ham koordinatla DENETIM YAPILAMAZ: hizalaSiklar her satir bandini
     dikeyde DY (0.004) buyutur, modlar ayrica taban min genislik/yukseklik
     uygular. Ham [x0,y0,x1,y1] uzerinden "cakisma yok" demek cizilen
     hotspot'un ALT kenarini icinde birakir -> ortusme yapisel olarak
     GORUNMEZ. Bu yuzden olcum tarayicinin CIZDIGI getBoundingClientRect
     uzerinden, piksel olarak yapilir. */
  var kapH = 0;
  Array.prototype.forEach.call(document.querySelectorAll('.qhotspots, .qz-overlay'), function(k){
    var h = k.getBoundingClientRect().height;
    if (h > kapH) kapH = h;
  });
  /* Sayfa gorselleri depoda yokken katman 0'a cokebilir; o zaman piksel
     esigi anlamsizlasir (0.5px = %3). Boyle durumda K7 denetimi ATLANIR
     ve yalnizca RAPOR yazilir — yanlis kirmizi uretmez. */
  var olcek = kapH >= 200;
  var mks = Array.prototype.slice.call(document.querySelectorAll('.qsolution-mask'));
  var qidYok = 0, kendiCak = 0, enKendi = 0, enKendiKanit = '';
  mks.forEach(function(mk){
    var q = mk.dataset.qid;
    if (!q) { qidYok++; return; }
    var m = mk.getBoundingClientRect(), oy = 0, en = '';
    Array.prototype.forEach.call(
      document.querySelectorAll('.qhotspot[data-qid="' + q + '"], .qz-hot[data-qid="' + q + '"]'),
      function(h){
        var r = h.getBoundingClientRect();
        var a = Math.min(m.right, r.right) - Math.max(m.left, r.left);
        var b = Math.min(m.bottom, r.bottom) - Math.max(m.top, r.top);
        if (a > 0.5 && b > 0.5 && b > oy){ oy = b; en = h.dataset.h + '@' + Math.round(r.top) + '+' + Math.round(r.height); }
      });
    if (oy > 0){ kendiCak++; if (oy > enKendi){ enKendi = oy; enKendiKanit = q + ' sik ' + en; } }
  });
  ck('k7: cozum maskesi soru kimligi tasiyor', '0', String(qidYok));
  ck('k7: maske kendi siklarini yutmuyor', '0',
     (olcek && kendiCak) ? kendiCak + ' -> ' + enKendiKanit + ' ' + enKendi.toFixed(1) + 'px' : '0');
  rp('k7: olculebilir katman yuksekligi (px)', Math.round(kapH) + (olcek ? '' : ' (K7 atlandi)'));
  rp('k7: cizilen cozum maskesi', String(mks.length));
  rp('k7: en buyuk kendi-sik ortusme (px)', enKendi.toFixed(1) + ' / ' + enKendiKanit);

  bitir();
});
`;

/* ---------- K5 butunluk korumasi (uc mod tek cekirdekte) ----------
   qzHotHiza uc dosyada AYRI AYRI kopyalandiydi ve kopyalar birbirinden
   ayri evrilmisti. Artik ucu de QuizCore.hizalaSiklar'i kullanmali.
   Bu kontrol, bir kopya geri gelirse yakalar. */
const K5_DRIVE = HELPERS + `
window.addEventListener('load', function(){
  ck('k5: quiz-core.js yuklendi', '1', (typeof QuizCore === 'object' ? '1' : '0'));
  ck('k5: hizalaSiklar var', 'function', (typeof QuizCore.hizalaSiklar));
  ck('k5: cizilenSiklar var', 'function', (typeof QuizCore.cizilenSiklar));
  ck('k5: soruyuKoru var', 'function', (typeof QuizCore.soruyuKoru));
  /* 2026-10-05: yayinevi bandi kaldirildi -> K8 geri gelirse yakala. */
  ck('k8: yayineviMaskKoy kaldirildi', 'undefined', (typeof QuizCore.yayineviMaskKoy));
  /* Saf cikti: girdi degismezse ayni sonuc. */
  var kutu = [[0.10,0.20,0.20,0.23],[0.24,0.20,0.34,0.23],[0.38,0.20,0.48,0.23]];
  var r1 = QuizCore.hizalaSiklar(kutu);
  var r2 = QuizCore.hizalaSiklar(kutu);
  ck('k5: cikti birebir ayni', '1', (JSON.stringify(r1) === JSON.stringify(r2) ? '1' : '0'));
  var fark = Math.abs(r1.w[0] - r1.w[1]);
  ck('k5: ayni satirda esit genislik', '0.000001', (fark < 1e-6 ? '0.000001' : String(fark)));
  /* Girdi KUTELERININ tamamini kapsamali (metin kesilmemeli). */
  var kapsam = (r1.x0[0] <= kutu[0][0] + 1e-9) && (r1.x0[0]+r1.w[0] >= kutu[0][2] - 1e-9);
  ck('k5: metni tam kapsar', '1', (kapsam ? '1' : '0'));
  bitir();
});
`;

/* ---------- kosum ---------- */
const CASES = [
  { ad: 'OKU masaustu 1440x1000', file: 'oku.html', size: '1440,1000', pre: OKU_PRE, drive: OKU_DRIVE },
  { ad: 'OKU telefon 412x880', file: 'oku.html', size: '412,880', pre: OKU_PRE, drive: OKU_DRIVE },
  { ad: 'OKU tarih ozeti 1440x1000', file: 'oku.html', size: '1440,1000', pre: OKU_TARIH_PRE, drive: OKU_TARIH_DRIVE },
  { ad: 'OKU tarih ozeti telefon 412x880', file: 'oku.html', size: '412,880', pre: OKU_TARIH_PRE, drive: OKU_TARIH_DRIVE },
  { ad: 'OZET turkce sayfasi telefon 412x880', file: 'turkce-ozet.html', size: '412,880', pre: '', drive: OZET_SAYFA_DRIVE },
  { ad: 'OZET tarih sayfasi telefon 412x880', file: 'tarih-ozet.html', size: '412,880', pre: '', drive: OZET_SAYFA_DRIVE },
  { ad: 'OZET tarih sayfasi masaustu 1440x1000', file: 'tarih-ozet.html', size: '1440,1000', pre: '', drive: OZET_SAYFA_DRIVE },
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
  { ad: 'SIMETRI oku test modu 1440x1000', file: 'oku.html', size: '1440,1000', pre: QUIZ_PRE, drive: SIMETRI_DRIVE },
  { ad: 'K5 oku cekirdek', file: 'oku.html', size: '1440,1000', pre: QUIZ_PRE, drive: K5_DRIVE },
  { ad: 'K5 viewer cekirdek', file: 'viewer.html', size: '1440,1000', pre: VIEWER_PRE, drive: K5_DRIVE },
  { ad: 'K5 galeri cekirdek', file: 'galeri.html', size: '1440,1000', pre: GALERI_QUIZ_PRE, drive: K5_DRIVE },
];

let gecen = 0, kalan = 0, rapor = 0;
CASES.forEach(c => {
  console.log('=== ' + c.ad + ' ===');
  checks(c.file, c.size, c.pre, c.drive, c.xform).forEach(r => {
    const ad = r[0], beklenen = r[1], gercek = r[2];
    /* RAPOR kayitlari olcumdur: gecmis/failmis SAYILMAZ, yalnizca
       gosterilir. Kanit metni beklenen alanindadir; bu yuzden
       asiri denetim yapilmaz. */
    if (beklenen === 'RAPOR') {
      rapor++;
      console.log('  RAPOR  ' + ad + ': ' + gercek);
      return;
    }
    const ok = beklenen === gercek;
    ok ? gecen++ : kalan++;
    console.log('  ' + (ok ? 'GECTI' : 'KALDI') + '  ' + ad +
      (ok ? '' : '   (beklenen: ' + beklenen + ' | gercek: ' + gercek + ')'));
  });
});
console.log('\nSONUC: ' + gecen + ' gecti, ' + kalan + ' basarisiz' +
  (rapor ? ', ' + rapor + ' rapor' : ''));
process.exit(kalan ? 1 : 0);
