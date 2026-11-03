import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('weekly news contains three dated, bilingual, source-linked stories within its coverage window', () => {
 const path='src/data/news.json';
 assert.ok(existsSync(path), 'Weekly news data must exist');
 const issue=JSON.parse(readFileSync(path,'utf8'));
 assert.ok(Number.isFinite(Date.parse(issue.updatedAt)));
 const start=Date.parse(issue.windowStart+'T00:00:00+09:00');
 const end=Date.parse(issue.windowEnd+'T00:00:00+09:00');
 assert.ok(end >= start && end-start <= 6*86400000, 'Coverage uses seven calendar dates at most');
 assert.equal(issue.stories.length,3);
 assert.equal(new Set(issue.stories.map(s=>s.id)).size,3);
 assert.equal(new Set(issue.stories.map(s=>s.source.url)).size,3);
 for(const story of issue.stories){
  assert.match(story.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.match(story.publishedAt,/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(story.publishedAt>=issue.windowStart && story.publishedAt<=issue.windowEnd, `${story.id}: outside coverage window`);
  assert.equal(new URL(story.source.url).protocol,'https:');
  assert.ok(story.source.name.trim());
  for(const lang of ['en','ko']) for(const key of ['title','summary','whyItMatters']) assert.ok(story[lang][key].trim(), `${story.id} lacks ${lang}.${key}`);
  assert.match(story.ko.summary,/[가-힣]/);
 }
});
