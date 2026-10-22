import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {matches,accepts,normalize} from '../dist/logic.js';
const birds=JSON.parse(readFileSync('dist/species.json','utf8')).species;
const data=JSON.parse(readFileSync('dist/german-names.json','utf8'));
let count=0,historical=0;
for(const [id,record] of Object.entries(data.species)){
 const s=birds.find(s=>s.id===id);assert(s,`unknown species ${id}`);
 assert.equal(record.de,s.de);assert.equal(record.sci,s.sci);
 const seen=new Set();s.germanNames=record.names;
 for(const n of record.names){
  count++;assert(n.name.trim()&&n.name!==s.de);assert(!seen.has(normalize(n.name)));seen.add(normalize(n.name));
  assert(['alternative','historical'].includes(n.status));historical+=+(n.status==='historical');
  assert(n.note.trim()&&n.basis.trim()&&n.sourceTitle.trim());assert.equal(new URL(n.source).protocol,'https:');
  assert(matches(s,n.name),`search alias ${n.name}`);
  assert(matches(s,`${n.name} ${s.sci}`),`combined search ${n.name}`);
 }
}
assert.equal(data.meta.speciesCount,Object.keys(data.species).length);
assert.equal(data.meta.nameCount,count);assert.equal(data.meta.historicalCount,historical);assert.equal(data.meta.alternativeCount,count-historical);
const get=de=>birds.find(s=>s.de===de);
for(const [de,name] of [['Stieglitz','Distelfink'],['Gimpel','Dompfaff'],['Kleiber','Spechtmeise'],['Graureiher','Fischreiher'],['Zwergtaucher','Zwergsteißfuß']])assert(matches(get(de),name));
assert(matches(get('Bergfink'),'Quaeker'));
assert(!accepts(get('Stieglitz'),'en','Distelfink'));assert(!accepts(get('Gimpel'),'code','Dompfaff'));
for(const s of birds){assert(matches(s,s.de));assert(accepts(s,'en',s.en));for(const c of s.codes)assert(accepts(s,'code',c));}
assert.equal(get('Kleiber').germanNames.find(n=>n.name==='Spechtmeise').status,'alternative');
assert.equal(get('Graureiher').germanNames.find(n=>n.name==='Fischreiher').status,'alternative');
assert.equal(get('Uhu').germanNames.find(n=>n.name==='Schuhu').status,'historical');
console.log(`PASS: ${count} sourced German names for ${data.meta.speciesCount} unchanged eBird taxa; category/source integrity, alias/combined/umlaut search, English and code answer boundaries.`);
