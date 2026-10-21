import assert from 'node:assert/strict';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const species=JSON.parse(readFileSync('dist/species.json','utf8')).species;
const media=JSON.parse(readFileSync('dist/photos.json','utf8')).photos;
const exceptions=JSON.parse(readFileSync('data/commons-taxon-exceptions.json','utf8'));
assert.equal(species.length,313);
assert.deepEqual(Object.keys(media).sort(),species.map(s=>s.id).sort());
const seen=new Set();
for(const s of species){
 const p=media[s.id];
 assert.match(p.local,new RegExp('^images/'+s.id+'\\.(jpg|png|webp)$'));
 assert.ok(!seen.has(p.source),`duplicate source: ${s.de}`);seen.add(p.source);
 assert.equal(p.sci,s.sci,`taxon: ${s.de}`);
 assert.ok(p.taxonNames.includes(s.sci)||(exceptions[s.id]?.scientificName===s.sci&&p.taxonNames.includes(exceptions[s.id].wikidataTaxonName)),`unreviewed taxon: ${s.de}`);
 assert.ok(p.credit?.trim()&&p.title?.trim(),`attribution: ${s.de}`);
 assert.match(p.source,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
 assert.match(p.license,/^(CC BY(?:-SA)? [234]\.0|CC BY-SA 2\.5|CC0|Public domain|PDM)$/);
 assert.match(p.licenseUrl,/^https?:\/\/creativecommons.org\//);
 assert.ok(p.width>0&&p.height>0,`dimensions: ${s.de}`);
 const bytes=readFileSync('dist/'+p.local);assert.ok(bytes.length>1000);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),p.localSha256,`file changed: ${s.de}`);
}
assert.equal(readdirSync('dist/images').length,species.length);
console.log(`PASS: ${species.length} local photos, distinct sources, reviewed taxa, authors, licenses and SHA-256 hashes.`);
