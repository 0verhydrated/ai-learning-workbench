import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
test('the built introduction offers an accessible course entry point', () => {
 assert.ok(existsSync('dist/index.html'), 'Built introduction must exist');
 const html = readFileSync('dist/index.html','utf8');
 assert.match(html, /<h1[^>]*>.*Vibe coding/s);
 assert.match(html, /href="#main"/);
 assert.match(html, /\/lessons\/01-fundamentals\//);
 assert.match(html, /aria-label="Course chapters"/);
});

test('all built internal links and assets resolve under the Pages repository path', () => {
 const walk = dir => readdirSync(dir).flatMap(name => {
  const p = join(dir, name); return statSync(p).isDirectory() ? walk(p) : [p];
 });
 for (const file of walk('dist').filter(p => p.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  for (const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
   if (!url.startsWith('/')) continue;
   assert.ok(url.startsWith('/vibe-coding-book/'), `${file}: wrong base ${url}`);
   const path = url.split(/[?#]/)[0].replace('/vibe-coding-book/', '');
   const target = join('dist', path, path.endsWith('/') || !path ? 'index.html' : '');
   assert.ok(existsSync(target), `${file}: missing ${url}`);
  }
 }
});
