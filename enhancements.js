/**
 * ders-notlari — enhancements.js (Optimize Edilmiş Sürüm)
 * KPSS Eğitim Platformu:
 *   1. Şık Seçimi ve İnteraktivite (A, B, C, D, E) - Geri bildirim, toggle, tam görünürlük
 *   2. "Çözümü Göster / Gizle" Akordeon Mantığı - Sadece ÖRNEK/SORU içinde, yumuşak CSS grid transition
 *   3. Bilgi Kutuları Koruması (KRİTİK) - BUNU SAKIN UNUTMA, DİKKAT, BİL BAKALIM asla gizlenmez
 *   4. Event Delegation - 3 mod arası geçişte ve DOM değişimlerinde kalıcı çalışan mimari
 *   5. Yayınevi temizliği ve Tema senkronizasyonu
 */

(function () {
  'use strict';

  /* ── 0. Yayınevleri ve Renk Tanımları ────────────────────────── */
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

  const BG_COLORS = {
    'default': null, 'pastel-blue': '#0b1d33', 'soft-beige': '#131a2b',
    'classic-gray': '#0d1422', 'night-blue': '#0f172a'
  };

  /* ── 1. CSS ENJEKSİYONU ───────────────────────────────────────── */
  const STYLE_ID = 'dn-enhancements-style';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* ============================================================
         1. BİLGİ VE UYARI KUTULARI (MUTLAK KORUMA - ASLA GİZLENEMEZ)
         ============================================================ */
      .info-box, .alert, .dikkat, .note-callout, .card-box, .quote-box-note,
      .trick, .bil-bakalim, .unutma, [data-info-box], .box-info,
      .highlight-quote, .sub-title-banner {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        filter: none !important;
        -webkit-filter: none !important;
        max-height: none !important;
        pointer-events: auto !important;
        user-select: auto !important;
      }

      /* ============================================================
         2. ŞIK KAPSAYICI VE BUTONLARI (DAİMA GÖRÜNÜR, İNTERAKTİF)
         ============================================================ */
      .dn-choices-container {
        display: flex !important;
        flex-direction: column;
        gap: 7px;
        margin: 12px 0 16px;
        visibility: visible !important;
        opacity: 1 !important;
        width: 100%;
      }
      .dn-choices-container.dn-inline {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 8px;
      }
      .dn-choices-container.dn-inline .dn-choice-btn {
        flex: 1 1 calc(50% - 8px);
        min-width: 120px;
      }

      .dn-choice-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14.5px;
        font-family: inherit;
        line-height: 1.45;
        padding: 8px 14px;
        min-height: 42px;
        border: 1px solid rgba(99, 155, 255, 0.25);
        border-radius: 9px;
        background: rgba(30, 45, 80, 0.3);
        color: inherit;
        cursor: pointer;
        text-align: left;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        transition: border-color 0.18s ease, background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease;
      }

      @media (hover: hover) {
        .dn-choice-btn:hover {
          border-color: rgba(99, 155, 255, 0.7);
          background: rgba(59, 130, 246, 0.15);
          transform: translateX(3px);
        }
        .dn-choices-container.dn-inline .dn-choice-btn:hover {
          transform: translateY(-2px);
        }
      }

      .dn-choice-btn:active {
        transform: scale(0.985);
      }

      /* Şık Harf Rozeti */
      .dn-choice-badge {
        flex: 0 0 24px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1px solid rgba(99, 155, 255, 0.5);
        background: rgba(59, 130, 246, 0.15);
        color: #93c5fd;
        font-size: 12px;
        font-weight: 800;
        display: grid;
        place-items: center;
        transition: all 0.18s ease;
      }

      .dn-choice-text {
        flex: 1 1 auto;
        word-break: break-word;
      }

      /* Seçilmiş Şık (.selected / .dn-selected) */
      .dn-choice-btn.selected,
      .dn-choice-btn.dn-selected {
        border-color: #38bdf8 !important;
        background: rgba(56, 189, 248, 0.18) !important;
        box-shadow: 0 0 0 1.5px rgba(56, 189, 248, 0.4) !important;
        color: #f0f9ff !important;
      }
      .dn-choice-btn.selected .dn-choice-badge,
      .dn-choice-btn.dn-selected .dn-choice-badge {
        background: #38bdf8 !important;
        border-color: #bae6fd !important;
        color: #0c4a6e !important;
      }

      /* Doğru Şık (.correct) */
      .dn-choice-btn.correct {
        border-color: #22c55e !important;
        background: rgba(34, 197, 94, 0.18) !important;
        box-shadow: 0 0 0 1.5px rgba(34, 197, 94, 0.45) !important;
        color: #f0fdf4 !important;
      }
      .dn-choice-btn.correct .dn-choice-badge {
        background: #22c55e !important;
        border-color: #86efac !important;
        color: #052e16 !important;
      }

      /* Yanlış Şık (.wrong) */
      .dn-choice-btn.wrong {
        border-color: #ef4444 !important;
        background: rgba(239, 68, 68, 0.18) !important;
        box-shadow: 0 0 0 1.5px rgba(239, 68, 68, 0.45) !important;
        color: #fef2f2 !important;
      }
      .dn-choice-btn.wrong .dn-choice-badge {
        background: #ef4444 !important;
        border-color: #fca5a5 !important;
        color: #450a0a !important;
      }

      /* ============================================================
         3. ÇÖZÜMÜ GÖSTER / GİZLE (YUMUŞAK AKORDEON DÖNÜŞÜMÜ)
         ============================================================ */
      .dn-solution-wrapper {
        margin: 14px 0;
        border-radius: 12px;
        border: 1px solid rgba(245, 158, 11, 0.3);
        background: rgba(15, 23, 42, 0.45);
        overflow: hidden;
        transition: border-color 0.25s ease, box-shadow 0.25s ease;
      }
      .dn-solution-wrapper.is-open {
        border-color: rgba(245, 158, 11, 0.65);
        box-shadow: 0 4px 18px rgba(245, 158, 11, 0.12);
      }

      .dn-solution-toggle-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        background: rgba(245, 158, 11, 0.12);
        color: #fbbf24;
        border: none;
        border-bottom: 1px solid transparent;
        font-family: inherit;
        font-size: 13.5px;
        font-weight: 700;
        cursor: pointer;
        user-select: none;
        transition: background 0.2s ease, color 0.2s ease;
      }
      .dn-solution-toggle-btn:hover {
        background: rgba(245, 158, 11, 0.2);
        color: #fef3c7;
      }
      .dn-solution-wrapper.is-open .dn-solution-toggle-btn {
        border-bottom-color: rgba(245, 158, 11, 0.2);
      }

      .dn-toggle-left {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .dn-toggle-icon {
        font-size: 15px;
      }
      .dn-toggle-chevron {
        font-size: 11px;
        transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .dn-solution-wrapper.is-open .dn-toggle-chevron {
        transform: rotate(180deg);
      }

      /* CSS Grid bazlı sıfır sarsıntılı yükseklik animasyonu */
      .dn-solution-collapse {
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        visibility: hidden;
        transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    opacity 0.25s ease,
                    visibility 0.25s ease;
      }
      .dn-solution-wrapper.is-open .dn-solution-collapse {
        grid-template-rows: 1fr;
        opacity: 1;
        visibility: visible;
      }

      .dn-solution-inner {
        overflow: hidden;
        min-height: 0;
        padding: 0 16px;
        line-height: 1.6;
        font-size: 14px;
        color: #e2e8f0;
        transition: padding 0.3s ease;
      }
      .dn-solution-wrapper.is-open .dn-solution-inner {
        padding: 14px 16px;
      }
    `;
    document.head.appendChild(style);
  }

  /* ── 2. Filtreleme ve Güvenlik Fonksiyonları (KRİTİK) ─────────── */

  // Bilgi kutuları seçicisi (asla soru veya çözüm olarak algılanamaz)
  const INFO_BOX_SELECTORS = [
    '.info-box', '.alert', '.dikkat', '.note-callout', '.card-box',
    '.quote-box-note', '.trick', '.bil-bakalim', '.unutma',
    '[data-info-box]', '.box-info', '.highlight-quote', '.sub-title-banner',
    '.culture-box', '.header-box'
  ].join(',');

  const INFO_BOX_TEXT_REGEX = /^(?:BUNU\s+SAKIN\s+UNUTMA|DİKKAT|BİL\s+BAKALIM|NOT|ÖNEMLİ|UYARI|HATIRLATMA|PRATİK\s+BİLGİ|KURAL)\b/i;

  function isInfoBox(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    if (el.matches(INFO_BOX_SELECTORS) || el.closest(INFO_BOX_SELECTORS)) {
      return true;
    }
    const txt = (el.innerText || el.textContent || '').trim();
    if (INFO_BOX_TEXT_REGEX.test(txt)) {
      return true;
    }
    return false;
  }

  /* ── 3. Şık Dönüştürme Mantığı (A-E) ─────────────────────────── */
  const CHOICE_START = /^[\s(]*([A-E])[)\s.\-]\s*(.*)$/i;
  const INLINE_FINDER = /(?:^|(?<=\s{2,}))[\s(]*([A-E])[)\.\-]\s*([^\n]*?)(?=(?:\s{2,}[\s(]*[A-E][)\.\-])|$)/gi;

  function makeInteractiveChoices(root = document) {
    splitInlineChoices(root);
    groupSequentialChoices(root);
  }

  function splitInlineChoices(root) {
    const sel = 'p, li, td, th';
    root.querySelectorAll(sel).forEach(el => {
      if (isInfoBox(el)) return;
      if (el.closest('.dn-choices-container') || el.closest('.dn-solution-wrapper')) return;
      if (el.children.length > 2) return;

      const raw = el.textContent.trim();
      if (!raw || raw.length < 8) return;

      const hits = [];
      INLINE_FINDER.lastIndex = 0;
      let m;
      while ((m = INLINE_FINDER.exec(raw)) !== null) {
        hits.push({ letter: m[1].toUpperCase(), text: m[2].trim() });
      }

      if (hits.length < 2) return;
      const letters = hits.map(h => h.letter);
      if (!letters.includes('A') || !letters.includes('B')) return;

      const container = createChoiceContainer(hits, true);
      el.parentNode.insertBefore(container, el);
      el.remove();
    });
  }

  function groupSequentialChoices(root) {
    const contexts = root.querySelectorAll('.page, .dn-question-card, .soru-card, .ornek-card, body, main, section');
    contexts.forEach(ctx => {
      const candidates = Array.from(ctx.querySelectorAll('p, li'));
      let group = [];

      function flush() {
        if (group.length >= 2) {
          const letters = group.map(node => {
            const m = node.textContent.trim().match(CHOICE_START);
            return m ? m[1].toUpperCase() : '';
          });
          if (letters[0] === 'A' && letters[1] === 'B') {
            const parsed = group.map(node => {
              const m = node.textContent.trim().match(CHOICE_START);
              return { letter: m ? m[1].toUpperCase() : '?', text: m ? m[2].trim() : node.textContent.trim() };
            });
            const maxLen = Math.max(...parsed.map(p => p.text.length));
            const isInline = maxLen <= 30 && parsed.length >= 3;
            const container = createChoiceContainer(parsed, isInline);
            group[0].parentNode.insertBefore(container, group[0]);
            group.forEach(n => n.remove());
          }
        }
        group = [];
      }

      candidates.forEach(item => {
        if (isInfoBox(item)) { flush(); return; }
        if (item.closest('.dn-choices-container') || item.closest('.dn-solution-wrapper')) {
          flush();
          return;
        }

        const txt = item.textContent.trim();
        const m = txt.match(CHOICE_START);
        if (!m) { flush(); return; }

        const letter = m[1].toUpperCase();
        const expected = String.fromCharCode(65 + group.length);

        if (letter === expected) {
          group.push(item);
        } else if (letter === 'A') {
          flush();
          group.push(item);
        } else {
          flush();
        }
      });
      flush();
    });
  }

  function createChoiceContainer(items, isInline) {
    const container = document.createElement('div');
    container.className = 'dn-choices-container' + (isInline ? ' dn-inline' : '');
    container.setAttribute('role', 'radiogroup');

    items.forEach(({ letter, text }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dn-choice-btn';
      btn.dataset.choice = letter;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.innerHTML = `
        <span class="dn-choice-badge">${letter}</span>
        <span class="dn-choice-text">${text}</span>
      `;
      container.appendChild(btn);
    });

    return container;
  }

  /* ── 4. Çözüm Bloklarını Gizleme ve Akordeon Yapısı ───────────── */
  const COZUM_RE = /^(?:ÇÖZÜM|Çözüm|COZUM|Cozüm)\s*[:\-–]/i;
  const CEVAP_RE = /^(?:DOĞRU\s+)?(?:CEVAP|Cevap|YANIT|Yanıt)\s*[:\-–]?\s*[A-E]?\b/i;
  const STOP_TAGS = new Set(['H1','H2','H3','H4','HR','TABLE','FIGURE']);

  function hideSolutions(root = document) {
    // 1. Doğrudan sınıf tanımlı çözüm kutuları (bilgi kutuları HARİÇ)
    ['.cozum', '.solution', '.cevap-alani', '.answer-box', '.answer-key'].forEach(sel => {
      root.querySelectorAll(sel).forEach(el => {
        if (isInfoBox(el) || el.closest('.dn-solution-wrapper')) return;
        wrapIntoAccordion(el);
      });
    });

    // 2. Metin tabanlı arama: Yalnızca "Çözüm:" ile başlayan ve bilgi kutusu OLMAYAN elementler
    const candidates = Array.from(root.querySelectorAll('p, div, blockquote, li'));
    candidates.forEach(el => {
      if (isInfoBox(el) || el.closest('.dn-solution-wrapper') || el.closest('.dn-choices-container')) return;
      if (el.children.length > 3) return;

      const txt = el.textContent.trim();
      if (!COZUM_RE.test(txt) || txt.length > 600) return;

      // Çözüm elementi ve hemen ardındaki ilgili açıklama satırlarını topla
      const group = [el];
      let nx = el.nextElementSibling;
      let limit = 0;

      while (nx && limit < 4) {
        if (isInfoBox(nx) || nx.closest('.dn-choices-container')) break;
        if (STOP_TAGS.has(nx.tagName)) break;

        const ntxt = nx.textContent.trim();
        if (/^(?:Örnek|ÖRNEK|Soru|SORU)\b/i.test(ntxt) || /^\d+\s*[\.\)]\s/.test(ntxt)) break;

        if (ntxt.length > 0 && ntxt.length <= 400) {
          group.push(nx);
          nx = nx.nextElementSibling;
          limit++;
        } else {
          break;
        }
      }

      wrapIntoAccordion(group);
    });
  }

  function wrapIntoAccordion(elements) {
    const list = Array.isArray(elements) ? elements : [elements];
    if (!list.length) return;
    const first = list[0];
    if (first.closest('.dn-solution-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'dn-solution-wrapper';

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'dn-solution-toggle-btn';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = `
      <span class="dn-toggle-left">
        <span class="dn-toggle-icon">💡</span>
        <span class="dn-toggle-text">Çözümü Göster</span>
      </span>
      <span class="dn-toggle-chevron">▼</span>
    `;

    const collapse = document.createElement('div');
    collapse.className = 'dn-solution-collapse';
    collapse.setAttribute('aria-hidden', 'true');

    const inner = document.createElement('div');
    inner.className = 'dn-solution-inner';

    first.parentNode.insertBefore(wrapper, first);
    wrapper.appendChild(toggleBtn);
    wrapper.appendChild(collapse);
    collapse.appendChild(inner);

    list.forEach(el => inner.appendChild(el));
  }

  /* ── 5. EVENT DELEGATION (Mod Geçişlerinde Kesintisiz Çalışma) ── */
  function bindGlobalEvents() {
    if (window._dnEventsBound) return;
    window._dnEventsBound = true;

    document.addEventListener('click', function (e) {
      // A) Şık Butonuna Tıklanması
      const choiceBtn = e.target.closest('.dn-choice-btn');
      if (choiceBtn) {
        e.preventDefault();
        e.stopPropagation();

        const container = choiceBtn.closest('.dn-choices-container');
        const questionCard = choiceBtn.closest('.dn-question-card, .soru-card, .ornek-card, [data-correct-answer]');
        const isAlreadySelected = choiceBtn.classList.contains('selected') || choiceBtn.classList.contains('dn-selected');

        // Aynı kapsayıcıdaki diğer tüm şıkları sıfırla
        if (container) {
          container.querySelectorAll('.dn-choice-btn').forEach(btn => {
            btn.classList.remove('selected', 'dn-selected', 'correct', 'wrong');
            btn.setAttribute('aria-checked', 'false');
          });
        }

        // Tıklanan şıkkı aktifleştir (veya tekrar tıklanırsa kaldır)
        if (!isAlreadySelected) {
          choiceBtn.classList.add('selected', 'dn-selected');
          choiceBtn.setAttribute('aria-checked', 'true');

          // Doğru cevap doğrulaması (varsa görsel geri bildirim ver)
          const chosenLetter = choiceBtn.dataset.choice;
          const correctLetter = questionCard ? (questionCard.dataset.correctAnswer || questionCard.dataset.correct) : null;

          if (correctLetter && chosenLetter) {
            if (chosenLetter.toUpperCase() === correctLetter.toUpperCase()) {
              choiceBtn.classList.add('correct');
            } else {
              choiceBtn.classList.add('wrong');
              // Doğru şıkkı da göster
              const correctBtn = container.querySelector(`[data-choice="${correctLetter.toUpperCase()}"]`);
              if (correctBtn) correctBtn.classList.add('correct');
            }
          }
        }
        return;
      }

      // B) "Çözümü Göster / Gizle" Butonuna Tıklanması
      const toggleBtn = e.target.closest('.dn-solution-toggle-btn');
      if (toggleBtn) {
        e.preventDefault();
        e.stopPropagation();

        const wrapper = toggleBtn.closest('.dn-solution-wrapper');
        if (!wrapper) return;

        const isOpen = wrapper.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        const collapse = wrapper.querySelector('.dn-solution-collapse');
        if (collapse) collapse.setAttribute('aria-hidden', isOpen ? 'false' : 'true');

        const textSpan = toggleBtn.querySelector('.dn-toggle-text');
        const iconSpan = toggleBtn.querySelector('.dn-toggle-icon');

        if (textSpan) textSpan.textContent = isOpen ? 'Çözümü Gizle' : 'Çözümü Göster';
        if (iconSpan) iconSpan.textContent = isOpen ? '🙈' : '💡';
        return;
      }
    }, true);
  }

  /* ── 6. Yardımcı İşlevler (Yayınevi & Tema Senkronu) ──────────── */
  function applyBgColor() {
    try {
      const saved = localStorage.getItem('dn.bgColor');
      if (saved && BG_COLORS[saved] && document.body) {
        document.body.style.backgroundColor = BG_COLORS[saved];
      }
    } catch (e) {}
  }

  function cleanPublisherNames(root = document.body) {
    if (!root) return;
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
        if (['script', 'style', 'noscript'].includes(tag)) return;
        Array.from(node.childNodes).forEach(walk);
      }
    }
    walk(root);
  }

  /* ── 7. Yaşam Döngüsü & DOM Observer (Mod Değişimleri İçin) ───── */
  function runEnhancements(target = document) {
    try {
      applyBgColor();
      cleanPublisherNames(target === document ? document.body : target);
      makeInteractiveChoices(target);
      hideSolutions(target);
    } catch (err) {
      console.warn('[DersNotlari] Enhancement hatası:', err);
    }
  }

  // Dışarıdan veya mod geçişlerinde tetiklenebilmesi için global API
  window.DersNotlariEnhancer = {
    init: runEnhancements,
    refresh: () => runEnhancements(document)
  };

  function start() {
    bindGlobalEvents();
    runEnhancements(document);

    // Mod değişimlerinde veya dinamik içerik yüklenmelerinde otomatik render
    let timeout = null;
    const observer = new MutationObserver(mutations => {
      let shouldScan = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          for (const node of m.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE &&
                !node.closest('.dn-solution-wrapper') &&
                !node.closest('.dn-choices-container')) {
              shouldScan = true;
              break;
            }
          }
        }
        if (shouldScan) break;
      }
      if (shouldScan) {
        clearTimeout(timeout);
        timeout = setTimeout(() => runEnhancements(document), 100);
      }
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.addEventListener('storage', e => {
    if (e.key === 'dn.bgColor') applyBgColor();
  });
})();
