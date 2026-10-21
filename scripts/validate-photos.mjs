import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const species=JSON.parse(readFileSync('dist/species.json','utf8')).species;
const media=JSON.parse(readFileSync('dist/photos.json','utf8')).photos;
assert.equal(species.length,313);
assert.deepEqual(Object.keys(media).sort(),species.map(s=>s.id).sort());
const seen=new Set();
for(const s of species){
  const p=media[s.id];
  assert.match(p.id,/^\d+$/,`media number: ${s.de}`);
  assert.ok(!seen.has(p.id),`duplicate media number: ${s.de}`);
  seen.add(p.id);
  assert.equal(p.sci,s.sci,`taxon: ${s.de}`);
  assert.ok(p.credit?.trim(),`photographer: ${s.de}`);
}
console.log(`PASS: ${species.length} distinct photo IDs, taxon mappings and credits.`);
