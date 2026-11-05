import http from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([['/', ['index.html','text/html; charset=utf-8']], ['/app.js',['app.js','text/javascript; charset=utf-8']], ['/style.css',['style.css','text/css; charset=utf-8']]]);
http.createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/api/checks' && req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    return res.end(JSON.stringify([{ id: 1, title: 'Review checkout flow', status: 'open' }, { id: 2, title: 'Verify mobile navigation', status: 'done' }]));
  }
  const file = files.get(path);
  if (!file) { res.writeHead(404); return res.end('Not found'); }
  try { const data = await readFile(new URL(`./public/${file[0]}`, import.meta.url)); res.writeHead(200, { 'content-type': file[1] }); res.end(data); }
  catch { res.writeHead(500); res.end('Unable to read resource'); }
}).listen(4173, '127.0.0.1', () => console.log('Quality lab: http://127.0.0.1:4173'));
