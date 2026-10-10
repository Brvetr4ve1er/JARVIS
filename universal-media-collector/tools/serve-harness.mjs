// serve-harness.mjs — static server for the renderer in a plain browser
// (mock bridge). `npm run harness` then open http://127.0.0.1:4173/.
// Also serves /main/sources.js as an ES module for the mock.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.png': 'image/png' };
const PORT = Number(process.env.PORT || 4173);
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  let body = fs.readFileSync(file);
  // main/sources.js is CommonJS; expose it to the mock bridge as ESM
  if (p === '/main/sources.js') body = Buffer.from(body.toString().replace(/module\.exports = \{[^}]*\};?/, 'export { SOURCES, STATE_LABEL, capability, list };'));
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  res.end(body);
}).listen(PORT, '127.0.0.1', () => console.log(`harness: http://127.0.0.1:${PORT}/`));
