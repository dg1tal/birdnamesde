import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';

// Different query strings give the same file distinct browser module identities.
const root=resolve('dist'),versions=new Map();
for(const name of [...readdirSync(root).filter(n=>n.endsWith('.js')),'index.html']){
 const file=resolve(root,name),source=readFileSync(file,'utf8');
 for(const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*|\bsrc=)\s*['"]([^'"]+\.js(?:\?[^'"]*)?)['"]/g)){
  const url=new URL(match[1],'file://'+file);
  if(url.protocol!=='file:')continue;
  const target=resolve(dirname(file),url.pathname),version=url.search;
  if(!versions.has(target))versions.set(target,new Map());
  versions.get(target).set(version,[...(versions.get(target).get(version)||[]),name]);
 }
}
assert(versions.size>10,'Inspect the real module graph, including the HTML entry point');
for(const [file,variants]of versions)assert.equal(variants.size,1,`${file}: inconsistent module URLs ${JSON.stringify([...variants])}`);
console.log(`PASS: one version URL per local module across ${versions.size} production modules and the HTML entry point.`);
