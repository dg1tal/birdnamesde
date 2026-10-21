import assert from 'node:assert/strict';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const species=JSON.parse(readFileSync('dist/species.json','utf8')).species;
const manifest=JSON.parse(readFileSync('dist/photos.json','utf8')),media=manifest.photos;
const exceptions=JSON.parse(readFileSync('data/commons-taxon-exceptions.json','utf8'));
const sexReview=JSON.parse(readFileSync('data/photo-sex-review.json','utf8'));
assert.equal(species.length,313);
assert.deepEqual(Object.keys(media).sort(),species.map(s=>s.id).sort());
const seen=new Set(),files=new Set();let count=0,illustrations=0;
for(const s of species){
 const images=[media[s.id],...(media[s.id].additional||[])];
 for(const p of images){
 count++;
 assert.ok(!p.mediaType||['photo','illustration'].includes(p.mediaType),`media type: ${s.de}`);
 if(p.mediaType==='illustration'){
  illustrations++;assert.ok(p.illustrationDate?.trim()&&p.comparisonDescription?.trim(),`illustration description: ${s.de}`);
  assert.ok(p.sexes?.length,`illustration sexes: ${s.de}`);
  const evidence=sexReview.species[s.id]?.evidence?.find(e=>e.source===p.source);
  assert.ok(evidence?.basis?.trim(),`illustration source evidence: ${s.de}`);
  assert.deepEqual([...evidence.sexes].sort(),[...p.sexes].sort(),`illustration sex assignment: ${s.de}`);
 }
 assert.match(p.local,new RegExp('^images/'+s.id+'(?:-(?:male|female|pair))?\\.(jpg|png|webp)$'));
 assert.ok(!files.has(p.local),`duplicate path: ${s.de}`);files.add(p.local);
 assert.ok(!seen.has(p.source),`duplicate source: ${s.de}`);seen.add(p.source);
 assert.equal(p.sci,s.sci,`taxon: ${s.de}`);
 assert.ok(p.taxonNames.includes(s.sci)||(exceptions[s.id]?.scientificName===s.sci&&p.taxonNames.includes(exceptions[s.id].wikidataTaxonName)),`unreviewed taxon: ${s.de}`);
 assert.ok(p.credit?.trim()&&p.title?.trim(),`attribution: ${s.de}`);
 assert.match(p.source,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
 assert.match(p.license,/^(CC BY(?:-SA)? (?:[234]\.0|2\.5)(?: de)?|CC0|Public domain|PDM)$/);
 assert.match(p.licenseUrl,/^https?:\/\/creativecommons.org\//);
 assert.ok(p.width>0&&p.height>0,`dimensions: ${s.de}`);
 const bytes=readFileSync('dist/'+p.local);assert.ok(bytes.length>1000);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),p.localSha256,`file changed: ${s.de}`);
 if(p.sexes){assert.ok(p.sexes.length&&p.sexes.every(x=>['male','female'].includes(x)));assert.ok(p.label?.trim());}
 }
 if(sexReview.species[s.id]?.status==='covered'){
  assert.deepEqual([...new Set(images.flatMap(p=>p.sexes||[]))].sort(),['female','male'],`sex coverage: ${s.de}`);
  assert.ok(sexReview.species[s.id].evidence?.length,`sex evidence: ${s.de}`);
  assert.ok(!media[s.id].comparisonMissing,`stale missing comparison: ${s.de}`);
 }
 if(sexReview.species[s.id]?.status==='unresolved')assert.equal(media[s.id].comparisonMissing,true,`missing comparison note: ${s.de}`);
}
assert.deepEqual(readdirSync('dist/images').map(x=>'images/'+x).sort(),[...files].sort());
assert.equal(manifest.meta.imageCount,count);
assert.equal(manifest.meta.illustrationCount||0,illustrations);
assert.equal(manifest.meta.sexReviewedSpecies,Object.values(sexReview.species).filter(x=>x.status==='covered').length);
console.log(`PASS: ${species.length} species, ${count-illustrations} local photos + ${illustrations} scientific illustrations, distinct sources, reviewed taxa, sex coverage, authors, licenses and SHA-256 hashes.`);
