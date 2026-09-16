const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const dir = path.resolve(__dirname, '..');
  const url = 'file:///' + path.join(dir, 'oku.html').replace(/\\/g, '/');
  const explicit = process.env.CHROME_EXE;
  const browser = await chromium.launch(
    explicit && require('fs').existsSync(explicit) ? { executablePath: explicit } : {}
  );
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  console.log('INIT', JSON.stringify(await page.evaluate(() => ({
    pages: document.querySelectorAll('.page').length,
    subs: document.querySelectorAll('#subjectList .sub').length,
    title: document.querySelector('#subjTitle').textContent,
    resume: !document.querySelector('#resumeBtn').hidden,
    firstImg: document.querySelector('.page img').naturalWidth || 0,
  }))));
  await page.screenshot({ path: path.join(dir, 'tools', 'shot-oku-01.png') });

  // asagi kaydir: tembel yukleme calisiyor mu?
  await page.evaluate(() => document.querySelector('.page[data-n="8"]').scrollIntoView());
  await page.waitForTimeout(1500);
  console.log('SCROLL', JSON.stringify(await page.evaluate(() => ({
    loaded: Array.from(document.querySelectorAll('.page img')).filter(i => i.naturalWidth > 0).length,
    current: document.querySelector('#tailInfo').textContent,
  }))));
  await page.screenshot({ path: path.join(dir, 'tools', 'shot-oku-02-scroll.png') });

  // sepya kagit
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('#paperSeg .chip[data-paper="sepya"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(dir, 'tools', 'shot-oku-03-sepya.png') });

  // ayrac ekle (gorunur ilk sayfa)
  await page.evaluate(() => document.querySelector('.page[data-n="1"]').scrollIntoView());
  await page.waitForTimeout(400);
  await page.click('.page[data-n="1"] .mk');
  await page.waitForTimeout(400);
  console.log('BOOKMARK', JSON.stringify(await page.evaluate(() => ({
    bms: document.querySelectorAll('#bmList .bm').length,
    stored: localStorage.getItem('oku.ayrac.turkce'),
  }))));
  await page.screenshot({ path: path.join(dir, 'tools', 'shot-oku-04-ayrac.png') });

  console.log('ERRORS', errors.length ? JSON.stringify(errors, null, 1) : 'none');
  await browser.close();
})();
