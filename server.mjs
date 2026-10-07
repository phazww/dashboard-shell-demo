import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(root, 'public');
const srcDir = join(root, 'src');
const vendorDir = join(root, 'node_modules', 'bootstrap', 'dist');
const port = Number(process.env.PORT) || 4173;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
};

function resolveFile(pathname) {
  const mounts = [
    ['/vendor/', vendorDir],
    ['/src/', srcDir],
  ];
  for (const [prefix, dir] of mounts) {
    if (pathname.startsWith(prefix)) return join(dir, normalize(pathname.slice(prefix.length)));
  }
  return join(publicDir, normalize(pathname));
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  // paths without an extension are app routes: serve the shell (SPA fallback)
  const file = extname(pathname) ? resolveFile(pathname) : join(publicDir, 'index.html');
  if (file.includes('..')) {
    res.writeHead(400).end('Bad request');
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

server.listen(port, () => console.log(`Demo: http://localhost:${port}/dashboard`));
