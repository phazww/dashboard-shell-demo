// Static build for GitHub Pages: node scripts/build-pages.mjs /dashboard-shell-demo
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const base = (process.argv[2] || '').replace(/\/$/, '');
const out = 'dist';

await rm(out, { recursive: true, force: true });
await mkdir(`${out}/vendor/css`, { recursive: true });
await mkdir(`${out}/vendor/js`, { recursive: true });
await cp('src', `${out}/src`, { recursive: true });
await cp('node_modules/bootstrap/dist/css/bootstrap.min.css', `${out}/vendor/css/bootstrap.min.css`);
await cp('node_modules/bootstrap/dist/js/bootstrap.bundle.min.js', `${out}/vendor/js/bootstrap.bundle.min.js`);

const html = (await readFile('public/index.html', 'utf8'))
  .replace('<meta name="app-base" content="">', `<meta name="app-base" content="${base}">`)
  .replaceAll('"/vendor/', `"${base}/vendor/`)
  .replaceAll('"/src/', `"${base}/src/`);

await writeFile(`${out}/index.html`, html);
// Pages has no SPA fallback: unknown paths (deep links) are served 404.html, which is the same shell
await writeFile(`${out}/404.html`, html);
await writeFile(`${out}/.nojekyll`, '');
console.log(`built ${out}/ with base "${base}"`);
