import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('news replaces the journey note and each story offers localized prerequisite lessons',()=>{
 const issue=JSON.parse(readFileSync('src/data/news.json','utf8'));
 for(const lang of ['en','ko']){
  const prefix=lang==='ko'?'ko/':'';
  const home=readFileSync(`dist/${prefix}index.html`,'utf8');
  assert.ok(!home.includes('margin-note'));
  assert.match(home,/class="news-rail"/);
  const page=readFileSync(`dist/${prefix}news/index.html`,'utf8');
  for(const story of issue.stories){
   assert.ok(story.lessons?.length>=1 && story.lessons.length<=3);
   const article=page.match(new RegExp(`<article[^>]*id="${story.id}"[^>]*>[\\s\\S]*?</article>`))[0];
   for(const ref of story.lessons){
    const route=ref.course==='vibe-coding'?`lessons/${ref.id}/`:`courses/${ref.course}/${ref.id}/`;
    assert.ok(article.includes(`href="/vibe-coding-book/${prefix}${route}"`));
    assert.ok(readFileSync(`dist/${prefix}${route}index.html`,'utf8').includes('<h1'));
   }
  }
 }
});
