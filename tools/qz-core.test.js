/* quiz-core.js birim testleri. Node v24; bagimlilik yok.
   Calistir: node tools/qz-core.test.js   (hata varsa exit 1) */
'use strict';
const assert = require('assert');
const path = require('path');
const QuizCore = require(path.join(__dirname, '..', 'quiz-core.js'));
const H = QuizCore.hizalaSiklar;

/* Simetri toleransi. Komsu boslugu kirpimi kutu genisliginden en fazla
   GAP kadar (0.002) dusurebilir; float artigi da eklenir. 0.001 = 1400px
   sayfada 1.4px. Gercek raggedlik 0.1+ (140px) oldugu icin bu esik onu
   yakalar, gorunmez artigi gecirir. */
const SIMETRI_TOL = 0.001;

let gecti = 0, kaldi = 0;
function test(ad, fn) {
  try { fn(); gecti++; console.log('  GECTI  ' + ad); }
  catch (e) { kaldi++; console.log('  KALDI  ' + ad + '\n         ' + e.message); }
}
/* ayni satir bandindaki kutularin x genisligi farki (simetri sapmasi) */
function sapma(r, i) {
  const b = r.y0[i].toFixed(6);
  const w = r.y0.map((y, j) => (y.toFixed(6) === b ? r.w[j] : null)).filter(v => v !== null);
  return Math.max.apply(null, w) - Math.min.apply(null, w);
}
function aralikta(r) {
  r.x0.forEach((v, i) => {
    assert.ok(v >= -1e-9 && v <= 1 + 1e-9, 'x0[' + i + ']=' + v + ' aralik disi');
    assert.ok(r.w[i] > 0, 'w[' + i + ']=' + r.w[i] + ' pozitif degil');
    assert.ok(r.h[i] > 0, 'h[' + i + ']=' + r.h[i] + ' pozitif degil');
    assert.ok(r.y0[i] >= -1e-9 && r.y0[i] + r.h[i] <= 1 + 1e-9, 'y bandi aralik disi: ' + i);
  });
}
function binmeYok(r) {
  for (let i = 0; i < r.x0.length; i++)
    for (let j = i + 1; j < r.x0.length; j++) {
      const ox = Math.min(r.x0[i] + r.w[i], r.x0[j] + r.w[j]) - Math.max(r.x0[i], r.x0[j]);
      const oy = Math.min(r.y0[i] + r.h[i], r.y0[j] + r.h[j]) - Math.max(r.y0[i], r.y0[j]);
      assert.ok(!(ox > 1e-9 && oy > 1e-9), i + '/' + j + ' kesisiyor: ' + ox.toFixed(5));
    }
}
function kapsar(r, ham) {
  ham.forEach((t, i) => {
    assert.ok(r.x0[i] <= t[0] + 1e-6, i + ' sol kenar metni kesiyor');
    assert.ok(r.x0[i] + r.w[i] >= t[2] - 1e-6, i + ' sag kenar metni kesiyor');
  });
}

