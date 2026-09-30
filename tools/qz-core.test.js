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

console.log('\nSONUC: ' + gecti + ' gecti, ' + kaldi + ' basarisiz');
process.exit(kaldi ? 1 : 0);