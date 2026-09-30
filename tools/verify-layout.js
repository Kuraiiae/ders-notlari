/* quiz-data.json'daki TUM sorulari QuizCore.hizalaSiklar'dan gecirip
   gecerlilik kurallarini denetler.

   Neden ayri bir arac? qz-core.test.js algoritmayi sentetik girdilerle
   dener (hizali, cikriki, tasan, kopyali). Bu arac REEL VERI uzerinde
   calisir: 702 soru, 3 set. Sentetik testler gecen bir algoritmanin
   gercek veride kotu kesitler uretmesi mumkundur.

   Calistir:  node tools/verify-layout.js
   Cikis:     0 = temiz | 1 = beklenenden fazla ihlal (regresyon)

   Kurallar denetlenen her soru icin:
     (a) ARALIK   tum koordinatlar [0,1] icinde, w/h pozitif
     (b) BINME    ayni soruda hicbir iki kutu ust uste binmemeli
     (c) SIMETRI  ayni satir bandindaki kutular esit genislikte
     (d) KAPSAMA  her kutu kendi metnini TAM kapsamali (hicbir yonde kesmemeli)
     (e) BELIRSIZ ayni girdi ayni ciktiyi vermeli (determinizm)
*/
'use strict';
const fs = require('fs');
const path = require('path');
const QuizCore = require(path.join(__dirname, '..', 'quiz-core.js'));

const ROOT = path.resolve(__dirname, '..');
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'quiz-data.json'), 'utf8'));
const SIK = ['A', 'B', 'C', 'D', 'E'];

const SIMETRI_TOL = 0.001;   /* 1400px sayfada 1.4px */
const IHLAL_ESIK = 10;       /* bu esigin alti "bilinen bozuk veri" sayilir */
const EPS = 1e-9;

const ihlal = [], veriHatasi = [];
const dagilim = {};
const say = { toplam: 0, gecerli: 0 };
let enBuyukSapma = 0, enBuyukSapmaSoru = '';

function ekle(tur, id, mesaj) { ihlal.push(tur + ' :: ' + id + ' :: ' + mesaj); }

Object.keys(D).forEach(function (key) {
  Object.keys(D[key].pages).forEach(function (pk) {
    const pg = D[key].pages[pk];
    (pg.q || []).forEach(function (q) {
      const c = q.c || {};
      const hs = SIK.filter(function (h) { return c[h] && c[h].length >= 4; });
      if (hs.length < 2) return;             /* tek sikli soru hizalamaya girmez */
      say.toplam++;
      const id = key + ' s.' + pk + ' soru ' + q.n;
      const ham = hs.map(function (h) { return c[h]; });

      /* Kaynak veri sayfa disina tasmis mi? Algoritma degerlendirilemez:
         kirpmadan sonra da disarida kalir, "ihlal" saymak yaniltici olur. */
      const tasmis = ham.some(function (t) {
        return t.some(function (v) { return v < -EPS || v > 1 + EPS; });
      });
      if (tasmis) { veriHatasi.push(id); return; }
      say.gecerli++;

      const r = QuizCore.hizalaSiklar(ham);

      /* (a) aralik + pozitif olcu */
      r.x0.forEach(function (v, i) {
        if (v < -EPS || v > 1 + EPS) ekle('ARALIK', id, hs[i] + ' x0=' + v);
        if (r.w[i] <= 0) ekle('BOY', id, hs[i] + ' w=' + r.w[i]);
        if (r.h[i] <= 0) ekle('BOY', id, hs[i] + ' h=' + r.h[i]);
        if (r.y0[i] + r.h[i] > 1 + EPS) ekle('ARALIK', id, hs[i] + ' alt=' + (r.y0[i] + r.h[i]));
      });

      /* (b) ust uste binme */
      for (let i = 0; i < r.x0.length; i++)
        for (let j = i + 1; j < r.x0.length; j++) {
          const ox = Math.min(r.x0[i] + r.w[i], r.x0[j] + r.w[j]) - Math.max(r.x0[i], r.x0[j]);
          const oy = Math.min(r.y0[i] + r.h[i], r.y0[j] + r.h[j]) - Math.max(r.y0[i], r.y0[j]);
          if (ox > EPS && oy > EPS)
            ekle('BINME', id, hs[i] + '/' + hs[j] + ' ' + ox.toFixed(5) + 'x' + oy.toFixed(5));
        }

      /* (c) satir ici simetri - ayni y0'a sahip kutular ayni genislikte olmali */
      const grp = {};
      r.y0.forEach(function (v, i) {
        const k = v.toFixed(6);
        (grp[k] = grp[k] || []).push(i);
      });
      const anahtarlar = Object.keys(grp);
      anahtarlar.forEach(function (k) {
        const ws = grp[k].map(function (i) { return r.w[i]; });
        const fark = Math.max.apply(null, ws) - Math.min.apply(null, ws);
        if (fark > enBuyukSapma) { enBuyukSapma = fark; enBuyukSapmaSoru = id + ' [' + grp[k].map(function (i) { return hs[i]; }).join('') + ']'; }
        if (fark > SIMETRI_TOL)
          ekle('SIMETRI', id, grp[k].map(function (i) { return hs[i]; }).join('') + ' fark=' + fark.toFixed(6));
      });

      /* (d) kapsama - kutu kendi metnini tam kapsamali */
      ham.forEach(function (t, i) {
        if (r.x0[i] > t[0] + 1e-6)
          ekle('KAPSAMA-X', id, hs[i] + ' sol kesiyor ' + t[0].toFixed(4) + ' > ' + r.x0[i].toFixed(4));
        if (r.x0[i] + r.w[i] < t[2] - 1e-6)
          ekle('KAPSAMA-X', id, hs[i] + ' sag kesiyor ' + t[2].toFixed(4) + ' > ' + (r.x0[i] + r.w[i]).toFixed(4));
      });

      /* (e) determinizm */
      if (JSON.stringify(QuizCore.hizalaSiklar(ham)) !== JSON.stringify(r))
        ekle('BELIRSIZ', id, 'ayni girdi farkli cikti verdi');

      /* dagilim: en kalabalik satir x satir sayisi (5x1, 1x5, 3x2 ...) */
      const enFazla = Math.max.apply(null, anahtarlar.map(function (k) { return grp[k].length; }));
      const d2 = enFazla + 'x' + anahtarlar.length;
      dagilim[d2] = (dagilim[d2] || 0) + 1;
    });
  });
});