/* ---- gercek veri fixturlari (quiz-data.json) ---- */
// turkce-test s.2 soru 11 — 5x1 dikey liste
const Dikey = [
  [0.543, 0.686, 0.7876, 0.7022], [0.543, 0.7077, 0.7923, 0.7239],
  [0.543, 0.7294, 0.8063, 0.7456], [0.543, 0.751, 0.8249, 0.7673],
  [0.543, 0.7727, 0.8557, 0.7889]
];
// turkce-test s.4 soru 5 — 1x5 yatay serit
const Yatay = [
  [0.0593, 0.1788, 0.1265, 0.192], [0.1357, 0.1788, 0.203, 0.192],
  [0.2121, 0.1788, 0.2794, 0.192], [0.2886, 0.1788, 0.3558, 0.192],
  [0.365, 0.1788, 0.4322, 0.192]
];
// deneme s.32 soru 15 — 3x2 ızgara (satir1 A,B,C / satir2 D,E)
const Izgara32 = [
  [0.5292, 0.6339, 0.571, 0.6503], [0.6637, 0.6339, 0.706, 0.6503],
  [0.7945, 0.6339, 0.8373, 0.6503], [0.6024, 0.6521, 0.645, 0.6685],
  [0.7343, 0.6521, 0.7755, 0.6685]
];
// turkce-test s.23 soru 7 — 2x3 ızgara, kisa+uzun yan yana (ragged)
const Izgara23 = [
  [0.5526, 0.5749, 0.6441, 0.5911], [0.6903, 0.5749, 0.929, 0.5911],
  [0.5526, 0.5998, 0.7007, 0.616], [0.72, 0.5998, 0.8746, 0.616],
  [0.5526, 0.621, 0.7007, 0.6372]
];
// deneme s.24 soru 1 — A, B, E birebir ayni kutu (bozuk veri)
const Kopya = [
  [0.7868, 0.2395, 0.8472, 0.2587], [0.7868, 0.2395, 0.8472, 0.2587],
  [0.4919, 0.2403, 0.5493, 0.2595], [0.6338, 0.2407, 0.7283, 0.2599],
  [0.7868, 0.2395, 0.8472, 0.2587]
];
// turkce-test s.50 soru 3 — y degerleri sayfa disina tasmis
const Tasan = [
  [0.059, 0.4631, 0.4399, 0.4801], [0.059, 0.7805, 0.4754, 0.7975],
  [0.059, 1.0979, 0.4399, 1.1149], [0.059, 1.4153, 0.4399, 1.4323],
  [0.059, 1.7327, 0.4399, 1.7497]
];

console.log('--- hizalaSiklar ---');

test('bos girdi bos doner', () => {
  const r = H([]);
  assert.strictEqual(r.x0.length, 0);
  assert.strictEqual(r.satir, null);
});

test('tek sik dolu doner (Review Focus 1)', () => {
  const r = H([[0.5, 0.2, 0.8, 0.24]]);
  assert.strictEqual(r.x0.length, 1);
  assert.ok(r.w[0] > 0 && r.h[0] > 0);
  assert.strictEqual(r.satir, null, 'tek kutu -> satir null');
  aralikta(r);
});

test('dikey liste: tumu esit sol kenar + esit genislik', () => {
  const r = H(Dikey);
  aralikta(r); binmeYok(r); kapsar(r, Dikey);
  assert.ok(sapma(r, 0) < 1e-9, 'dikeyde genislik farki: ' + sapma(r, 0));
  const sol0 = r.x0[0];
  r.x0.forEach((v, i) => assert.ok(Math.abs(v - sol0) < 1e-9, i + '. sol kenar kaydi'));
  assert.strictEqual(r.satir.length, 5);
});

test('yatay serit: esit genislik, ust uste binme yok', () => {
  const r = H(Yatay);
  aralikta(r); binmeYok(r); kapsar(r, Yatay);
  assert.ok(sapma(r, 0) < SIMETRI_TOL, 'yatayda genislik farki: ' + sapma(r, 0));
  assert.strictEqual(r.satir, null, 'tek satir -> satir null');
});

test('izgara 3x2: iki satir, satir ici esit', () => {
  const r = H(Izgara32);
  aralikta(r); binmeYok(r); kapsar(r, Izgara32);
  const bant = r.y0.map(v => v.toFixed(6));
  assert.strictEqual(new Set(bant).size, 2, 'iki satir olmali');
  assert.ok(sapma(r, 0) < 0.09, 'satir1 genislik farki: ' + sapma(r, 0));
  assert.ok(sapma(r, 3) < 0.09, 'satir2 genislik farki: ' + sapma(r, 3));
});

test('izgara 2x3: uc satir, komsu banda binmez', () => {
  const r = H(Izgara23);
  aralikta(r); binmeYok(r);
  const bant = r.y0.map(v => v.toFixed(6));
  assert.strictEqual(new Set(bant).size, 3, 'uc satir olmali');
  /* son satir tek kutu: tum genisligi alabilmeli */
  assert.ok(r.w[4] > 0.1, 'tek satirdaki E genis olmali, gotu: ' + r.w[4]);
});

test('bozuk veri: negatif genislik yok (Review Focus 2)', () => {
  const r = H(Kopya);
  aralikta(r); binmeYok(r);
  r.w.forEach((v, i) => assert.ok(v > 0, 'w[' + i + ']=' + v));
});

