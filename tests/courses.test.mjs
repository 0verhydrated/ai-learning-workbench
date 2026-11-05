import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const courses=['ai-foundations','vibe-coding','agents-tools','automation'];
const chapters={
 'ai-foundations':['01-models','02-tokens-context','03-inference-cost','04-retrieval'],
 'agents-tools':['01-agent-loops','02-mcp','03-skills','04-identity-memory'],
 'automation':['01-cron-triggers','02-reliable-workflows','03-evaluation-observability','04-safe-automation']
};
test('all new lesson routes retain language, course context, and correct pagination',()=>{
 for(const [course,ids] of Object.entries(chapters)) for(const lang of ['en','ko']) for(const [i,id] of ids.entries()){
  const prefix=lang==='ko'?'ko/':'';
  const route=`courses/${course}/${id}/`;
  const html=readFileSync(`dist/${prefix}${route}index.html`,'utf8');
  assert.ok(html.includes(`<html lang="${lang}">`));
  for(const target of ['en','ko']) assert.ok(html.includes(`href="/ai-learning-workbench/${target==='ko'?'ko/':''}${route}" lang="${target}"`));
  const sidebar=html.match(/<aside class="sidebar"[\s\S]*?<\/aside>/)[0];
  const active=[...sidebar.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
  assert.equal(active.length,1);
  assert.ok(active[0][0].includes(`href="/ai-learning-workbench/${prefix}${route}"`));
  assert.equal([...sidebar.matchAll(/class="lesson-number"/g)].length,4);
  const pagination=html.match(/<nav class="pagination"[\s\S]*?<\/nav>/)[0];
  const urls=[...pagination.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(urls,[ids[i-1],ids[i+1]].map(next=>`/ai-learning-workbench/${prefix}courses/${course}/${next?next+'/':''}`));
 }
});
test('readers can choose four courses in either language without JavaScript',()=>{
 for(const lang of ['','ko/']){
  const home=readFileSync(`dist/${lang}index.html`,'utf8');
  for(const course of courses){
   assert.ok(home.includes(`href="/ai-learning-workbench/${lang}courses/${course}/"`),`Missing ${lang}${course}`);
   assert.ok(existsSync(`dist/${lang}courses/${course}/index.html`));
  }
 }
});
