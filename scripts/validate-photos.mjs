import assert from 'node:assert/strict';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const species=JSON.parse(readFileSync('dist/species.json','utf8')).species;
const manifest=JSON.parse(readFileSync('dist/photos.json','utf8')),media=manifest.photos;
const photoBaseline=JSON.parse(readFileSync('data/photo-baseline-20261105.json','utf8')).photos;
const inaturalist=JSON.parse(readFileSync('data/inaturalist-photo-sources.json','utf8'));
for(const [id,p] of Object.entries(photoBaseline))assert.deepEqual(media[id],p,'Preserve original media and credits: '+id);
assert.equal(Object.keys(media).length,species.length,'Every catalogue species has media');
const exceptions=JSON.parse(readFileSync('data/commons-taxon-exceptions.json','utf8'));
const sexReview=JSON.parse(readFileSync('data/photo-sex-review.json','utf8'));
const baseline=JSON.parse(readFileSync('data/catalog-baseline.json','utf8')).species;
assert(species.length>=baseline.length);
assert(baseline.every(s=>media[s.id]),'Retain every original species image');
assert(Object.keys(media).every(id=>species.some(s=>s.id===id)),'Media references known species');
const seen=new Set(),files=new Set();let count=0,illustrations=0;
for(const s of species.filter(s=>media[s.id])){
 const images=[media[s.id],...(media[s.id].additional||[])];
 for(const p of images){
 count++;
 assert.ok(!p.mediaType||['photo','illustration'].includes(p.mediaType),`media type: ${s.de}`);
 if(p.mediaType==='illustration'){
  illustrations++;assert.ok(p.illustrationDate?.trim()&&p.comparisonDescription?.trim(),`illustration description: ${s.de}`);
  assert.ok(p.verificationUrl,`illustration source: ${s.de}`);
  if(p.sexes?.length){
  const evidence=sexReview.species[s.id]?.evidence?.find(e=>e.source===p.source);
  assert.ok(evidence?.basis?.trim(),`illustration source evidence: ${s.de}`);
  assert.deepEqual([...evidence.sexes].sort(),[...p.sexes].sort(),`illustration sex assignment: ${s.de}`);
  }
 }
 assert.match(p.local,new RegExp('^images/'+s.id+'(?:-(?:male|female|pair))?\\.(jpg|png|webp)$'));
 assert.ok(!files.has(p.local),`duplicate path: ${s.de}`);files.add(p.local);
 assert.ok(!seen.has(p.source),`duplicate source: ${s.de}`);seen.add(p.source);
 assert.equal(p.sci,s.sci,`taxon: ${s.de}`);
 assert.ok(p.taxonNames.includes(s.sci)||(exceptions[s.id]?.scientificName===s.sci&&p.taxonNames.includes(exceptions[s.id].wikidataTaxonName)),`unreviewed taxon: ${s.de}`);
 assert.ok(p.credit?.trim()&&p.title?.trim(),`attribution: ${s.de}`);
 if(p.sourceLabel==='iNaturalist'){
  assert.match(p.source,/^https:\/\/www.inaturalist.org\/photos\/\d+$/);
  const proof=inaturalist.photos[p.source];assert(proof,'Recorded iNaturalist evidence');
  assert.equal(proof.qualityGrade,'research');assert(p.taxonNames.includes(proof.taxon.name));
  assert.equal(p.license,{'cc0':'CC0','cc-by':'CC BY 4.0','cc-by-sa':'CC BY-SA 4.0'}[proof.photo.license_code]);
  assert.equal(p.source,'https://www.inaturalist.org/photos/'+proof.photo.id);
  for(const sex of p.sexes||[])assert(proof.annotations.some(a=>a.controlled_attribute_id===9&&a.controlled_value_id===inaturalist.sexAnnotation.values[sex]&&a.vote_score>=0),'Explicit sex annotation');
 }else assert.match(p.source,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
 assert.match(p.license,/^(CC BY(?:-SA)? (?:[234]\.0|2\.5)(?: de)?|CC0|Public domain|PDM)$/);
 assert.match(p.licenseUrl,/^https:\/\/creativecommons.org\//);
 assert.ok(p.width>0&&p.height>0,`dimensions: ${s.de}`);
 const bytes=readFileSync('dist/'+p.local);assert.ok(bytes.length>1000);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),p.localSha256,`file changed: ${s.de}`);
 if(!photoBaseline[s.id])for(const sex of p.sexes||[])assert(sexReview.species[s.id]?.evidence?.some(e=>e.source===p.source&&e.sexes.includes(sex)&&e.basis?.trim()),'Explicit source evidence for '+s.id+' '+sex);
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
console.log(`PASS: ${Object.keys(media).length} species with media in a ${species.length}-species catalogue, ${count-illustrations} local photos + ${illustrations} scientific illustrations, distinct sources, reviewed taxa, sex coverage, authors, licenses and SHA-256 hashes.`);
