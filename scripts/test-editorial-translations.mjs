import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {editorialEnglish} from '../dist/editorial-en.js';
globalThis.localStorage={getItem:()=> 'en'};
const {t}=await import('../dist/i18n.js');
const species=JSON.parse(readFileSync('dist/species.json')).species;
const names=JSON.parse(readFileSync('dist/german-names.json')).species;
const photos=JSON.parse(readFileSync('dist/photos.json')).photos;
const editorial=new Set();
for(const s of species){for(const status of s.status)editorial.add(status);if(s.note)editorial.add(s.note);}
for(const value of Object.values(names))for(const name of value.names||[])for(const field of ['note','region'])if(name[field])editorial.add(name[field]);
for(const photo of Object.values(photos))for(const p of [photo,...photo.additional||[]])for(const field of ['label','comparisonDescription','transformation'])if(p[field])editorial.add(p[field]);
for(const de of editorial){assert(Object.hasOwn(editorialEnglish,de),'Missing editorial translation: '+de);assert.equal(t(de),editorialEnglish[de]);}
for(const group of new Set(species.map(s=>s.group)))assert(group==='Flamingos'||t(group)!==group,'Missing group translation: '+group);
assert.equal(t('Brutvogel · Wintergast'),'Breeding bird · Winter visitor');
assert.equal(t('Volkstümlicher Name.'),'Vernacular name.');
assert.equal(t('Männchen · Schlichtkleid'),'Male · non-breeding plumage');
assert.equal(t('Common Blackbird'),'Common Blackbird');
const app=readFileSync('dist/app.js','utf8');assert(app.includes('<strong data-name-content lang="de">'));assert(app.includes("esc(t(p.transformation||"));
globalThis.localStorage={getItem:()=>null};
const german=await import('../dist/i18n.js?test-de');for(const text of editorial)assert.equal(german.t(text),text);
console.log(`PASS: English coverage for ${editorial.size} distinct editorial strings across all 313 species, German name explanations and picture labels/notes; combined status labels translate.`);
