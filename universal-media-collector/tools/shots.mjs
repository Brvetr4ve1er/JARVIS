// shots.mjs — drive the renderer (mock bridge) through every realm, both
// themes, both languages, and the key states; save PNGs to _shots/ and fail
// on any console error. `node tools/shots.mjs`
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');   // CJS resolution sees NODE_PATH; ESM does not
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_shots'); fs.mkdirSync(OUT, { recursive: true });
const PORT = 4199;
const srv = spawn(process.execPath, [path.join(ROOT, 'tools/serve-harness.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 400));
const errors = [];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
const shot = async (name) => { await page.waitForTimeout(250); await page.screenshot({ path: path.join(OUT, name + '.png') }); console.log('shot', name); };
try {
  await page.goto(`http://127.0.0.1:${PORT}/`);
  await page.waitForSelector('#rail-left .sigil');
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
  await page.reload(); await page.waitForSelector('#ib-url');
  await shot('01-inbox-empty');
  await page.fill('#ib-url', 'https://gallery.example/posts/autumn-light');
  await page.press('#ib-url', 'Enter');
  await page.waitForSelector('.ib-cand'); await page.waitForTimeout(900);
  await shot('02-inbox-results');
  await page.click('#ib-view button[data-v=list]'); await shot('03-inbox-list');
  await page.click('#ib-view button[data-v=grid]');
  await page.click('#ib-selvis'); await shot('04-inbox-selected');
  await page.click('.ib-cand .ib-info'); await page.waitForSelector('#drawer.open'); await shot('05-inbox-drawer');
  await page.keyboard.press('Escape');
  await page.click('#ib-add'); await page.waitForTimeout(300);
  await page.keyboard.press('2'); await page.waitForSelector('.q-row'); await page.waitForTimeout(1200);
  await shot('06-queue-running');
  await page.waitForSelector('#confirm.open', { timeout: 15000 }); await shot('07-queue-conflict');
  await page.click('#confirm .btn.primary'); await page.waitForTimeout(3500); await shot('08-queue-done');
  await page.keyboard.press('3'); await page.waitForSelector('.lib-row'); await shot('09-library');
  await page.click('.lib-row'); await page.waitForSelector('#drawer.open'); await shot('10-library-drawer'); await page.keyboard.press('Escape');
  await page.keyboard.press('4'); await page.waitForSelector('.src-card'); await shot('11-sources');
  await page.keyboard.press('5'); await page.waitForSelector('#s-dest'); await shot('12-settings');
  await page.keyboard.press('1'); await page.fill('#ib-url', 'https://www.instagram.com/p/abc123/'); await page.press('#ib-url', 'Enter'); await page.waitForSelector('.ib-source .note.err'); await shot('13-inbox-unsupported');
  await page.fill('#ib-url', 'https://files.example/clips/intro-4k.mp4'); await page.press('#ib-url', 'Enter'); await page.waitForSelector('.ib-cand'); await page.waitForTimeout(700); await shot('14-inbox-direct');
  await page.keyboard.press('Control+k'); await page.waitForSelector('#palette.open'); await page.type('.pal-input', 'li'); await page.waitForTimeout(150); await shot('15-palette'); await page.keyboard.press('Escape');
  await page.evaluate(() => window.UMC.applyTheme('daylight')); await page.waitForTimeout(400);
  await page.fill('#ib-url', 'https://gallery.example/posts/autumn-light'); await page.press('#ib-url', 'Enter'); await page.waitForSelector('.ib-cand'); await page.waitForTimeout(900); await shot('16-daylight-inbox');
  await page.keyboard.press('2'); await page.waitForTimeout(300); await shot('17-daylight-queue');
  await page.click('#theme-btn'); await page.click('.theme-opt[data-lang=fr]'); await page.waitForTimeout(400); await page.keyboard.press('1'); await page.waitForTimeout(300); await shot('18-fr-inbox');
  await page.keyboard.press('4'); await page.waitForTimeout(300); await shot('19-fr-sources');
  await page.setViewportSize({ width: 820, height: 700 }); await page.keyboard.press('1'); await page.waitForTimeout(400); await shot('20-narrow-inbox');
} finally {
  await browser.close(); srv.kill();
}
if (errors.length) { console.error('CONSOLE ERRORS:\n' + errors.join('\n')); process.exit(1); }
console.log('no console errors');
