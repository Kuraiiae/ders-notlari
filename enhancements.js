/**
 * ders-notlari — enhancements.js
 * Sayfa notları ve genel platform için:
 *   1. Çözüm/Cevap alanlarını gizle -> "💡 Çözümü Göster" butonu
 *   2. Statik A-E şıklarını tıklanabilir hale getir
 *   3. Yayınevi adlarını dinamik olarak DOM'dan temizle
 *   4. localStorage'dan tema ve arka plan rengini senkronize et
 */

(function () {
  'use strict';

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
    'pastel-blue': '#dbeafe',
    'soft-beige': '#fdf6ec',
    'classic-gray': '#f0f2f5',
    'night-blue': '#0f172a'
  };

  /* ─────────────────────────────────────────────────────────────────
     CSS ENJEKSİYONU
  ───────────────────────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* ─── Çözüm / Cevap Gizleme Kutusu ────────────────────────── */
    .dn-solution-wrapper {
      position: relative;
      margin: 14px 0;
      border-radius: 12px;
      overflow: hidden;
    }
    .dn-solution-content {
      transition: filter 0.35s ease, opacity 0.35s ease, max-height 0.4s ease;
    }
    .dn-solution-content.dn-hidden {
      filter: blur(8px);
      opacity: 0.18;
      user-select: none;
      pointer-events: none;
      max-height: 90px;
      overflow: hidden;
    }
    .dn-solution-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 2px dashed #f59e0b;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
      transition: opacity 0.3s ease, visibility 0.3s;
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
      background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
      color: #fff;
      border: none;
      border-radius: 999px;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(124, 58, 237, 0.6);
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      font-family: inherit;
    }
    .dn-solution-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 24px rgba(124, 58, 237, 0.8);
    }
    .dn-solution-toggle-bar {
      margin-top: 6px;
      display: flex;
      justify-content: flex-end;
    }
    .dn-solution-mini-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(124, 92, 255, 0.12);
      border: 1px solid rgba(124, 92, 255, 0.35);
      border-radius: 999px;
      color: #7c5cff;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .dn-solution-mini-btn:hover {
      background: rgba(124, 92, 255, 0.22);
    }

    /* ─── İnteraktif Şıklar (A, B, C, D, E) ──────────────────── */
    .dn-choices-container {
      display: flex;
      flex-direction: column;
      gap: 7px;
      margin: 12px 0 16px;
    }
    .dn-choice-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 14px;
      border: 1.5px solid rgba(124, 92, 255, 0.25);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.85);
      color: #1a1a2e;
      font-size: 16px;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.22, 0.75, 0.25, 1);
      text-align: left;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .dn-choice-btn:hover {
      border-color: #7c5cff;
      background: rgba(124, 92, 255, 0.10);
      transform: translateX(3px);
    }
    .dn-choice-btn.dn-selected {
      border-color: #ef2b3a;
      background: rgba(239, 43, 58, 0.12);
      box-shadow: 0 0 0 2px rgba(239, 43, 58, 0.25);
    }
    .dn-choice-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #7c5cff;
      color: #fff;
      font-size: 13px;
      font-weight: 900;
      display: grid;
      place-items: center;
      flex: 0 0 28px;
      border: 1.5px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      transition: background 0.15s ease;
    }
    .dn-choice-btn.dn-selected .dn-choice-badge {
      background: #ef2b3a;
    }
  `;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────────────────────────────
     ARKA PLAN RENGİ UYGULA
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
     YAYINEVİ İSİMLERİNİ TEMİZLE
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
    walk(document.body);
  }

  /* ─────────────────────────────────────────────────────────────────
     ÇÖZÜM ALANLARINI GİZLE & "💡 ÇÖZÜMÜ GÖSTER" EKLE
  ───────────────────────────────────────────────────────────────── */
  function hideSolutions() {
    // 1. Sınıf tabanlı
    const selectors = ['.cozum', '.solution', '.cevap-alani', '.answer-box', '.answer-key', '.answer'];
    document.querySelectorAll(selectors.join(',')).forEach(wrapSolutionElement);

    // 2. Metin tabanlı arama ("ÇÖZÜM:" veya "Cevap:" ile başlayan veya içeren kutular)
    const textPattern = /(ÇÖZÜM|CEVAP|Çözüm|Cevap)\s*:/i;
    document.querySelectorAll('p, div, blockquote, li, .quote-box-note').forEach(el => {
      if (el.closest('.dn-solution-wrapper') || el.classList.contains('dn-solution-content')) return;
      // Yalnızca yaprak düğümler ya da kısa içerikler
      if (el.children.length > 3) return;
      const t = el.textContent.trim();
      if (textPattern.test(t) && t.length < 900) {
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

    // Overlay butonuna tıklandığında çözümü aç
    overlay.querySelector('.dn-solution-btn').addEventListener('click', () => {
      el.classList.remove('dn-hidden');
      overlay.classList.add('dn-revealed');
      toggleBar.style.display = 'flex';
    });

    // Gizle butonuna tıklandığında tekrar kapat
    toggleBar.querySelector('.dn-solution-mini-btn').addEventListener('click', () => {
      el.classList.add('dn-hidden');
      overlay.classList.remove('dn-revealed');
      toggleBar.style.display = 'none';
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     ÖRNEK SORULARI ETKİLEŞİMLİ ŞIKLARA DÖNÜŞTÜR
  ───────────────────────────────────────────────────────────────── */
  function makeInteractiveChoices() {
    const CHOICE_RE = /^[(\s]*([A-E])[)\s.]\s*/i;

    document.querySelectorAll('.page, body, main').forEach(container => {
      const children = Array.from(container.querySelectorAll('p, li, .culture-item'));
      let currentGroup = [];
      let lastParent = null;

      function flush() {
        if (currentGroup.length >= 3) {
          convertGroupToChoices(currentGroup);
        }
        currentGroup = [];
        lastParent = null;
      }

      children.forEach(item => {
        if (item.closest('.dn-choices-container') || item.closest('.dn-solution-wrapper')) return;
        const text = item.textContent.trim();
        const match = text.match(CHOICE_RE);

        if (match && (lastParent === null || lastParent === item.parentNode)) {
          currentGroup.push(item);
          lastParent = item.parentNode;
        } else {
          flush();
          if (match) {
            currentGroup.push(item);
            lastParent = item.parentNode;
          }
        }
      });
      flush();
    });
  }

  function convertGroupToChoices(group) {
    const parent = group[0].parentNode;
    const ref = group[0];

    const container = document.createElement('div');
    container.className = 'dn-choices-container';

    let selectedBtn = null;

    group.forEach(el => {
      const text = el.textContent.trim();
      const match = text.match(/^[(\s]*([A-E])[)\s.]\s*/i);
      if (!match) return;

      const letter = match[1].toUpperCase();
      const bodyText = text.slice(match[0].length).trim();

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
     ÇALIŞTIR
  ───────────────────────────────────────────────────────────────── */
  function init() {
    applyBgColor();
    cleanPublisherNames();
    hideSolutions();
    makeInteractiveChoices();
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
