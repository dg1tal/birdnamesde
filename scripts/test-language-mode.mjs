import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {accepts,review,validProgress} from '../dist/logic.js';
import {validateLesson} from '../dist/study-state.js';
const birds=JSON.parse(readFileSync('dist/species.json')).species;
const names=JSON.parse(readFileSync('dist/german-names.json')).species;
for(const s of birds){s.germanNames=names[s.id]?.names||[];assert(accepts(s,'de',s.de));assert(accepts(s,'en',s.en));for(const n of s.germanNames)if(n.status==='alternative'&&!n.ambiguous)assert(accepts(s,'de',n.name));}
const greenfinch=birds.find(s=>s.de==='Grünfink');assert(accepts(greenfinch,'de','Gruenfink'));assert(!accepts(greenfinch,'de',greenfinch.en));
const historical={de:'Hauptname',aliases:{de:[],en:[]},germanNames:[{name:'Altname',status:'historical'},{name:'Doppeldeutig',status:'alternative',ambiguous:true}]};assert(!accepts(historical,'de','Altname'));assert(!accepts(historical,'de','Doppeldeutig'));
const id=birds[0].id,ids=new Set(birds.map(s=>s.id));const r=review(undefined,true,1000);const data={app:'BirdNames DE',version:1,records:{[id+':en']:r,[id+':de']:review(undefined,false,1000)}};assert.deepEqual(validProgress(data,ids),data.records);assert.equal(data.records[id+':en'].correct,1);assert.equal(data.records[id+':de'].correct,0);
assert(validateLesson({version:1,queue:[{id,t:'de',retry:0}],index:0,method:'text',answered:0,correct:0,firstAnswered:0,firstCorrect:0,done:false,paused:true,hint:false},ids));
console.log('PASS: all 313 German answers, current aliases, umlaut transliteration, historical/ambiguous rejection, independent export/import and German lesson recovery.');
