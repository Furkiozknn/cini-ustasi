// Duman testi: sayfa açılıyor mu, konsol hatası var mı, oyun başlıyor mu, bir etkileşim durumu değiştiriyor mu,
// telefon görünümünde taşma var mı, Yenilikler penceresi ve 404 sayfası duruyor mu. Depoya bağımlılık eklenmez.
//
// Kullanım:  node tests/duman.mjs [klasör]       (klasör verilmezse deponun kökü)
// Gerekli:   `playwright-core` (depo dışında: PW_MODULE=<node_modules'ün üstündeki klasör>) ve bir Chromium tabanlı
//            tarayıcı: CHROMIUM=<tarayıcı exe yolu> (verilmezse Playwright'ın kendi tarayıcısı).
// Not:       three.js CDN'den gelir (internet gerekir). Çıktı: "ok" / "FAIL" satırları, sonda RESULT; hatada çıkış kodu 1.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(process.argv[2] || join(here, '..'));
const req = createRequire(process.env.PW_MODULE ? pathToFileURL(join(process.env.PW_MODULE, 'x.js')) : import.meta.url);
const { chromium } = req('playwright-core');
const IGNORED = /gc\.zgo\.at|goatcounter|fonts\.googleapis\.com|fonts\.gstatic\.com/;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary' };
let failed = false;
const ok = m => console.log('ok   ' + m);
const fail = m => { failed = true; console.log('FAIL ' + m); };
const check = (c, m) => (c ? ok(m) : fail(m));

