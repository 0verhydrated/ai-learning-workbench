import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const base = '/vibe-coding-book';
const page = lang => {
 const path = `dist/${lang === 'ko' ? 'ko/' : ''}news/index.html`;
 assert.ok(existsSync(path), `${lang} news page must be built`);
 return readFileSync(path, 'utf8');
};

const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

for (const lang of ['en', 'ko']) {
 test(`${lang} news renders three sourced stories and transparent issue metadata without JavaScript`, () => {
  const html = page(lang);
  const issue = JSON.parse(readFileSync('src/data/news.json', 'utf8'));
  const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)[0];
  assert.equal(issue.stories.length, 3);
  assert.equal([...main.matchAll(/<article\b/g)].length, 3);
  const updated = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(issue.updatedAt));
  assert.ok(main.includes(updated));
  assert.ok(main.includes(issue.windowStart));
  assert.ok(main.includes(issue.windowEnd));
  assert.match(main, /Asia\/Seoul/);
  assert.match(main, lang === 'ko' ? /객관적인 순위가 아닙니다/ : /not an objective ranking/);
  for (const [index, story] of issue.stories.entries()) {
   const article = main.match(new RegExp(`<article\\b[^>]*id="${story.id}"[^>]*>[\\s\\S]*?<\\/article>`))?.[0];
   assert.ok(article, `Story ${story.id} has a stable anchor`);
   for (const text of Object.values(story[lang])) assert.ok(article.includes(escape(text)), `Missing localized text in ${story.id}`);
   assert.ok(article.includes(`datetime="${story.publishedAt}"`));
   assert.ok(article.includes(`href="${escape(story.source.url)}"`));
   assert.ok(article.includes(`[${index + 1}] ${escape(story.source.name)}`));
   assert.match(article, lang === 'ko' ? /편집자 해설/ : /Editorial perspective/);
   assert.ok(html.includes(`href="#${story.id}"`));
  }
 });
 test(`${lang} news is a distinct section with reciprocal language navigation`, () => {
  const html = page(lang);
  assert.match(html, new RegExp(`<html lang="${lang}">`));
  const sidebar = html.match(/<aside class="sidebar"[\s\S]*?<\/aside>/)[0];
  const active = [...sidebar.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
  assert.equal(active.length, 1);
  assert.ok(active[0][0].includes(`href="${base}/${lang === 'ko' ? 'ko/' : ''}news/"`));
  for (const target of ['en', 'ko']) {
   const url = `${base}/${target === 'ko' ? 'ko/' : ''}news/`;
   assert.ok(html.includes(`href="${url}" lang="${target}"`));
   assert.ok(html.includes(`hreflang="${target}" href="https://`));
  }
  assert.match(html, lang === 'ko' ? /매주 일요일 오전 8시 \(한국 시간\)/ : /Weekly · Sunday 08:00 KST/);
 });
}