test('sayfa disi koordinat kirpilir (Review Focus 3)', () => {
  const r = H(Tasan);
  aralikta(r);
  assert.ok(r.y0.every(v => v >= 0 && v <= 1), 'y0 aralik disi');
  assert.ok(r.h.every(v => v > 0), 'h pozitif olmali');
});

test('determinizm (Review Focus 5)', () => {
  [Dikey, Yatay, Izgara32, Izgara23, Kopya, Tasan].forEach(f => {
    assert.strictEqual(JSON.stringify(H(f)), JSON.stringify(H(f)));
  });
});

test('konum sirasi giris sirasi korunur: A sol en solda', () => {
  const r = H(Yatay);
  for (let i = 1; i < 5; i++) assert.ok(r.x0[i] > r.x0[i - 1], i + '. kutu sola kaydi');
  const d = H(Dikey);
  assert.ok(Math.abs(d.x0[0] - d.x0[4]) < 1e-9, 'dikeyde hepsi ayni sol kenarda');
});

console.log('--- soruyuKoru ---');
const K = QuizCore.soruyuKoru;

test('engelle kesismeyen maske degismez', () => {
  const m = [0.1, 0.3, 0.5, 0.5];
  const r = K(m, [[0.1, 0.7, 0.5, 0.75]]);
  assert.deepStrictEqual(r, m, 'kesisim yoksa aynen donmeli');
});

test('soru koku maskenin ustune biniyor: ust kirpilir', () => {
  const r = K([0.1, 0.3, 0.5, 0.5], [[0.1, 0.25, 0.5, 0.35]]);
  assert.ok(Math.abs(r[1] - 0.35) < 1e-9, 'y0 kirpilmadi: ' + r[1]);
  assert.ok(Math.abs(r[3] - 0.5) < 1e-9, 'y1 bozulmadi: ' + r[3]);
});

test('soru koku maskenin altina biniyor: alt kirpilir', () => {
  const r = K([0.1, 0.3, 0.5, 0.5], [[0.1, 0.45, 0.5, 0.55]]);
  assert.ok(Math.abs(r[3] - 0.45) < 1e-9, 'y1 kirpilmadi: ' + r[3]);
});

test('iki engel: ust ve alt birlikte kirpilir', () => {
  const r = K([0.1, 0.3, 0.5, 0.5], [[0.1, 0.2, 0.5, 0.32], [0.1, 0.48, 0.5, 0.6]]);
  assert.ok(Math.abs(r[1] - 0.32) < 1e-9, 'y0: ' + r[1]);
  assert.ok(Math.abs(r[3] - 0.48) < 1e-9, 'y1: ' + r[3]);
});

test('iki engel maskeyi her iki yandan sıkıştırıp kapatırsa maske üretilmez', () => {
  /* maske 0.300-0.315 (ince blok). Ust engel 0.31'e, alt engel 0.312'ye
     kirpar -> kalan 0.002 < MIN_Y (0.01) -> null */
  const r = K([0.1, 0.300, 0.5, 0.315], [[0.1, 0.2, 0.5, 0.31], [0.1, 0.312, 0.5, 0.4]]);
  assert.strictEqual(r, null, 'maske kisismaliysa null donmeli');
});

test('maskenin icinde kalan soru metni maskenin ustunu kendine kirpar', () => {
  /* Soru kökü 0.38-0.42, maske 0.30-0.50. SORU METNI HICBIR ZAMAN
     ORTULMEMELI: maske 0.42'den baslar. 0.30-0.38 araligi cozum blogu
     olsa da soruyu korumak icin acik birakilir (guvenli / fail-safe yon). */
  const r = K([0.1, 0.3, 0.5, 0.5], [[0.2, 0.38, 0.4, 0.42]]);
  assert.ok(Math.abs(r[1] - 0.42) < 1e-9, 'y0 soru kokune kirpilmeli: ' + r[1]);
  assert.ok(Math.abs(r[3] - 0.5) < 1e-9, 'y1 bozulmamali: ' + r[3]);
});

test('soru metni maskenin ustundeyse maske kirpilmaz', () => {
  const m = [0.1, 0.3, 0.5, 0.5];
  assert.deepStrictEqual(K(m, [[0.2, 0.20, 0.4, 0.28]]), m, 'disaridaki soru maskeyi etkilememeli');
});

