import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {accepts,matches} from '../dist/logic.js';

const birds=JSON.parse(readFileSync('dist/species.json')).species;
const find=id=>birds.find(b=>b.id===id);
for(const [id,primary] of [['taibeg1','ANFA'],['tunbeg1','ANSE'],['cangoo','BRCA'],['cacgoo1','BRHU'],['eurbla','TUME'],['eurjay1','GAGL']]){
 const bird=find(id);
 assert.equal(bird.codes[0],primary);
 assert(accepts(bird,'code',primary.toLowerCase()));
 assert(matches(bird,primary));
}
assert(accepts(find('tunbeg1'),'code','BEGO'));
assert(accepts(find('tunbeg1'),'code','TUBG'));
assert(accepts(find('taibeg1'),'code','TABG'));
assert(accepts(find('eurjay1'),'code','EUJA'));
assert(accepts(find('eurjay1'),'code','ECFJ'));
assert(accepts(find('taibeg1'),'code','TBGO'));
assert(!accepts(find('tunbeg1'),'code','TABG'));
assert(!accepts(find('taibeg1'),'code','TUBG'));
for(const [id,removed] of [['skylar','SKYL'],['grecor','GBCO'],['wooduc','CWDU'],['feapet2','FEPE'],['wilpta1','WIPT'],['paipar6','PAPA']])
 assert(!accepts(find(id),'code',removed));
for(const b of birds){
 for(const c of b.codes){assert(accepts(b,'code',c));assert(matches(b,c));}
}
console.log('PASS: specific entry codes, banding-code answers/search, current aliases, removed codes and bean-goose distinction.');
