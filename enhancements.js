/**
 * ders-notlari — enhancements.js
 * Sayfa notları ve genel platform için:
 *   1. Çözüm/Cevap alanlarını tespit et ve modern cam efektli kutuyla gizle -> "💡 Çözümü Göster" butonu
 *   2. Statik A-E şıklarını (tek satırda yan yana birleşik veya çok satırlı) tıklanabilir modern butonlara dönüştür
 *   3. Yayınevi adlarını dinamik olarak DOM'dan temizle
 *   4. localStorage'dan tema ve arka plan rengini senkronize et
 *   5. body.quiz veya quiz modlarında çakışmayı önle
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────
     0. QUIZ MODU KONTROLÜ (Çakışma Önleme)
  ───────────────────────────────────────────────────────────────── */
  if (
    document.body &&
    (document.body.classList.contains('quiz') ||
      document.getElementById('qviewer') ||
      document.querySelector('.qviewer') ||
      document.querySelector('.qhotspot'))
  ) {
    // Quiz sayfalarında hotspot sistemi çalışır; müdahale etme.
    return;
  }

  /* ─────────────────────────────────────────────────────────────────
     1. YAYINEVİ ADLARI LİSTESİ
  ───────────────────────────────────────────────────────────────── */
  const YAYINEVLERI = [
    'Pegem Akademi', 'Pegem Yayınları', 'Pegem Yayıncılık', 'Pegem',
    'Yargı Yayınevi', 'Yargı Yayınları', 'Yargı Akademi',
    'Benim Hocam Yayınları', 'Benim Hocam',
    'İsem Yayıncılık', 'İsem Akademi', 'İsem',
    'Yediiklim Akademi', 'Yediiklim Yayınları', 'Yediiklim',
    'Hocawebde Yayınları', 'Hocawebde',
    'Pelikan Yayınevi', 'Pelikan Yayınları', 'Pelikan',
    'Nobel Akademik', 'Nobel Yayınları', 'Nobel',
    'Karakutu Yayınları', 'Kara Kutu',
    'Murat Yayınları', 'Murat Açıköğretim',
    'Tasarı Akademi', 'Tasarı Yayınları',
    'Doktrin Yayınları', 'Lider Yayınları',
    'Altın Nokta', 'Savaş Yayınevi', 'Gece Kitaplığı'
  ];

  /* ─────────────────────────────────────────────────────────────────
     2. ARKA PLAN RENKLERİ
  ───────────────────────────────────────────────────────────────── */
  const BG_COLORS = {
    'default': null,
    'pastel-blue': '#0b1d33',
    'soft-beige': '#131a2b',
    'classic-gray': '#0d1422',
    'night-blue': '#0f172a'
  };

  /* ─────────────────────────────────────────────────────────────────
     3. CSS ENJEKSİYONU (Modern Cam Tasarım & Naif Şıklar)
  ───────────────────────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.id = 'dn-enhancements-style';
  style.textContent = `
    /* ─── Çözüm / Cevap Gizleme Kutusu ────────────────────────── */
    .dn-solution-wrapper {
      position: relative;
      margin: 16px 0;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid rgba(245, 158, 11, 0.28);
      background: rgba(15, 23, 42, 0.45);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }
    .dn-solution-content {
      padding: 14px 18px;
      transition: filter 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s ease, max-height 0.35s ease;
    }
    .dn-solution-content.dn-hidden {
      filter: blur(10px);
      -webkit-filter: blur(10px);
      opacity: 0.12;
      user-select: none;
      -webkit-user-select: none;
      pointer-events: none;
      max-height: 95px;
      overflow: hidden;
    }
    .dn-solution-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1.5px dashed rgba(245, 158, 11, 0.55);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      transition: opacity 0.28s ease, visibility 0.28s;
    }
    .dn-solution-overlay.dn-revealed {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .dn-solution-btn {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 8px 22px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #0f172a;
      border: none;
      border-radius: 999px;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.45);
      transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.18s ease;
      font-family: inherit;
      letter-spacing: 0.2px;
    }
    .dn-solution-btn:hover {
      transform: scale(1.04);
      box-shadow: 0 6px 22px rgba(245, 158, 11, 0.65);
      color: #020617;
    }
    .dn-solution-btn:active {
      transform: scale(0.98);
    }
    .dn-solution-toggle-bar {
      padding: 6px 14px 10px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(0, 0, 0, 0.15);
    }
    .dn-solution-mini-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 999px;
      color: #fbbf24;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.18s ease;
      font-family: inherit;
    }
    .dn-solution-mini-btn:hover {
      background: rgba(245, 158, 11, 0.2);
      border-color: rgba(245, 158, 11, 0.5);
      color: #fef3c7;
    }

    /* ─── İnteraktif Şıklar (A, B, C, D, E) ──────────────────── */
    .dn-choices-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 14px 0 18px;
    }
    /* Kısa şıklar için yatay akış desteği */
    .dn-choices-container.dn-choices-inline {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 10px;
    }
    .dn-choices-container.dn-choices-inline .dn-choice-btn {
      flex: 1 1 calc(20% - 10px);
      min-width: 90px;
    }
    @media (max-width: 640px) {
      .dn-choices-container.dn-choices-inline .dn-choice-btn {
        flex: 1 1 calc(33.333% - 10px);
      }
    }
    @media (max-width: 480px) {
      .dn-choices-container.dn-choices-inline .dn-choice-btn {
        flex: 1 1 calc(50% - 10px);
      }
    }

    .dn-choice-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 44px;
      padding: 8px 14px;
      border: 1.5px solid rgba(59, 130, 246, 0.22);
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: #e2e8f0;
      font-size: 15px;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.22, 0.75, 0.25, 1);
      text-align: left;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    .dn-choice-btn:hover {
      border-color: rgba(59, 130, 246, 0.6);
      background: rgba(59, 130, 246, 0.12);
      transform: translateX(3px);
    }
    .dn-choices-container.dn-choices-inline .dn-choice-btn:hover {
      transform: translateY(-2px);
    }

    /* Seçilmiş Şık (Naif ve Belirgin) */
    .dn-choice-btn.dn-selected {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.14);
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.35), 0 4px 16px rgba(56, 189, 248, 0.2);
      color: #ffffff;
    }
    .dn-choice-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      font-size: 13.5px;
      font-weight: 800;
      display: grid;
      place-items: center;
      flex: 0 0 28px;
      border: 1.5px solid rgba(59, 130, 246, 0.45);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
      transition: all 0.18s ease;
    }
    .dn-choice-btn:hover .dn-choice-badge {
      border-color: #60a5fa;
      color: #ffffff;
      background: rgba(59, 130, 246, 0.35);
    }
    .dn-choice-btn.dn-selected .dn-choice-badge {
      background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
      color: #0f172a;
      border-color: #bae6fd;
      box-shadow: 0 2px 10px rgba(56, 189, 248, 0.55);
      transform: scale(1.05);
    }
    .dn-choice-text {
      flex: 1 1 auto;
      line-height: 1.45;
      font-weight: 500;
      word-break: break-word;
    }
  `;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────────────────────────────
     4. ARKA PLAN RENGİ UYGULA
  ───────────────────────────────────────────────────────────────── */
  function applyBgColor() {
    try {
      const saved = localStorage.getItem('dn.bgColor');
      if (saved && BG_COLORS[saved]) {
        document.body.style.backgroundColor = BG_COLORS[saved];
      }
    } catch (e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     5. YAYINEVİ İSİMLERİNİ TEMİZLE
  ───────────────────────────────────────────────────────────────── */
  function cleanPublisherNames() {
    const pat = new RegExp(
      YAYINEVLERI.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
      'gi'
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
        if (['script', 'style', 'noscript'].includes(tag)) return;
        Array.from(node.childNodes).forEach(walk);
      }
    }
    if (document.body) walk(document.body);
  }

  /* ─────────────────────────────────────────────────────────────────
     6. ÇÖZÜM ALANLARINI GİZLE & "💡 ÇÖZÜMÜ GÖSTER" EKLE
  ───────────────────────────────────────────────────────────────── */
  function hideSolutions() {
    // 1. Sınıf tabanlı olanları hemen sar
    const selectors = [
      '.cozum', '.solution', '.cevap-alani', '.answer-box',
      '.answer-key', '.answer', '.cozum-kutusu', '.cozum-alani'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(wrapSolutionElement);

    // 2. Metin tabanlı arama
    // Çözüm başlangıç desenleri
    const cozumHeaderRe = /^(?:Örnek\s+)?(?:ÇÖZÜM|Çözüm|COZUM|Cozum)\s*[:\-–]/i;
    // Cevap satırı desenleri
    const cevapLineRe = /^(?:DOĞRU\s+)?(?:CEVAP|Cevap|YANIT|Yanıt)\s*[:\-–]?\s*[A-E]?\b/i;
    // Soru / Yeni blok durdurucu desenler (çözüm bloğunu aşırı genişletmemek için)
    const blockStopRe = /^(?:Örnek\s+Soru|Soru\s*\d+|Soru\s*:|\d+\.|\([A-E]\)|[A-E]\))/i;

    const candidates = Array.from(
      document.querySelectorAll('p, div, blockquote, li, .quote-box-note, .sub-title-desc')
    );

    candidates.forEach(el => {
      if (el.closest('.dn-solution-wrapper') || el.classList.contains('dn-solution-content')) return;
      if (el.children.length > 5) return; // Karmaşık konteynerları atla

      const txt = el.textContent.trim();
      if (!cozumHeaderRe.test(txt) && !cevapLineRe.test(txt)) return;

      // Eğer tek başına veya ilk çözüm satırıysa
      const group = [el];
      let next = el.nextElementSibling;
      let count = 0;

      // Ardışık kardeşleri tara ve mantıklı olanları çözüme dahil et
      while (next && count < 8) {
        if (next.closest('.dn-solution-wrapper') || next.classList.contains('dn-solution-content')) break;

        const nextTag = next.tagName.toLowerCase();
        if (['h1', 'h2', 'h3', 'h4', 'hr', 'table'].includes(nextTag)) break;
        if (next.classList.contains('sub-title-banner') || next.classList.contains('dn-choices-container')) break;

        const ntxt = next.textContent.trim();
        if (blockStopRe.test(ntxt)) break; // Yeni bir soru veya şık başladıysa dur

        // Eğer cevap satırıysa, onu da al ve sonra durdur
        if (cevapLineRe.test(ntxt)) {
          group.push(next);
          break;
        }

        // Açıklama paragrafları (çözümün devamı niteliğindeki paragraflar)
        if (cozumHeaderRe.test(txt) && ntxt.length > 0 && ntxt.length < 600) {
          group.push(next);
          next = next.nextElementSibling;
          count++;
        } else {
          break;
        }
      }

      if (group.length === 1) {
        wrapSolutionElement(el);
      } else {
        wrapSolutionGroup(group);
      }
    });

    // 3. İzole kalmış "Cevap: X" veya "Doğru Cevap: X" satırları
    document.querySelectorAll('p, div, li, span').forEach(el => {
      if (el.closest('.dn-solution-wrapper') || el.classList.contains('dn-solution-content')) return;
      const t = el.textContent.trim();
      if (cevapLineRe.test(t) && t.length < 160) {
        wrapSolutionElement(el);
      }
    });
  }

  function wrapSolutionElement(el) {
    if (el.closest('.dn-solution-wrapper') || el.classList.contains('dn-solution-content')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'dn-solution-wrapper';

    el.classList.add('dn-solution-content', 'dn-hidden');

    const overlay = document.createElement('div');
    overlay.className = 'dn-solution-overlay';
    overlay.innerHTML = `
      <button class="dn-solution-btn" type="button">
        <span>💡</span><span>Çözümü Göster</span>
      </button>
    `;

    const toggleBar = document.createElement('div');
    toggleBar.className = 'dn-solution-toggle-bar';
    toggleBar.style.display = 'none';
    toggleBar.innerHTML = `
      <button class="dn-solution-mini-btn" type="button">
        <span>🙈</span><span>Çözümü Gizle</span>
      </button>
    `;

    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(overlay);
    wrapper.appendChild(el);
    wrapper.appendChild(toggleBar);

    overlay.querySelector('.dn-solution-btn').addEventListener('click', () => {
      el.classList.remove('dn-hidden');
      overlay.classList.add('dn-revealed');
      toggleBar.style.display = 'flex';
    });

    toggleBar.querySelector('.dn-solution-mini-btn').addEventListener('click', () => {
      el.classList.add('dn-hidden');
      overlay.classList.remove('dn-revealed');
      toggleBar.style.display = 'none';
    });
  }

  function wrapSolutionGroup(elements) {
    if (!elements || !elements.length) return;
    const first = elements[0];
    if (first.closest('.dn-solution-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'dn-solution-wrapper';

    const content = document.createElement('div');
    content.className = 'dn-solution-content dn-hidden';

    const overlay = document.createElement('div');
    overlay.className = 'dn-solution-overlay';
    overlay.innerHTML = `
      <button class="dn-solution-btn" type="button">
        <span>💡</span><span>Çözümü Göster</span>
      </button>
    `;

    const toggleBar = document.createElement('div');
    toggleBar.className = 'dn-solution-toggle-bar';
    toggleBar.style.display = 'none';
    toggleBar.innerHTML = `
      <button class="dn-solution-mini-btn" type="button">
        <span>🙈</span><span>Çözümü Gizle</span>
      </button>
    `;

    first.parentNode.insertBefore(wrapper, first);
    wrapper.appendChild(overlay);
    wrapper.appendChild(content);
    wrapper.appendChild(toggleBar);

    elements.forEach(el => {
      el.classList.add('dn-solution-inner');
      content.appendChild(el);
    });

    overlay.querySelector('.dn-solution-btn').addEventListener('click', () => {
      content.classList.remove('dn-hidden');
      overlay.classList.add('dn-revealed');
      toggleBar.style.display = 'flex';
    });

    toggleBar.querySelector('.dn-solution-mini-btn').addEventListener('click', () => {
      content.classList.add('dn-hidden');
      overlay.classList.remove('dn-revealed');
      toggleBar.style.display = 'none';
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     7. ETKİLEŞİMLİ A-B-C-D-E ŞIKLARI (Inline Split & Multi-line Destekli)
  ───────────────────────────────────────────────────────────────── */

  // Şık harfi yakalama: "A)", "(A)", "A.", "A - "
  const CHOICE_START_RE = /^[(\s]*([A-E])[)\s.\-]\s*(.*)$/i;

  // Tek satırda yan yana şıkları ayıklamak için regex
  // Örnek: "A) II-IV   B) III-IV   C) II-V   D) I-III   E) I-II"
  const INLINE_CHOICES_FINDER = /(?:^|[\s\t]+)(?:\(?([A-E])[)\.\-]\s*)([^\n]+?)(?=(?:[\s\t]+(?:\(?[A-E][)\.\-]\s*))|$)/gi;

  function makeInteractiveChoices() {
    // A. ÖNCE TEK SATIRDA YAN YANA YAZILMIŞ ŞIKLARI TESPİT ET VE DÖNÜŞTÜR
    splitInlineChoices();

    // B. ARDIŞIK ELEMENTLER HALİNDEKİ ŞIKLARI TESPİT ET VE DÖNÜŞTÜR
    groupSequentialChoices();
  }

  /**
   * Tek bir element (<p>, <div>, <li> vb.) içindeki yan yana şıkları ayıklar.
   * Örn: "A) I  B) II  C) III  D) IV  E) V"
   */
  function splitInlineChoices() {
    const candidates = document.querySelectorAll(
      '.page p, .page div, body p, body div, li, td, th'
    );

    candidates.forEach(el => {
      if (el.closest('.dn-choices-container') || el.closest('.dn-solution-wrapper')) return;
      if (el.children.length > 2) return; // Çok karmaşık alt elementli blokları atla

      const raw = el.textContent.trim();
      if (!raw || raw.length < 6) return;

      // En az A ve B veya birden fazla şık harfi sırayla geçiyor mu?
      const matches = [];
      let m;
      INLINE_CHOICES_FINDER.lastIndex = 0;
      while ((m = INLINE_CHOICES_FINDER.exec(raw)) !== null) {
        matches.push({
          letter: m[1].toUpperCase(),
          text: m[2].trim(),
          fullMatch: m[0]
        });
      }

      // En az 2 şık bulunmalı ve harf sıralaması mantıklı olmalı (A ardından B vb.)
      if (matches.length >= 2) {
        const letters = matches.map(x => x.letter);
        const hasA = letters.includes('A');
        const hasB = letters.includes('B');

        if (hasA && hasB) {
          // Bu element tek satırda şıklar içeriyor!
          createInlineChoicesContainer(el, matches);
        }
      }
    });
  }

  function createInlineChoicesContainer(originalEl, choiceItems) {
    const parent = originalEl.parentNode;
    if (!parent) return;

    const container = document.createElement('div');
    container.className = 'dn-choices-container';

    // Şıkların metin uzunluğuna göre inline flex sınıfı ekle
    const maxLen = Math.max(...choiceItems.map(c => c.text.length));
    if (maxLen <= 25) {
      container.classList.add('dn-choices-inline');
    }

    let selectedBtn = null;

    choiceItems.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dn-choice-btn';
      btn.innerHTML = `
        <span class="dn-choice-badge">${item.letter}</span>
        <span class="dn-choice-text">${item.text}</span>
      `;

      btn.addEventListener('click', () => {
        if (selectedBtn === btn) {
          btn.classList.remove('dn-selected');
          selectedBtn = null;
        } else {
          if (selectedBtn) selectedBtn.classList.remove('dn-selected');
          btn.classList.add('dn-selected');
          selectedBtn = btn;
        }
      });

      container.appendChild(btn);
    });

    parent.insertBefore(container, originalEl);
    originalEl.remove();
  }

  /**
   * Ayrı paragraflar halindeki ardışık şıkları (A, B, C, D, E) gruplar.
   */
  function groupSequentialChoices() {
    document.querySelectorAll('.page, body, main, .content').forEach(container => {
      const items = Array.from(container.querySelectorAll('p, li, div, .culture-item'));
      let currentGroup = [];
      let lastParent = null;

      function flush() {
        if (currentGroup.length >= 2) {
          // Harf sırasını kontrol et (en az A ve B olmalı)
          const letters = currentGroup.map(el => {
            const m = el.textContent.trim().match(CHOICE_START_RE);
            return m ? m[1].toUpperCase() : '';
          });

          if (letters[0] === 'A' && letters[1] === 'B') {
            convertSequentialGroupToChoices(currentGroup);
          }
        }
        currentGroup = [];
        lastParent = null;
      }

      items.forEach(item => {
        if (item.closest('.dn-choices-container') || item.closest('.dn-solution-wrapper')) return;

        const text = item.textContent.trim();
        const match = text.match(CHOICE_START_RE);

        if (match && (lastParent === null || lastParent === item.parentNode)) {
          // Sıralı şık harfi kontrolü (A -> B -> C -> D -> E)
          const letter = match[1].toUpperCase();
          const expectedLetter = currentGroup.length === 0 ? 'A' : String.fromCharCode(65 + currentGroup.length);

          if (letter === expectedLetter || currentGroup.length > 0) {
            currentGroup.push(item);
            lastParent = item.parentNode;
          } else {
            flush();
            if (letter === 'A') {
              currentGroup.push(item);
              lastParent = item.parentNode;
            }
          }
        } else {
          flush();
          if (match && match[1].toUpperCase() === 'A') {
            currentGroup.push(item);
            lastParent = item.parentNode;
          }
        }
      });
      flush();
    });
  }

  function convertSequentialGroupToChoices(group) {
    if (!group || !group.length) return;
    const parent = group[0].parentNode;
    const ref = group[0];

    const container = document.createElement('div');
    container.className = 'dn-choices-container';

    // Şıkların metin uzunlukları kısaysa inline yap
    const parsed = group.map(el => {
      const text = el.textContent.trim();
      const match = text.match(CHOICE_START_RE);
      return {
        el,
        letter: match ? match[1].toUpperCase() : '',
        bodyText: match ? match[2].trim() : text
      };
    });

    const maxLen = Math.max(...parsed.map(p => p.bodyText.length));
    if (maxLen <= 25 && parsed.length >= 3) {
      container.classList.add('dn-choices-inline');
    }

    let selectedBtn = null;

    parsed.forEach(({ el, letter, bodyText }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dn-choice-btn';
      btn.innerHTML = `
        <span class="dn-choice-badge">${letter}</span>
        <span class="dn-choice-text">${bodyText}</span>
      `;

      btn.addEventListener('click', () => {
        if (selectedBtn === btn) {
          btn.classList.remove('dn-selected');
          selectedBtn = null;
        } else {
          if (selectedBtn) selectedBtn.classList.remove('dn-selected');
          btn.classList.add('dn-selected');
          selectedBtn = btn;
        }
      });

      container.appendChild(btn);
      el.remove();
    });

    parent.insertBefore(container, ref);
  }

  /* ─────────────────────────────────────────────────────────────────
     8. BAŞLAT
  ───────────────────────────────────────────────────────────────── */
  function init() {
    try {
      applyBgColor();
      cleanPublisherNames();
      hideSolutions();
      makeInteractiveChoices();
    } catch (err) {
      console.warn('[enhancements.js] Başlatma sırasında hata oluştu:', err);
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