test('gecersiz maske (null / eksik kutu) null doner', () => {
  assert.strictEqual(K(null, []), null);
  assert.strictEqual(K([0.1, 0.3], []), null);
});

test('sayfa kenari: maske %4 ust/alt bandina tasamaz', () => {
  const r = K([0.1, 0.0, 0.5, 0.5], []);
  assert.ok(r[1] >= 0.04 - 1e-9, 'ust kenar %4 altina inmemeli: ' + r[1]);
  const r2 = K([0.1, 0.5, 0.5, 1.0], []);
  assert.ok(r2[3] <= 0.96 + 1e-9, 'alt kenar %4 ustu cikmamali: ' + r2[3]);
});

test('x ekseni kirpilmez (sadece dikey serit)', () => {
  const r = K([0.1, 0.3, 0.5, 0.5], [[0.2, 0.32, 0.3, 0.34]]);
  assert.strictEqual(r[0], 0.1);
  assert.strictEqual(r[2], 0.5);
});

test('soruyuKoru determinizm', () => {
  const m = [0.1, 0.3, 0.5, 0.5], e = [[0.1, 0.2, 0.5, 0.32], [0.1, 0.48, 0.5, 0.6]];
  assert.strictEqual(JSON.stringify(K(m, e)), JSON.stringify(K(m, e)));
});

console.log('--- cizilenSiklar ---');
const CS = QuizCore.cizilenSiklar;

test('harfMap yoksa bos liste doner', () => {
  assert.deepStrictEqual(CS(null), []);
  assert.deepStrictEqual(CS(undefined), []);
  assert.deepStrictEqual(CS({}), []);
});

test('eksik/bozuk harf atlanir, sirasi ABCDE', () => {
  /* yalniz B ve D gecerli: A eksik, E null, C hic tanimli degil */
  const r = CS({ B: Yatay[1], D: Yatay[3], A: [0.1], E: null });
  assert.strictEqual(r.length, 2, 'yalnizca B ve D gecerli');
  assert.ok(r[0][0] < r[1][0], 'B solda, D sagda olmali');
  /* tam ABCDE girdisinde SIR korunur */
  const tam = {};
  Yatay.forEach((b, i) => { tam['ABCDE'[i]] = b; });
  const s = CS(tam);
  assert.strictEqual(s.length, 5);
  for (let i = 1; i < 5; i++) assert.ok(s[i][0] > s[i - 1][0], i + '. kutu sola kaydi');
});

test('her cikti [x0,y0,x1,y1], aralık disi degil', () => {
  const cMap = {};
  Dikey.forEach((b, i) => { cMap['ABCDE'[i]] = b; });
  const r = CS(cMap);
  assert.strictEqual(r.length, 5);
  r.forEach((d, i) => {
    assert.strictEqual(d.length, 4, i + '. dikdortgen 4 elemanli olmali');
    assert.ok(d[2] > d[0] && d[3] > d[1], i + '. kutu bos: ' + JSON.stringify(d));
    assert.ok(d[0] >= -1e-9 && d[1] >= -1e-9, i + '. sol/ust aralik disi');
    assert.ok(d[2] <= 1 + 1e-9 && d[3] <= 1 + 1e-9, i + '. sag/alt aralik disi');
  });
});

test('cizilen kutu ham metni tam kapsar (hicbir metin kesilmez)', () => {
  const cMap = {};
  Dikey.forEach((b, i) => { cMap['ABCDE'[i]] = b; });
  const r = CS(cMap);
  Dikey.forEach((b, i) => {
    assert.ok(r[i][0] <= b[0] + 1e-6, i + ' sol kenar metni kesiyor');
    assert.ok(r[i][1] <= b[1] + 1e-6, i + ' ust kenar metni kesiyor');
    assert.ok(r[i][2] >= b[2] - 1e-6, i + ' sag kenar metni kesiyor');
    assert.ok(r[i][3] >= b[3] - 1e-6, i + ' alt kenar metni kesiyor');
  });
});