const srv = createServer((rq, rs) => {
  let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = join(root, p);
  if (!f.startsWith(root) || !existsSync(f) || statSync(f).isDirectory()) { rs.writeHead(404); rs.end('yok'); return; }
  rs.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' }); rs.end(readFileSync(f));
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

async function session(label, ctxOpts, fn) {
  const ctx = await browser.newContext(ctxOpts); const pg = await ctx.newPage();
  const errs = [], bad = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e));
  pg.on('console', m => { if (m.type() === 'error' && !IGNORED.test(m.text())) errs.push('console: ' + m.text().slice(0, 160)); });
  pg.on('requestfailed', q => { if (!IGNORED.test(q.url())) bad.push(q.url().slice(0, 100)); });
  pg.on('response', r => { if (r.status() >= 400 && !IGNORED.test(r.url())) bad.push(r.status() + ' ' + r.url().slice(0, 100)); });
  try {
    await pg.goto(base + 'index.html?nosave', { waitUntil: 'load' });
    await pg.waitForFunction(() => window.cini && window.cini.screen !== 'loading', null, { timeout: 90000 });
    await fn(pg);
  } catch (e) { fail(`${label}: ${String(e).slice(0, 200)}`); }
  check(errs.length === 0, `${label}: konsol/sayfa hatası yok` + (errs.length ? ' -> ' + errs.slice(0, 3).join(' | ') : ''));
  check(bad.length === 0, `${label}: 4xx/5xx ve başarısız istek yok` + (bad.length ? ' -> ' + bad.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}

const overflow = pg => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

await session('masaüstü 1366x768', { viewport: { width: 1366, height: 768 } }, async pg => {
  check(await pg.evaluate(() => cini.screen) === 'title', 'masaüstü: açılış ekranı başlık');
  check(await pg.title() === 'Çini Ustası', 'masaüstü: <title> doğru');
  // Yenilikler penceresi (bu güncellemeyle geldi; eski sürümde FAIL vermesi beklenir)
  const ver = await pg.evaluate(() => (document.getElementById('btnNews') || {}).textContent || '');
  check(/^v\d+\.\d+ · \p{L}+ \d{4}$/u.test(ver), 'masaüstü: sürüm etiketi görünür (' + ver + ')');
  if (ver) {
    await pg.click('#btnNews');
    check(await pg.evaluate(() => !document.getElementById('newsScreen').classList.contains('hidden') && document.querySelectorAll('#newsList li').length >= 3), 'masaüstü: Yenilikler penceresi açılıyor ve madde listeliyor');
    await pg.keyboard.press('Escape');
    check(await pg.evaluate(() => document.getElementById('newsScreen').classList.contains('hidden') && cini.screen === 'title'), 'masaüstü: Esc Yenilikler penceresini kapatıp ana ekrana dönüyor');
  }
  const more = await pg.evaluate(() => (document.getElementById('lnkMore') || {}).href || '');
  check(more === 'https://furkiozknn.github.io/', 'masaüstü: «Diğer oyunlar» bağlantısı merkez sayfaya gidiyor (' + more + ')');
  // oyun başlıyor, bir etkileşim durumu değiştiriyor
  await pg.click('#btnPlay'); await pg.waitForTimeout(1500);
  if (await pg.evaluate(() => !document.getElementById('howtoScreen').classList.contains('hidden'))) { await pg.click('#btnHowtoOk'); await pg.waitForTimeout(500); }
  check(await pg.evaluate(() => cini.screen) === 'playing', 'masaüstü: Oyna ile oyun başlıyor');
  const before = await pg.evaluate(() => cini.history.length);
  const plan = await pg.evaluate(() => cini.api.plan());
  await pg.evaluate(m => cini.api.performMove(m), plan[0]);
  check(await pg.evaluate(() => cini.history.length) === before + 1, 'masaüstü: bir hamle geçmişe ekleniyor');
  await pg.keyboard.press('z');
  check(await pg.evaluate(() => cini.history.length) === before, 'masaüstü: Z (geri al) hamleyi geri alıyor');
  await pg.keyboard.press('Escape');
  check(await pg.evaluate(() => cini.screen) === 'menu', 'masaüstü: Esc duraklatma menüsünü açıyor');
  await pg.keyboard.press('Escape');
  // tam çözüm
  const done = await pg.evaluate(async () => { for (const m of cini.api.plan()) { cini.api.performMove(m); await new Promise(r => setTimeout(r, 40)); } await new Promise(r => setTimeout(r, 1500)); return cini.screen; });
  check(['completing', 'kiln', 'complete'].includes(done), 'masaüstü: plan uygulanınca bölüm tamamlanıyor (' + done + ')');
});

for (const [w, h] of [[390, 844], [360, 740]]) {
  await session(`telefon ${w}x${h}`, { viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }, async pg => {
    check(await overflow(pg) <= 0, `telefon ${w}: ana ekranda yatay taşma yok`);
    const outside = await pg.evaluate(() => [...document.querySelectorAll('#titleScreen button, #titleScreen a')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1); }).map(e => e.id || e.textContent.trim()));
    check(outside.length === 0, `telefon ${w}: ana ekran düğmeleri ekran içinde` + (outside.length ? ' -> ' + outside.join(',') : ''));
    await pg.tap('#btnPlay'); await pg.waitForTimeout(1500);
    if (await pg.evaluate(() => !document.getElementById('howtoScreen').classList.contains('hidden'))) { await pg.tap('#btnHowtoOk'); await pg.waitForTimeout(500); }
    check(await pg.evaluate(() => cini.screen) === 'playing', `telefon ${w}: dokunuşla oyun başlıyor`);
    check(await overflow(pg) <= 0, `telefon ${w}: oyun ekranında yatay taşma yok`);
    const hudOut = await pg.evaluate(() => [...document.querySelectorAll('#topbar button, #hudActions button')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1); }).map(e => e.id));
    check(hudOut.length === 0, `telefon ${w}: oyun düğmeleri ekran içinde` + (hudOut.length ? ' -> ' + hudOut.join(',') : ''));
  });
}

const r404 = existsSync(join(root, '404.html')) ? readFileSync(join(root, '404.html'), 'utf8') : '';
check(/<html lang="tr"/.test(r404) && /furkiozknn\.github\.io\/cini-ustasi\//.test(r404), '404.html var, Türkçe ve oyuna dönüş bağlantısı içeriyor');

await browser.close(); srv.close();
console.log(failed ? 'RESULT FAIL' : 'RESULT OK');
process.exit(failed ? 1 : 0);
