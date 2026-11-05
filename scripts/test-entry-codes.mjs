import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {accepts,matches} from '../dist/logic.js';

const birds=JSON.parse(readFileSync('dist/species.json')).species;
const find=id=>birds.find(b=>b.id===id);
for(const [id,primary] of [['taibeg1','TABG'],['tunbeg1','TUBG'],['cangoo','CANG'],['cacgoo1','CACG'],['eurbla','EUBB']]){
 const bird=find(id);
 assert.equal(bird.codes[0],primary);
 assert(accepts(bird,'code',primary.toLowerCase()));
 assert(matches(bird,primary));
}
assert(accepts(find('tunbeg1'),'code','BEGO'));
assert(accepts(find('taibeg1'),'code','TBGO'));
assert(!accepts(find('tunbeg1'),'code','TABG'));
assert(!accepts(find('taibeg1'),'code','TUBG'));
for(const [id,removed] of [['skylar','SKYL'],['grecor','GBCO'],['wooduc','CWDU'],['feapet2','FEPE'],['wilpta1','WIPT'],['paipar6','PAPA']])
 assert(!accepts(find(id),'code',removed));
for(const b of birds){
 for(const c of b.codes){assert(accepts(b,'code',c));assert(matches(b,c));}
}
console.log('PASS: specific entry codes, banding-code answers/search, current aliases, removed codes and bean-goose distinction.');