test('ham kutu tabana BUYUTULUR; taban parametresi modunkini yansitir', () => {
  const dar = [0.5, 0.5, 0.502, 0.504];
  const varsayilan = CS({ A: dar })[0];
  assert.ok(varsayilan[2] - varsayilan[0] >= 0.05 - 1e-9, 'varsayilan min genislik yok');
  assert.ok(varsayilan[3] - varsayilan[1] >= 0.016 - 1e-9, 'varsayilan min yukseklik yok');
  const oku = CS({ A: dar }, { minW: 0.05, minH: 0.012 })[0];
  assert.ok(Math.abs((oku[2] - oku[0]) - 0.05) < 1e-9, 'verilen minW kullanilmadi');
  assert.ok(Math.abs((oku[3] - oku[1]) - 0.012) < 1e-9, 'verilen minH kullanilmadi');
});

test('HAM koordinat ortusmeyi GORMEZ, cizilen gorur (K7 regresyon kaniti)', () => {
  /* hizalaSiklar satiri dikeyde DY (0.004) buyutur. Ham E kutusu 0.7727'de
     baslar; cizilen kutu 0.7687'de baslar. Maske 0.7660-0.7700 araliginda:
     ham koordinat denetimi "cakisma yok" der, cizilen koordinat 0.0013
     yakalayan dikdortgeni gosterir. */
  const ham = Dikey[4];
  const maske = [0.543, 0.7660, 0.856, 0.7700];
  const hamCak = Math.min(maske[3], ham[3]) - Math.max(maske[1], ham[1]);
  const ciz = CS({ E: ham })[0];
  const cizCak = Math.min(maske[3], ciz[3]) - Math.max(maske[1], ciz[1]);
  assert.ok(hamCak <= 0, 'ham koordinatta cakisma olmamaliydi, gotu ' + hamCak);
  assert.ok(cizCak > 0, 'cizilen koordinatta cakisma gorunmeliydi, gotu ' + cizCak);
  assert.ok(ciz[3] > ham[3], 'cizilen alt kenar haminkinden asagida olmali');
});

test('cizilenSiklar determinizm', () => {
  const cMap = {};
  Yatay.forEach((b, i) => { cMap['ABCDE'[i]] = b; });
  assert.strictEqual(JSON.stringify(CS(cMap)), JSON.stringify(CS(cMap)));
});

/* 2026-10-05 K8: yayinevi bandi (yayineviMaskKoy) ve cozum maskesi
   kalici olarak kaldirildi. Bu blok, kaldirmanin geri gelmedigini
   koruyan regresyon denetimidir. */
console.log('--- gizleme alanlari kaldirildi (K8) ---');

test('QuizCore.yayineviMaskKoy export edilmiyor', () => {
  assert.strictEqual(typeof QuizCore.yayineviMaskKoy, 'undefined',
    'yayineviMaskKoy kaldirilmis olmali');
});

/* --- bindEvents --- */
console.log('--- bindEvents ---');

/* Yuksek sahte: closest, contains, addEventListener, dataset, querySelector
   destekleyen bir DOM agaci. */
function sahteDugum(tag, cls, parent) {
  const children = [];
  const el = {
    tagName: tag,
    className: cls || '',
    style: {},
    dataset: {},
    textContent: '',
    children: children,
    parent: parent || null,
    _listeners: {},
    addEventListener(ev, fn) { (this._listeners[ev] = this._listeners[ev] || []).push(fn); },
    _fire(ev, data) { (this._listeners[ev] || []).forEach(fn => fn(data)); },
    contains(e) { let c = e; while (c) { if (c === el) return true; c = c.parent; } return false; },
    closest(sel) {
      const sels = sel.split(',').map(function(s) { return s.trim(); });
      let c = el;
      while (c) {
        for (let si = 0; si < sels.length; si++) {
          const s = sels[si];
          if (s === '.qsolution-toggle' && c._isToggle) return c;
          if (s === '.qsolution-mask' && c._isMask) return c;
          if ((s === '.qhotspot' || s === '.qz-hot') && c._isHot) return c;
        }
        c = c.parent;
      }
      return null;
    },
    querySelector(sel) {
      if (sel === '.qsol-icon') return el._icon || null;
      if (sel === '.qsol-text') return el._text || null;
      return null;
    },
    setAttribute(a, v) { this._attrs = this._attrs || {}; this._attrs[a] = v; },
    getAttribute(a) { return this._attrs ? this._attrs[a] : null; }
  };
  if (parent) parent.children.push(el);
  return el;
}

