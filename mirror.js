const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = 'site';
const START = 'https://www.roblox.com/ja/login';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    locale: 'ja-JP',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  const saved = new Map();

  page.on('response', async (res) => {
    const url = res.url();
    if (!url.startsWith('http')) return;
    try {
      const body = await res.body();
      const u = new URL(url);
      let p = decodeURIComponent(u.pathname);
      if (p.endsWith('/') || !path.extname(p)) {
        const ct = (res.headers()['content-type'] || '').split(';')[0];
        const ext = {
          'text/css': '.css',
          'application/javascript': '.js',
          'text/javascript': '.js',
          'image/png': '.png',
          'image/jpeg': '.jpg',
          'image/gif': '.gif',
          'image/svg+xml': '.svg',
          'image/webp': '.webp',
          'font/woff2': '.woff2',
          'font/woff': '.woff',
          'application/json': '.json',
        }[ct] || '.bin';
        p = p.replace(/\/$/, '') + ext;
      }
      const rel = path.join(OUT, u.hostname, p);
      fs.mkdirSync(path.dirname(rel), { recursive: true });
      fs.writeFileSync(rel, body);
      saved.set(url, rel);
    } catch {}
  });

  await page.goto(START, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(8000);

  let html = await page.content();
  for (const [remote, local] of saved) {
    const relLocal = './' + path.relative(OUT, local).split(path.sep).join('/');
    html = html.split(remote).join(relLocal);
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.html'), html);

  const cssFiles = [...saved.values()].filter((f) => f.endsWith('.css'));
  for (const f of cssFiles) {
    let css = fs.readFileSync(f, 'utf8');
    for (const [remote, local] of saved) {
      if (!css.includes(remote)) continue;
      const relLocal = path.relative(path.dirname(f), local).split(path.sep).join('/');
      css = css.split(remote).join(relLocal);
    }
    fs.writeFileSync(f, css);
  }

  await browser.close();
  console.log('saved files:', saved.size);
  console.log('-> site/index.html');
})();
