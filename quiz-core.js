/* quiz-core.js — A-B-C-D-E sik kutularinin saf geometrisi.
   Uc mod (oku.html / galeri.html / viewer.html) bu dosyayi
   <script src="quiz-core.js"></script> ile yukler. Build yok, bagimlilik yok.
   Node'da da require edilebilir: node tools/qz-core.test.js

   DOM'A DOKUNMAZ. Tum olcumler normalize [0,1].

   YAKLASIM (waterfall): Satirlar gruplanir, her satir kendi icinde esit
   kolonlara bolunur. Kolon sinirlari hedef esit genislikle kurulur; ancak
   metni kapsama ve komsuya binmeme HER ZAMAN kazanir. Cunku gercek veride
   "tam esit genislik" ile "metni tam kapsama" ayni anda mumkun degildir
   (deneme s.32 s.15: metin deltalari 0.1345 ve 0.1308). */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.QuizCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var GAP = 0.002;        /* kolonlar arasi bosluk */
  var OUT = 0.004;        /* satir dis kenarindaki tasma */
  var DY = 0.004;         /* satir bandi dikey tasma */
  var SATIR_TOL = 0.006;  /* ayni satir sayma toleransi */
  var MINW = 0.012;       /* bozuk veriye karsi en az genislik */

  function klamp(v, alt) {
    if (typeof v !== 'number' || isNaN(v)) v = alt || 0;
    return Math.min(1, Math.max(0, v));
  }

  var KENAR = 0.04;   /* sayfa ust/alt guvenlik bandi */
  var MIN_Y = 0.01;   /* bu yuksekligin altinda maske uretilmez */

  /* [x0,y0,x1,y1] maske + engel listesi -> kirpilmis maske | null.
     SORU METNI HICBIR ZAMAN GIZLENMEZ: yalnizca dikey serit kirpilir.
     Engel maskenin icinde tamamen kaliyorsa maske bolunmez (kirpma yalnizca
     kenarlardan olur) — cozum blogu bu durumda da gizlenir. */
  function soruyuKoru(mask, engeller) {
    if (!mask || mask.length < 4) return null;
    var x0 = klamp(mask[0]);
    var y0 = klamp(mask[1]);
    var x1 = klamp(mask[2], x0);
    var y1 = klamp(mask[3], y0);
    if (y1 < y0) { var t = y0; y0 = y1; y1 = t; }
    var liste = engeller || [];
    for (var i = 0; i < liste.length; i++) {
      var e = liste[i];
      if (!e || e.length < 4) continue;
      /* yalnizca yatayda kesisen engel maskeyi kirpar */
      if (Math.min(x1, klamp(e[2])) - Math.max(x0, klamp(e[0])) <= 0) continue;
      var e0 = klamp(e[1]);
      var e1 = klamp(e[3], e0);
      if (e1 <= y0 || e0 >= y1) continue;
      if (e1 > y0 && e1 <= y1) y0 = e1;   /* soru metni ustte bitti -> maskenin ustunu kirp */
      if (e0 < y1 && e0 >= y0) y1 = e0;   /* soru metni asagida basliyor -> maskenin altini kirp */
    }
    y0 = Math.max(y0, KENAR);
    y1 = Math.min(y1, 1 - KENAR);
    if (y1 - y0 < MIN_Y) return null;
    return [x0, y0, x1, y1];
  }

  /* rows: [[x0,y0,x1,y1], ...] -> {x0[],y0[],w[],h[],satir} */
  function hizalaSiklar(rows) {
    var n = rows && rows.length ? rows.length : 0;
    var c = { x0: [], y0: [], w: [], h: [], satir: null };
    var i, j, k, s, m;
    if (!n) return c;

    /* (1) girdiyi [0,1] araligina getir, satir merkezini hesapla */
    var b = [];
    for (i = 0; i < n; i++) {
      var r = rows[i] || [0, 0, 0, 0];
      var bx0 = klamp(r[0]), by0 = klamp(r[1]);
      var bx1 = klamp(r[2], bx0), by1 = klamp(r[3], by0);
      b.push({ x0: bx0, y0: by0, x1: bx1, y1: by1, cy: (by0 + by1) / 2 });
    }

    /* (2) satir gruplama: greedy. Kutu, referans satirin yuksekligine gore
           toleransla ayni satira girer. */
    var sId = [], ns = 0;
    for (i = 0; i < n; i++) sId.push(-1);
    for (i = 0; i < n; i++) {
      if (sId[i] > -1) continue;
      sId[i] = ns;
      for (j = i + 1; j < n; j++) {
        if (sId[j] !== -1) continue;
        var tol = Math.max(SATIR_TOL, (b[i].y1 - b[i].y0) * 0.6);
        if (Math.abs(b[j].cy - b[i].cy) <= tol) sId[j] = ns;
      }
      ns++;
    }

    /* (3) satir bantlari. dikey tasma komsu satira binmemeye kadar kisilir. */
    var bant = [];
    for (s = 0; s < ns; s++) {
      var idx = [], top = Infinity, bot = -Infinity;
      for (i = 0; i < n; i++) if (sId[i] === s) {
        idx.push(i);
        if (b[i].y0 < top) top = b[i].y0;
        if (b[i].y1 > bot) bot = b[i].y1;
      }
      bant.push({ idx: idx, top: top, bot: bot, dy: DY });
    }
    for (s = 0; s < ns; s++) {
      if (s > 0) bant[s].dy = Math.min(bant[s].dy, Math.max(0, (bant[s].top - bant[s - 1].bot) / 2));
      if (s < ns - 1) bant[s].dy = Math.min(bant[s].dy, Math.max(0, (bant[s + 1].top - bant[s].bot) / 2));
    }

    /* (4) su-regimi: her satiri metinden akan esit kolonlara bol */
    for (s = 0; s < ns; s++) {
      var row = bant[s].idx.slice().sort(function (p, q) { return b[p].x0 - b[q].x0; });
      m = row.length;
      var y0 = Math.max(0, bant[s].top - bant[s].dy);
      var y1 = Math.min(1, Math.max(y0 + 0.008, bant[s].bot + bant[s].dy));
      var sol = b[row[0]].x0, sag = b[row[0]].x1, enGenis = 0;
      for (k = 0; k < m; k++) {
        if (b[row[k]].x1 > sag) sag = b[row[k]].x1;
        if (b[row[k]].x1 - b[row[k]].x0 > enGenis) enGenis = b[row[k]].x1 - b[row[k]].x0;
      }
      /* hedef: ideal esit bolme, ama hicbir kutu kendi metninden dar olmaz */
      var hedef = Math.max((sag - sol + 2 * OUT - (m - 1) * GAP) / m, enGenis);
      var imlec = sol;
      for (k = 0; k < m; k++) {
        var ix = row[k];
        var x0 = imlec;
        var x1 = Math.max(x0 + hedef, b[ix].x1);
        if (k < m - 1) x1 = Math.min(x1, b[row[k + 1]].x0 - GAP);
        if (x1 < b[ix].x1) x1 = b[ix].x1;      /* kapsama kazanir */
        if (x1 < x0 + MINW) x1 = x0 + MINW;   /* asla ters/negatif */
        var solK = Math.min(x0, 1), sagK = Math.min(x1, 1);
        if (sagK < solK) sagK = solK;
        c.x0[ix] = solK;
        c.y0[ix] = y0;
        c.w[ix] = sagK - solK;
        c.h[ix] = y1 - y0;
        imlec = x1 + GAP;
      }
    }

    c.satir = ns > 1 ? sId : null;
    return c;
  }

  return {
    hizalaSiklar: hizalaSiklar,
    soruyuKoru: soruyuKoru,
    SABIT: { GAP: GAP, OUT: OUT, DY: DY, SATIR_TOL: SATIR_TOL, MINW: MINW }
  };
});
