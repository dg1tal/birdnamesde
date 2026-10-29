import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NAME_LANGUAGES,primaryName,acceptedNames,loadNameData,normalizeAnswer,hasLanguagePair,targetName,validateNameData} from '../dist/name-languages.js';
import {accepts,matches,review,validProgress} from '../dist/logic.js';
import {validateLesson} from '../dist/study-state.js';
const birds=JSON.parse(readFileSync('dist/species.json')).species;
const original=JSON.parse(readFileSync('data/official-records.json')).names;
const data=JSON.parse(readFileSync('dist/languages/nl.json'));
const available=await loadNameData(birds,async path=>({ok:true,json:async()=>JSON.parse(readFileSync('dist/'+path))}));
assert.deepEqual(available,['de','en','nl']);assert.equal(Object.keys(data.species).length,313);
const ids=new Set(birds.map(s=>s.id));
for(const s of birds){
 assert.equal(primaryName(s,'nl'),original[s.id].Dutch);
 for(const {code} of NAME_LANGUAGES){assert(accepts(s,code,primaryName(s,code)));assert(!accepts(s,code,''));assert(!accepts(s,code,'!!!'));assert(matches(s,primaryName(s,code)));}
 for(const source of available)for(const target of available)assert(hasLanguagePair(s,source,target));
 assert.equal(targetName(s,'nl'),original[s.id].Dutch);
}
const robin=birds.find(s=>s.de==='Rotkehlchen');assert.equal(primaryName(robin,'nl'),'Roodborst');assert(accepts(robin,'nl',' roodborst '));assert(!accepts(robin,'nl','European Robin'));
assert(normalizeAnswer('Журавль','uk'));assert(normalizeAnswer('山雀','zh'));assert.equal(normalizeAnswer('Ĳsvogel','nl'),normalizeAnswer('ijsvogel','nl'));
assert.deepEqual(acceptedNames(robin,'xx'),[]);assert(!accepts(robin,'xx',''));
const blank={...robin,names:{}};assert(!hasLanguagePair(blank,'en','nl'));assert(!hasLanguagePair(blank,'nl','code'));
const progress=review(undefined,true,1000);const records={[robin.id+':en']:progress,[robin.id+':de']:{...progress,streak:0},[robin.id+':nl']:{...progress,correct:0,streak:0}};
assert.deepEqual(validProgress({app:'BirdNames DE',version:1,records},ids),records);
assert.equal(Object.keys(validProgress({app:'BirdNames DE',version:1,records:{[robin.id+':nl:extra']:progress}},ids)).length,0);
const lesson={version:1,queue:[{id:robin.id,t:'nl',retry:0}],sourceLanguage:'en',nameLanguage:'nl',index:0,method:'text',answered:0,correct:0,firstAnswered:0,firstCorrect:0,done:false,paused:true,hint:false};assert(validateLesson(lesson,ids));assert(!validateLesson({...lesson,sourceLanguage:'xx'},ids));
assert(validateLesson({...lesson,sourceLanguage:undefined,nameLanguage:undefined,queue:[{id:robin.id,t:'en',retry:0}]},ids));
assert.throws(()=>validateNameData({...data,language:'en'},'nl',ids));assert.throws(()=>validateNameData({...data,species:{unknown:{name:'X',aliases:[]}}},'nl',ids));
console.log('PASS: 313 sourced Dutch names, all registered language pairs, search/answers, missing names, Unicode safety, legacy and Dutch progress/import/session recovery.');
