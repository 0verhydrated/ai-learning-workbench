import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);
test('Korean prose renders emphasis instead of literal Markdown delimiters',()=>{
 for(const file of walk('dist/ko').filter(f=>f.endsWith('.html'))){
  const html=readFileSync(file,'utf8');
  const prose=html.match(/<article class="prose"[^>]*>([\s\S]*?)<\/article>/)?.[1];
  if(!prose) continue;
  const text=prose.replace(/<pre\b[\s\S]*?<\/pre>/g,'').replace(/<code\b[\s\S]*?<\/code>/g,'').replace(/<[^>]+>/g,'');
  assert.ok(!text.includes('**'),`${file}: unrendered emphasis`);
 }
});
