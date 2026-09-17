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

  // konu ozeti: sayfa basi karti + cekmece
  console.log('INTRO', JSON.stringify(await page.evaluate(() => {
    const c = document.querySelector('.intro-card');
    return { var: !!c, baslik: c ? c.querySelector('h4').textContent : '',
             ozBtn: !document.querySelector('#btnOzet').hidden,
             maddeler: c ? c.querySelectorAll('li').length : 0 };
  })));
  await page.click('#btnOzet');
  await page.waitForTimeout(700);
  console.log('DRAWER', JSON.stringify(await page.evaluate(() => ({
    acik: document.querySelector('#ozDrawer').classList.contains('show'),
    bolumler: document.querySelectorAll('#ozBody details.oz').length,
    madde: document.querySelectorAll('#ozBody li').length,
    not: document.querySelectorAll('#ozBody .trick').length,
    baslik: document.querySelector('#ozTitle').textContent,
    sub: document.querySelector('#ozSub').textContent,
    scroll: document.querySelector('#ozBody').scrollHeight,
  }))));
  await page.screenshot({ path: path.join(dir, 'tools', 'shot-oku-05-ozet.png') });
  await page.click('#ozAll');
  await page.waitForTimeout(300);
  console.log('TOGGLE', await page.evaluate(() => document.querySelector('#ozAll').textContent));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  console.log('ESC', JSON.stringify(await page.evaluate(() => ({
    acik: document.querySelector('#ozDrawer').classList.contains('show'),
    gizli: document.querySelector('#ozDrawer').hidden,
  }))));

  // baska derse gecince ozet dugmesi gizlenmeli
  await page.click('#subjectSeg .chip[data-key="tarih"]');
  await page.waitForTimeout(900);
  console.log('DERS', JSON.stringify(await page.evaluate(() => ({
    ozBtn: !document.querySelector('#btnOzet').hidden,
    intro: !!document.querySelector('.intro-card'),
    baslik: document.querySelector('#subjTitle').textContent,
  }))));
  await page.click('#subjectSeg .chip[data-key="turkce"]');
  await page.waitForTimeout(700);

  // telefon: 390x844
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  mob.on('pageerror', e => errors.push('MOB-PAGEERROR: ' + e.message));
  await mob.goto(url, { waitUntil: 'load' });
  await mob.waitForTimeout(2200);
  console.log('MOBIL', JSON.stringify(await mob.evaluate(() => ({
    intro: !!document.querySelector('.intro-card'),
    yatayKaydirma: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ozBtn: document.querySelector('#btnOzet').getBoundingClientRect().width,
  }))));
  await mob.screenshot({ path: path.join(dir, 'tools', 'shot-oku-06-mobil.png') });
  await mob.click('#btnOzet');
  await mob.waitForTimeout(700);
  await mob.screenshot({ path: path.join(dir, 'tools', 'shot-oku-07-mobil-ozet.png') });
  await mob.close();

  // bagimsiz ozet sayfasi
  const oz = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  oz.on('pageerror', e => errors.push('OZ-PAGEERROR: ' + e.message));
  await oz.goto('file:///' + path.join(dir, 'turkce-ozet.html').replace(/\\/g, '/'),
                { waitUntil: 'load' });
  await oz.waitForTimeout(900);
  console.log('SAYFA', JSON.stringify(await oz.evaluate(() => ({
    baslik: document.querySelector('h1').textContent,
    bolumler: document.querySelectorAll('section.oz').length,
    madde: document.querySelectorAll('li').length,
    trick: document.querySelectorAll('.trick').length,
    yatayKaydirma: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))));
  await oz.screenshot({ path: path.join(dir, 'tools', 'shot-oku-08-ozet-sayfa.png') });
  await oz.close();

  console.log('ERRORS', errors.length ? JSON.stringify(errors, null, 1) : 'none');
  await browser.close();
})();
