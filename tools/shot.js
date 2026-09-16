const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const dir = path.resolve(__dirname, '..');
  const url = 'file:///' + path.join(dir, 'index.html').replace(/\\/g, '/');
  const explicit = process.env.CHROME_EXE;
  const browser = await chromium.launch(
    explicit && require('fs').existsSync(explicit) ? { executablePath: explicit } : {}
  );
  const errors = [];

  const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(dir, 'tools', 'shot-01-dark.png') });

  const info = await page.evaluate(() => ({
    subjects: document.querySelectorAll('#subjectList .sub').length,
    segs: document.querySelectorAll('#subjectSeg .chip').length,
    thumbs: document.querySelectorAll('.thumb').length,
    title: document.querySelector('#subjTitle').textContent,
    total: document.querySelector('#pageTotal').textContent,
    imgLoaded: document.querySelector('#paper img') ? document.querySelector('#paper img').naturalWidth : 0,
    paperW: document.querySelector('#paper').getBoundingClientRect().width,
    zoom: document.querySelector('#zoomVal').textContent,
    loaded: document.querySelector('#paper').classList.contains('loaded'),
  }));
  console.log('INIT', JSON.stringify(info));

  // sayfa ilerlet
  await page.click('#nextBtn');
  await page.waitForTimeout(900);
  const p2 = await page.evaluate(() => ({
    input: document.querySelector('#pageInput').value,
    active: document.querySelectorAll('.thumb.on').length,
    progress: document.querySelector('#progressBar').style.width,
  }));
  console.log('NEXT', JSON.stringify(p2));
  await page.screenshot({ path: path.join(dir, 'tools', 'shot-02-page2.png') });

  // turkce'ye gec
  await page.click('#subjectList .sub:nth-child(2)');
  await page.waitForTimeout(1400);
  const p3 = await page.evaluate(() => ({
    title: document.querySelector('#subjTitle').textContent,
    total: document.querySelector('#pageTotal').textContent,
    accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    thumbs: document.querySelectorAll('.thumb').length,
  }));
  console.log('SUBJECT2', JSON.stringify(p3));
  await page.screenshot({ path: path.join(dir, 'tools', 'shot-03-turkce.png') });

  // cift sayfa
  await page.click('#btnSpread');
  await page.waitForTimeout(1500);
  const p4 = await page.evaluate(() => ({
    imgs: document.querySelectorAll('#paper img').length,
    paperW: document.querySelector('#paper').getBoundingClientRect().width,
    on: document.querySelectorAll('.thumb.on').length,
  }));
  console.log('SPREAD', JSON.stringify(p4));
  await page.screenshot({ path: path.join(dir, 'tools', 'shot-04-spread.png') });

  // aydinlik tema
  await page.click('#btnSpread');
  await page.waitForTimeout(600);
  await page.click('#btnTheme');
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(dir, 'tools', 'shot-05-light.png') });
  console.log('THEME', await page.evaluate(() => document.documentElement.dataset.theme));

  // zoom testi
  await page.click('#zoomIn');
  await page.click('#zoomIn');
  await page.waitForTimeout(600);
  console.log('ZOOM', await page.evaluate(() => document.querySelector('#zoomVal').textContent));
  await page.screenshot({ path: path.join(dir, 'tools', 'shot-06-zoom.png') });

  // mobil
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  m.on('pageerror', e => errors.push('MOBILE PAGEERROR: ' + e.message));
  await m.goto(url, { waitUntil: 'load' });
  await m.waitForTimeout(1600);
  await m.screenshot({ path: path.join(dir, 'tools', 'shot-07-mobile.png') });
  console.log('MOBILE', JSON.stringify(await m.evaluate(() => ({
    sideHidden: document.body.classList.contains('no-side'),
    imgLoaded: document.querySelector('#paper img').naturalWidth,
  }))));

  console.log('ERRORS', errors.length ? JSON.stringify(errors, null, 1) : 'none');
  await browser.close();
})();
