/**
 * ders-notlari — enhancements.js
 * page_*.html ders notu sayfaları için:
 *   1. A-E şıklarını tıklanabilir butonlara dönüştür (ÖNCE)
 *   2. SADECE Çözüm/Cevap alanlarını gizle (SONRA)
 *   3. Yayınevi adlarını temizle
 *   4. localStorage tema/arka plan senkronu
 *
 * KURAL: ÖRNEK ve şıklar daima görünür kalır.
 *        Sadece "Çözüm:" / "Cevap:" ile başlayan bloklar gizlenir.
 */

(function () {
  'use strict';

  /* ── Quiz modu çakışma koruması ─────────────────────────────── */
  if (
    document.body &&
    (document.body.classList.contains('quiz') ||
      document.getElementById('qviewer') ||
      document.querySelector('.qhotspot'))
  ) {
    return; // quiz-core.js halleder
  }

  /* ── Yayınevi listesi ───────────────────────────────────────── */
  const YAYINEVLERI = [
    'Pegem Akademi','Pegem Yayınları','Pegem Yayıncılık','Pegem',
    'Yargı Yayınevi','Yargı Yayınları','Yargı Akademi',
    'Benim Hocam Yayınları','Benim Hocam',
    'İsem Yayıncılık','İsem Akademi','İsem',
    'Yediiklim Akademi','Yediiklim Yayınları','Yediiklim',
    'Hocawebde Yayınları','Hocawebde',
    'Pelikan Yayınevi','Pelikan Yayınları','Pelikan',
    'Nobel Akademik','Nobel Yayınları','Nobel',
    'Karakutu Yayınları','Kara Kutu',
    'Murat Yayınları','Murat Açıköğretim',
    'Tasarı Akademi','Tasarı Yayınları',
    'Doktrin Yayınları','Lider Yayınları',
    'Altın Nokta','Savaş Yayınevi','Gece Kitaplığı'
  ];

  /* ── Arka plan renkleri ─────────────────────────────────────── */
  const BG_COLORS = {
    'default':null,'pastel-blue':'#0b1d33','soft-beige':'#131a2b',
    'classic-gray':'#0d1422','night-blue':'#0f172a'
  };

  /* ──────────────────────────────────────────────────────────────
     CSS ENJEKSİYONU
     Şıklar çok minimal: sayfanın kendi font boyutuyla aynı veya
     1-2px büyük. Badge küçük daire, buton ince çerçeveli satır.
  ─────────────────────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.id = 'dn-enhancements-style';
  style.textContent = `
    /* ─── Şık Butonları — Minimal ──────────────────────────── */
    .dn-choices-container {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin: 10px 0 14px;
    }
    .dn-choices-container.dn-inline {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 7px;
    }
    .dn-choices-container.dn-inline .dn-choice-btn {
      flex: 1 1 auto;
      min-width: 70px;
    }

    .dn-choice-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      /* Font: sayfadan miras alır — büyütme yok */
      font-size: inherit;
      font-family: inherit;
      line-height: 1.4;
      /* Çerçeve ve dolgu: çok ince */
      padding: 4px 11px 4px 6px;
      min-height: 32px;
      border: 1px solid rgba(99, 155, 255, 0.28);
      border-radius: 7px;
      background: rgba(30, 45, 80, 0.25);
      color: inherit;
      cursor: pointer;
      text-align: left;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
      transition: border-color 0.15s, background 0.15s, transform 0.12s;
      /* Mobil dokunma alanı min 44px height için padding kullan */
    }
    @media (max-width:640px) {
      .dn-choice-btn { min-height: 40px; }
    }
    .dn-choice-btn:hover {
      border-color: rgba(99, 155, 255, 0.7);
      background: rgba(59, 130, 246, 0.1);
      transform: translateX(2px);
    }
    .dn-choices-container.dn-inline .dn-choice-btn:hover {
      transform: translateY(-1px);
    }

    /* Seçilmiş şık */
    .dn-choice-btn.dn-selected {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
      box-shadow: 0 0 0 1.5px rgba(56, 189, 248, 0.3);
      color: #e0f2fe;
    }

    /* Küçük yuvarlak rozet — harfi gösterir */
    .dn-choice-badge {
      flex: 0 0 auto;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1px solid rgba(99, 155, 255, 0.5);
      background: rgba(59, 130, 246, 0.15);
      color: #93c5fd;
      font-size: 10.5px;
      font-weight: 800;
      display: grid;
      place-items: center;
      transition: all 0.14s;
    }
    .dn-choice-btn:hover .dn-choice-badge {
      border-color: #60a5fa;
      background: rgba(59, 130, 246, 0.3);
      color: #fff;
    }
    .dn-choice-btn.dn-selected .dn-choice-badge {
      background: #38bdf8;
      border-color: #bae6fd;
      color: #0c4a6e;
    }
    .dn-choice-text {
      flex: 1 1 auto;
      word-break: break-word;
    }

    /* ─── Çözüm / Cevap Gizleme Kutusu ────────────────────── */
    .dn-solution-wrapper {
      position: relative;
      margin: 14px 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(245, 158, 11, 0.25);
      background: rgba(15, 23, 42, 0.3);
    }
    .dn-solution-content {
      padding: 12px 16px;
      transition: filter 0.3s, opacity 0.3s, max-height 0.32s;
    }
    .dn-solution-content.dn-hidden {
      filter: blur(9px);
      -webkit-filter: blur(9px);
      opacity: 0.1;
      user-select: none;
      pointer-events: none;
      max-height: 80px;
      overflow: hidden;
    }
    .dn-solution-overlay {
      position: absolute;
      inset: 0;
      background: rgba(12, 18, 40, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1.5px dashed rgba(245, 158, 11, 0.5);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
      transition: opacity 0.25s, visibility 0.25s;
    }
    .dn-solution-overlay.dn-revealed {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .dn-solution-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 20px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0f172a;
      border: none;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 3px 14px rgba(245, 158, 11, 0.4);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .dn-solution-btn:hover {
      transform: scale(1.04);
      box-shadow: 0 5px 20px rgba(245, 158, 11, 0.6);
    }
    .dn-solution-toggle-bar {
      padding: 5px 12px 8px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .dn-solution-mini-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.28);
      border-radius: 999px;
      color: #fbbf24;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }
    .dn-solution-mini-btn:hover {
      background: rgba(245, 158, 11, 0.2);
      color: #fef3c7;
    }
  `;
  document.head.appendChild(style);

  /* ── Arka plan rengini uygula ─────────────────────────────── */
  function applyBgColor() {
    try {
      const saved = localStorage.getItem('dn.bgColor');
      if (saved && BG_COLORS[saved]) document.body.style.backgroundColor = BG_COLORS[saved];
    } catch (e) {}
  }

  /* ── Yayınevi isimlerini temizle ─────────────────────────── */
  function cleanPublisherNames() {
    const pat = new RegExp(
      YAYINEVLERI.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi'
    );
    function walk(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (pat.test(node.textContent)) {
          node.textContent = node.textContent.replace(pat, '').replace(/\s{2,}/g, ' ').trim();
        }
        pat.lastIndex = 0;
        return;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        if (['script','style','noscript'].includes(tag)) return;
        Array.from(node.childNodes).forEach(walk);
      }
    }
    if (document.body) walk(document.body);
  }

  /* ──────────────────────────────────────────────────────────────
     A-E ŞIK DÖNÜŞÜMÜ (önce çalışır)
     Şıklar .dn-choices-container içine taşınır;
     böylece hideSolutions() onlara dokunmaz.
  ─────────────────────────────────────────────────────────────── */

  // Şık harf + ayırıcı deseni
  const CHOICE_START  = /^[\s(]*([A-E])[)\s.\-]\s*(.*)$/i;
  // Tek satırda yan yana şıklar: "A) metin   B) metin   C) metin"
  const INLINE_FINDER = /(?:^|(?<=\s{2,}))[\s(]*([A-E])[)\.\-]\s*([^\n]*?)(?=(?:\s{2,}[\s(]*[A-E][)\.\-])|$)/gi;

  function makeInteractiveChoices() {
    // 1) Tek satırda birleşik şıklar
    splitInlineChoices();
    // 2) Ayrı satır/element şıklar
    groupSequentialChoices();
  }

  function splitInlineChoices() {
    const sel = 'p, li, td, th, .culture-item';
    document.querySelectorAll(sel).forEach(el => {
      if (el.closest('.dn-choices-container') || el.closest('.dn-solution-wrapper')) return;
      if (el.children.length > 2) return;
      const raw = el.textContent.trim();
      if (!raw || raw.length < 8) return;

      // En az A ve B'nin sıralı geçtiği tek satır mı?
      const hits = [];
      INLINE_FINDER.lastIndex = 0;
      let m;
      while ((m = INLINE_FINDER.exec(raw)) !== null) {
        hits.push({ letter: m[1].toUpperCase(), text: m[2].trim() });
      }

      if (hits.length < 2) return;
      const letters = hits.map(h => h.letter);
      if (!letters.includes('A') || !letters.includes('B')) return;

      createContainer(el.parentNode, el, hits);
    });
  }

  function groupSequentialChoices() {
    // Scope: her container için ayrı tarama
    const containers = document.querySelectorAll('.page, body, main, article, .content, section');
    containers.forEach(ctr => {
      const items = Array.from(ctr.querySelectorAll('p, li, .culture-item'));
      let grp = [];
      let par = null;

      function flush() {
        if (grp.length >= 2) {
          const letters = grp.map(el => {
            const m = el.textContent.trim().match(CHOICE_START);
            return m ? m[1].toUpperCase() : '';
          });
          // İlk şık A, ikinci B ile başlamalı
          if (letters[0] === 'A' && letters[1] === 'B') {
            buildSeqContainer(grp);
          }
        }
        grp = []; par = null;
      }

      items.forEach(item => {
        if (item.closest('.dn-choices-container') || item.closest('.dn-solution-wrapper')) return;
        const txt = item.textContent.trim();
        const m = txt.match(CHOICE_START);
        if (!m) { flush(); return; }

        const letter = m[1].toUpperCase();

        if (par === null || par === item.parentNode) {
          const expected = String.fromCharCode(65 + grp.length); // A, B, C, ...
          if (letter === expected) {
            grp.push(item); par = item.parentNode;
          } else if (letter === 'A') {
            flush(); grp.push(item); par = item.parentNode;
          } else {
            flush();
          }
        } else {
          flush();
          if (letter === 'A') { grp.push(item); par = item.parentNode; }
        }
      });
      flush();
    });
  }

  function buildSeqContainer(group) {
    if (!group.length) return;
    const parent = group[0].parentNode;
    const ref    = group[0];
    const parsed = group.map(el => {
      const txt = el.textContent.trim();
      const m   = txt.match(CHOICE_START);
      return { el, letter: m ? m[1].toUpperCase() : '?', body: m ? m[2].trim() : txt };
    });
    const maxLen = Math.max(...parsed.map(p => p.body.length));
    const isInline = maxLen <= 30 && parsed.length >= 3;

    const ctr = makeChoiceContainer(isInline);
    let sel = null;
    parsed.forEach(({ el, letter, body }) => {
      ctr.appendChild(makeChoiceBtn(letter, body, () => {
        if (sel === letter) { sel = null; }
        else { sel = letter; }
      }, () => sel));
      el.remove();
    });
    parent.insertBefore(ctr, ref);
  }

  function createContainer(parent, original, hits) {
    if (!parent) return;
    const maxLen = Math.max(...hits.map(h => h.text.length));
    const isInline = maxLen <= 30;

    const ctr = makeChoiceContainer(isInline);
    let sel = null;
    hits.forEach(({ letter, text }) => {
      ctr.appendChild(makeChoiceBtn(letter, text, () => {
        if (sel === letter) sel = null;
        else sel = letter;
      }, () => sel));
    });
    parent.insertBefore(ctr, original);
    original.remove();
  }

  function makeChoiceContainer(inline) {
    const d = document.createElement('div');
    d.className = 'dn-choices-container' + (inline ? ' dn-inline' : '');
    return d;
  }

  function makeChoiceBtn(letter, text, onClick, getSel) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dn-choice-btn';
    btn.innerHTML =
      `<span class="dn-choice-badge">${letter}</span>` +
      `<span class="dn-choice-text">${text}</span>`;
    btn.addEventListener('click', () => {
      const wasSelected = btn.classList.contains('dn-selected');
      // Aynı container içindeki diğer seçimleri temizle
      const siblings = btn.closest('.dn-choices-container');
      if (siblings) siblings.querySelectorAll('.dn-choice-btn.dn-selected')
        .forEach(b => b.classList.remove('dn-selected'));
      if (!wasSelected) btn.classList.add('dn-selected');
    });
    return btn;
  }

  /* ──────────────────────────────────────────────────────────────
     ÇÖZÜM / CEVAP GİZLEME (şıklar dönüştürüldükten SONRA çalışır)
     SADECE "Çözüm:", "ÇÖZÜM:", "Cevap:", "Doğru cevap:" satırları
     ve bunların ardından gelen kardeş paragraflar gizlenir.
     ÖRNEK başlığı ve şıklar (.dn-choices-container) asla gizlenmez.
  ─────────────────────────────────────────────────────────────── */

  // Sadece çözüm/cevap başlıklarını yakalar — ÖRNEK, soru metni vs. dahil DEĞİL
  const COZUM_RE  = /^(?:ÇÖZÜM|Çözüm|COZUM|Cozüm)\s*[:\-–]/i;
  const CEVAP_RE  = /^(?:DOĞRU\s+)?(?:CEVAP|Cevap|YANIT|Yanıt)\s*[:\-–]?\s*[A-E]?\b/i;

  // Bu etiketler çözüm bölümünü sona erdirir
  const STOP_TAGS = new Set(['h1','h2','h3','h4','hr','table','figure']);

  function hideSolutions() {
    // 1. CSS sınıf bazlı (varsa)
    ['.cozum','.solution','.cevap-alani','.answer-box','.answer-key']
      .forEach(sel => document.querySelectorAll(sel)
        .forEach(el => wrapSingle(el)));

    // 2. Metin tabanlı: SADECE Çözüm: ile başlayan elementleri bul
    Array.from(document.querySelectorAll('p, div, blockquote, li, .quote-box-note'))
      .forEach(el => {
        if (isAlreadyWrapped(el)) return;
        if (el.children.length > 4) return; // karmaşık konteyner atla
        // Şık butonlarını asla sarma
        if (el.classList.contains('dn-choice-btn') ||
            el.closest('.dn-choices-container')) return;

        const txt = el.textContent.trim();
        if (!COZUM_RE.test(txt) || txt.length > 800) return;

        // Çözüm elementini ve hemen ardından gelen CEVAP satırını/paragraflarını topla
        const grp = [el];
        let nx = el.nextElementSibling;
        let lim = 0;

        while (nx && lim < 6) {
          if (isAlreadyWrapped(nx)) break;
          if (nx.closest('.dn-choices-container')) break; // şıklara girme
          const tag = nx.tagName.toLowerCase();
          if (STOP_TAGS.has(tag)) break;
          // Yeni bir ÖRNEK başlığına denk geldi mi?
          const ntxt = nx.textContent.trim();
          if (/^(?:Örnek|ÖRNEK)\b/i.test(ntxt)) break;
          // Yeni bir soru numarası mı?
          if (/^\d+\s*[\.\)]\s/.test(ntxt)) break;
          // Devam eden cevap / açıklama satırı mı?
          if (ntxt.length > 0 && ntxt.length <= 600) {
            grp.push(nx);
            nx = nx.nextElementSibling;
            lim++;
          } else {
            break;
          }
        }

        if (grp.length === 1) wrapSingle(grp[0]);
        else wrapGroup(grp);
      });

    // 3. Tek başına duran "Cevap: X" satırları
    Array.from(document.querySelectorAll('p, div, li, span')).forEach(el => {
      if (isAlreadyWrapped(el)) return;
      if (el.closest('.dn-choices-container')) return;
      const t = el.textContent.trim();
      if (CEVAP_RE.test(t) && t.length < 150) wrapSingle(el);
    });
  }

  function isAlreadyWrapped(el) {
    return el.closest('.dn-solution-wrapper') ||
           el.classList.contains('dn-solution-content') ||
           el.classList.contains('dn-solution-inner');
  }

  function makeSolutionUI() {
    const wrapper = document.createElement('div');
    wrapper.className = 'dn-solution-wrapper';

    const overlay = document.createElement('div');
    overlay.className = 'dn-solution-overlay';
    overlay.innerHTML = `
      <button class="dn-solution-btn" type="button">
        <span>💡</span><span>Çözümü Göster</span>
      </button>`;

    const bar = document.createElement('div');
    bar.className = 'dn-solution-toggle-bar';
    bar.style.display = 'none';
    bar.innerHTML = `
      <button class="dn-solution-mini-btn" type="button">
        <span>🙈</span><span>Çözümü Gizle</span>
      </button>`;

    return { wrapper, overlay, bar };
  }

  function wrapSingle(el) {
    if (isAlreadyWrapped(el)) return;
    const { wrapper, overlay, bar } = makeSolutionUI();
    el.classList.add('dn-solution-content', 'dn-hidden');
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(overlay);
    wrapper.appendChild(el);
    wrapper.appendChild(bar);
    bindToggle(overlay, bar, [el]);
  }

  function wrapGroup(elements) {
    if (!elements.length) return;
    const first = elements[0];
    if (isAlreadyWrapped(first)) return;

    const { wrapper, overlay, bar } = makeSolutionUI();
    const content = document.createElement('div');
    content.className = 'dn-solution-content dn-hidden';

    first.parentNode.insertBefore(wrapper, first);
    wrapper.appendChild(overlay);
    wrapper.appendChild(content);
    wrapper.appendChild(bar);
    elements.forEach(el => {
      el.classList.add('dn-solution-inner');
      content.appendChild(el);
    });
    bindToggle(overlay, bar, [content]);
  }

  function bindToggle(overlay, bar, targets) {
    overlay.querySelector('.dn-solution-btn').addEventListener('click', () => {
      targets.forEach(t => t.classList.remove('dn-hidden'));
      overlay.classList.add('dn-revealed');
      bar.style.display = 'flex';
    });
    bar.querySelector('.dn-solution-mini-btn').addEventListener('click', () => {
      targets.forEach(t => t.classList.add('dn-hidden'));
      overlay.classList.remove('dn-revealed');
      bar.style.display = 'none';
    });
  }

  /* ── Başlat ─────────────────────────────────────────────────── */
  function init() {
    try {
      applyBgColor();
      cleanPublisherNames();
      makeInteractiveChoices(); // ŞIK dönüşümü ÖNCE
      hideSolutions();          // ÇÖZÜM gizleme SONRA (şıklara dokunmaz)
    } catch (err) {
      // Sessiz hata — diğer sayfa işlevlerini bozma
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('storage', e => {
    if (e.key === 'dn.bgColor') applyBgColor();
  });
})();
