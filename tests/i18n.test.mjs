import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

test('code blocks use a light syntax theme matching the reading surface', () => {
 const html = readFileSync('dist/ko/lessons/09-security/index.html', 'utf8');
 assert.match(html, /<pre class="astro-code github-light"/);
});

test('Korean introduction has Korean semantics and reciprocal language choices', () => {
 assert.ok(existsSync('dist/ko/index.html'), 'Korean introduction must be built');
 const ko = readFileSync('dist/ko/index.html', 'utf8');
 const en = readFileSync('dist/index.html', 'utf8');
 assert.match(ko, /<html lang="ko">/);
 assert.match(ko, /바이브 코딩/);
 assert.match(ko, /aria-label="언어 선택"/);
 assert.match(ko, /href="\/ai-learning-workbench\/"[^>]*lang="en"/);
 assert.match(en, /href="\/ai-learning-workbench\/ko\/"[^>]*lang="ko"/);
 assert.match(ko, /hreflang="en"/);
 assert.match(en, /hreflang="ko"/);
});

test('every lesson has a Korean counterpart and language switches preserve the lesson', () => {
 const ids = readdirSync('src/content/lessons').filter(f=>f.endsWith('.md')).map(f=>f.slice(0,-3));
 assert.equal(ids.length, 12);
 for (const id of ids) {
  const file = `dist/ko/lessons/${id}/index.html`;
  assert.ok(existsSync(file), `Missing Korean lesson ${id}`);
  const ko = readFileSync(file, 'utf8');
  const en = readFileSync(`dist/lessons/${id}/index.html`, 'utf8');
  assert.match(ko, /<html lang="ko">/);
  assert.ok(ko.includes(`href="/ai-learning-workbench/lessons/${id}/" lang="en"`));
  assert.ok(en.includes(`href="/ai-learning-workbench/ko/lessons/${id}/" lang="ko"`));
  assert.match(ko, /aria-label="강의 목차"/);
  const pagination = ko.match(/<nav class="pagination"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(pagination, 'Korean lesson pagination exists');
  for (const [,href] of pagination.matchAll(/href="([^"]+)"/g)) assert.ok(href.startsWith('/ai-learning-workbench/ko/'));
 }
});
