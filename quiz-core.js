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
  var SATIR_Y = 0.016;    /* bir metin satirinin yuksekligi (olculmus 0.0162) */

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

    /* (3) satir bantlari. */
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

    /* Tek sutun dikey dizilim (1x5 vb.): tum siklar tek sutunda alt alta ise
       tum siklar ayni sol kenar ve genisligi alir.

       DYKARTI 2026-10-05: onceki surum her bantin ALTINI "bir sonraki satirin
       tepesine kadar" yapay olarak uzatiyordu (satir 126-129:
       `Math.max(bot + dy, sonrakiTop - 0.002)`). Bu, sik kutusunu altindaki
       1-3 sibling seklinin USTUNE yaziyordu:
         turkce-test s.17 q3 -> B kutusu 0.6911-0.7606, gercek "B)" metni
         0.6951-0.7113. Kutu C/D/E metnini de yutup tiklamayi kendine cekiyor,
         rozet de metinden ~0.023 asagi kaysiyordu.
       Ham `c` kutusu zaten sarilmis metnin TAMAMINI icerir (olculmus: s.17 q3
       E ham kutusu 0.8765-0.9400 = 3.9 satir). Yani bu uzatmanin hicbir
       gorevi yoktu; yalnizca kayma uretiyordu. Artik kutu kendi satir
       bandinda kalir. */
    var isTekSutun = (ns > 1 && bant.every(function (bt) { return bt.idx.length === 1; }));
    var colX0 = 0, colX1 = 0;
    if (isTekSutun) {
      colX0 = Math.min.apply(null, b.map(function (x) { return x.x0; }));
      colX1 = Math.max.apply(null, b.map(function (x) { return x.x1; }));
    }

    /* (4) su-regimi: her satiri metinden akan esit kolonlara bol */
    for (s = 0; s < ns; s++) {
      var row = bant[s].idx.slice().sort(function (p, q) { return b[p].x0 - b[q].x0; });
      m = row.length;
      var y0 = Math.max(0, bant[s].top - bant[s].dy);
      var y1;
      if (isTekSutun) {
        /* Dikey tek sutun: kutu kendi satirinda kalir, ama seklin SATIRILMIS
           devam satiri (parantez icinde aciklama vb.) varsa onu da kapsar.
           DYKARTI: eski kod burada `sonrakiTop - 0.002`'ye kadar SINIRSIZ
           uziyordu; aradaki bosluk ne kadar buyukse kutu o kadar asagi
           iniyor ve alttaki kardes seklin metnini yutup tiklamayi cekiyordu
           (olculmus: turkce-test s.17 q3 B kutusu kendi metninden 3.5 satir
           uzun = +0.0533; E kutusu -0.0238).
           Simdi: en fazla 1 satir kadar (SATIR_Y) uzat, ve ASLA bir sonraki
           seklin tepesini gecme. Kalibrasyon olculdu: 8 vakada gercek metin
           alti ham kutudan 0.0124-0.0155 (= 0.5 satir) asagida. */
        var tavan = bant[s].bot + bant[s].dy + SATIR_Y;
        if (s < ns - 1) tavan = Math.min(tavan, bant[s + 1].top - bant[s + 1].dy - 0.002);
        y1 = Math.min(1, Math.max(bant[s].bot + bant[s].dy, tavan));
      } else {
        y1 = Math.min(1, Math.max(y0 + 0.008, bant[s].bot + bant[s].dy));
      }

      if (isTekSutun) {
        var ixTek = row[0];
        var sK = Math.min(colX0, 1), eK = Math.min(colX1, 1);
        if (eK < sK) eK = sK;
        c.x0[ixTek] = sK;
        c.y0[ixTek] = y0;
        c.w[ixTek] = eK - sK;
        c.h[ixTek] = y1 - y0;
      } else {
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
    }

    c.satir = ns > 1 ? sId : null;
    return c;
  }

  /* cizilenSiklar(harfMap, taban) -> [[x0,y0,x1,y1], ...]
     HAM koordinat DEGIL, modun ekrana CIZDIGI buyutulmus kutuyu dondurur.
     Neden sart: hizalaSiklar her satir bandini dikeyde DY kadar buyutur ve
     modlar ayrica taban min genislik/min yukseklik uygular. Ham koordinattan
     turetilen bir engel, cizilen hotspot'un ALT kenarini icinde birakir —
     yapisal olarak ortusmeyi GOREMEZ. soruyuKoru'ya verilecek engel listesi
     budur.
     harfMap : {A:[x0,y0,x1,y1], ...} (normalize EDILMEMIS olabilir -> klamp)
     Eksik/bozuk harf ATLANIR; cikti sirasi "ABCDE"dir.
     taban   : {minW, minH} — modun kullandigi taban. Verilmezse 3 modun en
     buyugu (minW 0.05 / minH 0.016) kullanilir: guvenli varsayilan. */
  var HARFLER = ['A', 'B', 'C', 'D', 'E'];
  var TABAN = { minW: 0.05, minH: 0.016 };

  function cizilenSiklar(harfMap, taban) {
    var c = [];
    if (!harfMap) return c;
    var t = taban || TABAN;
    var mw = typeof t.minW === 'number' ? t.minW : TABAN.minW;
    var mh = typeof t.minH === 'number' ? t.minH : TABAN.minH;
    var rows = [], i;
    for (i = 0; i < HARFLER.length; i++) {
      var v = harfMap[HARFLER[i]];
      if (!v || v.length < 4) continue;        /* eksik harf ATLANIR */
      rows.push(v);
    }
    if (!rows.length) return c;
    var h = hizalaSiklar(rows);
    for (i = 0; i < rows.length; i++) {
      /* modlarla birebir ayni: left=x0, top=y0, w=max(taban,w), h=max(taban,h) */
      var x0 = klamp(h.x0[i]), y0 = klamp(h.y0[i]);
      var x1 = klamp(x0 + Math.max(mw, h.w[i]), x0);
      var y1 = klamp(y0 + Math.max(mh, h.h[i]), y0);
      c.push([x0, y0, x1, y1]);
    }
    return c;
  }

  /* Tek noktali olay delegasyonu. (root, sec)
     SADECE A-E sik kutusu: sec.onHotspot(qid, h, ev, hot)
       -> .qhotspot / .qz-hot tiklandi
     Neden: hotspot dugmeleri her cizimde YENIDEN olusuyor
     (oku.html container.innerHTML='' ; galeri.html yeni 'ov'). Elle
     baglanan her dinleyici o dugmeyle birlikte copur ve ayni mantik
     N kez baglanmis olur. Delegasyonda tek dinleyici yeter.
     Idempotent: ayni root'a ikinci cagri sessizce yutar.
     stopPropagation KORUNUR: viewer.html'te document tiklamasiyla
     kapanan 'ep' ozet paneli ve oku.html'te kapanan soru secim
     kutulari bunlara bagli.

     2026-10-05: cozum maskesi ("Cozumu Goster/Gizle") butonu ve yayinevi
     bandi kalici olarak kaldirildi — sayfa uzerinde artik HICBIR sey
     gizlenmiyor, yalnizca A-E secilebilir. Maske-toggle kolu buradan da
     silindi; sanal dugmeye tiklamak hicbir sey yapmaz. */
  var baglananlar = new WeakSet();
  function bindEvents(root, sec) {
    if (!root || typeof root.addEventListener !== 'function') return false;
    if (baglananlar.has(root)) return false;
    baglananlar.add(root);
    root.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || typeof t.closest !== 'function') return;
      var hot = t.closest('.qhotspot, .qz-hot');
      if (!hot || !root.contains(hot) || typeof sec.onHotspot !== 'function') return;
      var d = hot.dataset;
      var qid = d ? (d.qid || null) : null;
      var h = d ? (d.h || null) : null;
      if (!qid || !h) return;
      ev.preventDefault();
      ev.stopPropagation();
      sec.onHotspot(qid, h, ev, hot);
    });
    return true;
  }

  return {
    hizalaSiklar: hizalaSiklar,
    cizilenSiklar: cizilenSiklar,
    soruyuKoru: soruyuKoru,
    bindEvents: bindEvents,
    SABIT: { GAP: GAP, OUT: OUT, DY: DY, SATIR_TOL: SATIR_TOL, MINW: MINW }
  };
});