test('bindEvents kapsayiciya tek dinleyici ekler', () => {
  const root = sahteDugum('div', '');
  const sec = { onHotspot() {}, onToggle() {} };
  const r1 = QuizCore.bindEvents(root, sec);
  const r2 = QuizCore.bindEvents(root, sec);
  assert.strictEqual(r1, true, 'ilk cagri true');
  assert.strictEqual(r2, false, 'ikinci cagri false (idempotent)');
  assert.strictEqual(root._listeners.click.length, 1, 'tek dinleyici');
});

test('bindEvents bos / gecersiz kok ile false doner', () => {
  assert.strictEqual(QuizCore.bindEvents(null, {}), false);
  assert.strictEqual(QuizCore.bindEvents(undefined, {}), false);
  assert.strictEqual(QuizCore.bindEvents({ addEventListener: 'x' }, {}), false);
});

test('hotspot icindeki span’a tiklaninca onHotspot qid ve h ile cagrilir', () => {
  const root = sahteDugum('div', '');
  const hot = sahteDugum('button', 'qhotspot', root);
  hot._isHot = true;
  hot.dataset = { qid: 'q42', h: 'C' };
  // span inside hotspot
  const span = sahteDugum('span', 'qh-badge', hot);
  let called = false, gotQid, gotH;
  QuizCore.bindEvents(root, {
    onHotspot(qid, h) { called = true; gotQid = qid; gotH = h; },
    onToggle() {}
  });
  const ev = { target: span, preventDefault() {}, stopPropagation() {} };
  root._fire('click', ev);
  assert.strictEqual(called, true, 'cağrıldı');
  assert.strictEqual(gotQid, 'q42');
  assert.strictEqual(gotH, 'C');
});

test('K8: cozum maskesi toggle kolu kaldirildi — maskeye tiklamak onHotspot cagirmaz', () => {
  /* Sanal bir cozum maskesi dugmesi olsa bile ARTIK hicbir sey olmaz:
     bindEvents yalnizca .qhotspot / .qz-hot tanir. */
  const root = sahteDugum('div', '');
  const hot = sahteDugum('button', 'qhotspot', root);
  hot._isHot = true;
  hot.dataset = { qid: 'q7', h: 'B' };
  let called = false;
  QuizCore.bindEvents(root, { onHotspot() { called = true; } });
  root._fire('click', { target: hot, preventDefault() {}, stopPropagation() {} });
  assert.strictEqual(called, true, 'A-E hotspot YINE de calismali');
});

test('K8: hotspot disi herhangi bir dugmeye tiklamak onHotspot cagirmaz', () => {
  const root = sahteDugum('div', '');
  const yabanci = sahteDugum('button', 'qsolution-toggle', root);
  let called = 0;
  QuizCore.bindEvents(root, { onHotspot() { called++; } });
  root._fire('click', { target: yabanci, preventDefault() {}, stopPropagation() {} });
  assert.strictEqual(called, 0, 'hotspot olmayan dugme yok sayilmali');
});

test('hotspot tiklamasi stopPropagation cagirir', () => {
  const root = sahteDugum('div', '');
  const hot = sahteDugum('button', 'qhotspot', root);
  hot._isHot = true;
  hot.dataset = { qid: 'q1', h: 'A' };
  let stopped = false;
  QuizCore.bindEvents(root, {
    onHotspot() {}, onToggle() {}
  });
  root._fire('click', { target: hot, preventDefault() {}, stopPropagation() { stopped = true; } });
  assert.strictEqual(stopped, true);
});

test('qid veya h eksikse hotspot yok sayilir', () => {
  const root = sahteDugum('div', '');
  const hot = sahteDugum('button', 'qhotspot', root);
  hot._isHot = true;
  hot.dataset = { qid: 'q1' }; /* h eksik */
  let called = false;
  QuizCore.bindEvents(root, {
    onHotspot() { called = true; },
    onToggle() {}
  });
  root._fire('click', { target: hot, preventDefault() {}, stopPropagation() {} });
  assert.strictEqual(called, false);
});

console.log('\nSONUC: ' + gecti + ' gecti, ' + kaldi + ' basarisiz');
process.exit(kaldi ? 1 : 0);