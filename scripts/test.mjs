import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalize,matches,accepts,review,mastered,due,validProgress} from '../dist/logic.js';
const birds=JSON.parse(fs.readFileSync(new URL('../dist/species.json',import.meta.url))).species;
const find=n=>birds.find(s=>s.de===n);
assert.equal(normalize('Größe – Weiß'),normalize('Grosse weiss'));
assert(matches(find('Mönchsgrasmücke'),'monchs'));assert(matches(find('Mönchsgrasmücke'),'Moenchs'));
assert(matches(find('Amsel'),'Turdus mer'));assert(matches(find('Amsel'),'common black'));
assert(accepts(find('Amsel'),'en','Common Blackbird'));assert(accepts(find('Amsel'),'en','eurasian-blackbird'));
assert.equal(birds.filter(s=>s.enGB).length,70);
assert.equal(find('Ringelgans').enGB,'Brent Goose');
assert(accepts(find('Ringelgans'),'en','Brent Goose'));assert(matches(find('Ringelgans'),'brent goose'));
assert.equal(find('Kleiber').enGB,'');
assert(accepts(find('Amsel'),'code','cobl'));assert(accepts(find('Amsel'),'code','eubl'));assert(!accepts(find('Amsel'),'code','TUME'));
assert(birds.filter(s=>matches(s,'EUBL')).length>=2);
assert(matches(find('Nachtschwalbe'),'Ziegenmelker'));
let now=1000000,p;for(let n of [1,3,7,14,30,60,60]){p=review(p,true,now);assert.equal(p.interval,n);assert.equal(p.due,now+n*86400000);now=p.due;}
assert(mastered(p));p=review(p,false,now);assert(!mastered(p));assert(p.lastWrong);assert.equal(p.due,now+600000);assert(!due(p,now));assert(due(p,now+600000));
p=review(p,true,now,true);assert.equal(p.streak,0);assert.equal(p.interval,0);assert(!p.lastWrong);
const ids=new Set(birds.map(s=>s.id));const records={'eurbla:en':p};assert.deepEqual(validProgress({app:'BirdNames DE',version:1,records},ids),records);
assert.throws(()=>validProgress({app:'Other',version:1,records},ids));assert.throws(()=>validProgress({app:'BirdNames DE',version:1,records:{'eurbla:en':{...p,due:NaN}}},ids));
let isolated={'eurbla:en':review(undefined,true,now)};assert.equal(isolated['eurbla:code'],undefined);
for(let s of birds){assert(accepts(s,'en',s.en));for(let c of s.codes)assert(accepts(s,'code',c));assert(matches(s,s.de));assert(matches(s,s.sci));assert(matches(s,s.en));}
console.log('PASS: all '+birds.length+' species searchable; accepted answers and synonyms, diacritics, collisions, intervals, error reset, hints, due dates, mastery, independent targets and import validation.');
