import {test, expect} from '@playwright/test';
import http from 'node:http';
import {readFile} from 'node:fs/promises';

test('static demo works under a nested path and resets sample data on reload', async ({page}) => {
  const files = {'/demo/':['index.html','text/html'], '/demo/style.css':['style.css','text/css'], '/demo/app.js':['app.js','text/javascript'], '/demo/api/checks.json':['api/checks.json','application/json']};
  const server = http.createServer(async (req,res) => {
    const file = files[req.url];
    if (!file) {res.writeHead(404).end(); return;}
    try {res.writeHead(200,{'content-type':file[1]}).end(await readFile(new URL(`../public/${file[0]}`,import.meta.url)));}
    catch {res.writeHead(500).end();}
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/demo/`);
    await expect(page.getByText('Review checkout flow')).toBeVisible();
    await page.getByLabel('Add a check').fill('Temporary example');
    await page.getByRole('button',{name:'Add check'}).click();
    await expect(page.getByRole('listitem')).toHaveCount(3);
    await page.reload();
    await expect(page.getByRole('listitem')).toHaveCount(2);
    await expect(page.getByText('Temporary example')).toHaveCount(0);
  } finally {await new Promise(resolve => server.close(resolve));}
});