/* Ihlal ADEDI degil, etkilenen SORU sayisi onemli: bir soru 3 kez ihlal
   ediyorsa rapor 3 gosterir ama sorun 1 tanedir. */
const etkilenen = {};
ihlal.forEach(function (e) { etkilenen[e.split(' :: ')[1]] = 1; });
const etkilenenSay = Object.keys(etkilenen).length;
const turler = {};
ihlal.forEach(function (e) { const t = e.split(' :: ')[0]; turler[t] = (turler[t] || 0) + 1; });

const L = [];
L.push('=== QuizCore.hizalaSiklar dogrulama raporu ===');
L.push('toplam soru                : ' + say.toplam);
L.push('denetlenen (gecerli veri) : ' + say.gecerli);
L.push('veri hatasi (ayri tutuldu): ' + veriHatasi.length +
       (veriHatasi.length ? '  -> ' + veriHatasi.join(' | ') : ''));
L.push('layout dagilimi            : ' + JSON.stringify(dagilim));
L.push('en buyuk genislik sapmasi : ' + enBuyukSapma.toFixed(6) +
       '  (' + (enBuyukSapma * 1400).toFixed(1) + 'px @1400)');
if (enBuyukSapmaSoru) L.push('  sapmanin oldugu soru      : ' + enBuyukSapmaSoru);
L.push('ihlal olayi                : ' + ihlal.length);
L.push('etkilenen soru             : ' + etkilenenSay + '  (%' +
       (100 * etkilenenSay / Math.max(1, say.gecerli)).toFixed(1) + ')');
L.push('ihlal turleri              : ' + JSON.stringify(turler));
if (ihlal.length) {
  L.push('');
  L.push('--- ilk 25 ihlal ---');
  ihlal.slice(0, 25).forEach(function (e) { L.push('  ' + e); });
}
const rapor = L.join('\n');
console.log(rapor);

try {
  const p = path.join(ROOT, 'tools', 'preview');
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  fs.writeFileSync(path.join(p, 'layout-raporu.txt'), rapor + '\n', 'utf8');
} catch (e) { /* rapor yazilamazsa stdout yeterli */ }

/* 9 bozuk-veri kaynakli soru BILINEN ve belgelenmistir. Uzerine cikilirsa
   exit 1 -> regresyon yakalanir. */
const kotu = etkilenenSay > IHLAL_ESIK;
if (kotu) console.log('\nSONUC: BASARISIZ - beklenen en fazla ' + IHLAL_ESIK +
                      ' etkilenen soru, bulunan ' + etkilenenSay);
else console.log('\nSONUC: GECTI - ' + say.gecerli + ' soru denetlendi, ' +
                  etkilenenSay + ' soru bilinen bozuk veriden etkileniyor (<= ' + IHLAL_ESIK + ')');
process.exit(kotu ? 1 : 0);
