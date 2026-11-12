import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NAME_LANGUAGES,primaryName,acceptedNames,loadNameData,normalizeAnswer,hasLanguagePair,targetName,validateNameData} from '../dist/name-languages.js';
import {accepts,matches,review,validProgress} from '../dist/logic.js';
import {searchLookup} from '../dist/lookup-search.js';
import {newNamesText} from '../dist/learning-selection-copy.js';
import {explanationLanguage} from '../dist/scientific-names.js';
import {validateLesson} from '../dist/study-state.js';
const birds=JSON.parse(readFileSync('dist/species.json')).species;
const original=JSON.parse(readFileSync('data/official-records.json')).names;
const data=JSON.parse(readFileSync('dist/languages/nl.json'));
const available=await loadNameData(birds,async path=>({ok:true,json:async()=>JSON.parse(readFileSync('dist/'+path))}));
assert.deepEqual(available,['de','en','sci','nl','fi']);assert.equal(Object.keys(data.species).length,birds.filter(s=>original[s.id].Dutch).length);
const ids=new Set(birds.map(s=>s.id));
const finnish=JSON.parse(readFileSync('dist/languages/fi.json'));
assert.equal(Object.keys(finnish.species).length,933);
assert.equal(finnish.meta.column,'Finnish');
for(const s of birds){
 assert.equal(primaryName(s,'nl'),original[s.id].Dutch);
 assert.equal(primaryName(s,'fi'),original[s.id].Finnish?.trim()||'');
 assert.equal(targetName(s,'fi'),primaryName(s,'fi'));
 for(const {code} of NAME_LANGUAGES){if(primaryName(s,code))assert(accepts(s,code,primaryName(s,code)));assert(!accepts(s,code,''));assert(!accepts(s,code,'!!!'));assert(matches(s,primaryName(s,code)));}
 for(const source of available)for(const target of available)assert.equal(hasLanguagePair(s,source,target),!!primaryName(s,source)&&!!primaryName(s,target));
 assert.equal(targetName(s,'nl'),original[s.id].Dutch);
}
const robin=birds.find(s=>s.de==='Rotkehlchen');assert.equal(primaryName(robin,'nl'),'Roodborst');assert(accepts(robin,'nl',' roodborst '));assert(!accepts(robin,'nl','European Robin'));
assert.equal(primaryName(robin,'sci'),robin.sci);assert.deepEqual(acceptedNames(robin,'sci'),[robin.sci]);
assert(accepts(robin,'sci',robin.sci.toLowerCase()));assert(!accepts(robin,'sci',robin.de));
assert(hasLanguagePair(robin,'de','sci'));assert(hasLanguagePair(robin,'sci','de'));
for(const common of ['de','en','nl','fi']){
 assert(hasLanguagePair(robin,common,'sci'));
 assert.equal(targetName(robin,'sci'),robin.sci);
 assert(accepts(robin,'sci',targetName(robin,'sci')));
 assert(hasLanguagePair(robin,'sci',common));
 assert(accepts(robin,common,targetName(robin,common)));
}
assert(normalizeAnswer('Журавль','uk'));assert(normalizeAnswer('山雀','zh'));assert.equal(normalizeAnswer('Ĳsvogel','nl'),normalizeAnswer('ijsvogel','nl'));
assert.deepEqual(acceptedNames(robin,'xx'),[]);assert(!accepts(robin,'xx',''));
const blank={...robin,names:{}};assert(!hasLanguagePair(blank,'en','nl'));assert(!hasLanguagePair(blank,'nl','code'));
const progress=review(undefined,true,1000);const records={[robin.id+':en']:progress,[robin.id+':de']:{...progress,streak:0},[robin.id+':nl']:{...progress,correct:0,streak:0},[robin.id+':sci']:progress,[robin.id+':fi']:progress};
assert.deepEqual(validProgress({app:'BirdNames DE',version:1,records},ids),records);
assert.equal(Object.keys(validProgress({app:'BirdNames DE',version:1,records:{[robin.id+':nl:extra']:progress}},ids)).length,0);
const lesson={version:1,queue:[{id:robin.id,t:'nl',retry:0}],sourceLanguage:'en',nameLanguage:'nl',index:0,method:'text',answered:0,correct:0,firstAnswered:0,firstCorrect:0,done:false,paused:true,hint:false};assert(validateLesson(lesson,ids));assert(!validateLesson({...lesson,sourceLanguage:'xx'},ids));
assert(validateLesson({...lesson,sourceLanguage:'de',nameLanguage:'sci',queue:[{id:robin.id,t:'sci',retry:0}]},ids));
assert(validateLesson({...lesson,sourceLanguage:undefined,nameLanguage:undefined,queue:[{id:robin.id,t:'en',retry:0}]},ids));
assert.throws(()=>validateNameData({...data,language:'en'},'nl',ids));assert.throws(()=>validateNameData({...data,species:{unknown:{name:'X',aliases:[]}}},'nl',ids));
console.log('PASS: sourced Dutch and Finnish names across the expanded catalogue, all registered language pairs, search/answers, missing names, Unicode safety, legacy and multilingual progress/import/session recovery.');

assert.equal(primaryName(robin,'fi'),'punarinta');
const result=searchLookup(birds,'punarinta')[0];assert.equal(result.species.id,robin.id);assert.equal(result.matches[0].language,'fi');
assert(accepts(robin,'fi',' PUNARINTA '));assert(!accepts(robin,'fi',robin.en));
const tit=birds.find(s=>s.de==='Kohlmeise');assert(accepts(tit,'fi','talitiainen'));
const jay=birds.find(s=>s.de==='Eichelhäher');assert(accepts(jay,'fi','NÄRHI'));
const missing=birds.filter(s=>!primaryName(s,'fi'));assert.equal(missing.length,7);
for(const s of missing){
 assert(!hasLanguagePair(s,'de','fi'));assert(!hasLanguagePair(s,'fi','de'));assert(!hasLanguagePair(s,'fi','code'));
 assert(!accepts(s,'fi',s.en));assert.deepEqual(acceptedNames(s,'fi'),[]);
}
for(const [sourceLanguage,nameLanguage] of [['de','fi'],['fi','en']])assert(validateLesson({...lesson,sourceLanguage,nameLanguage,queue:[{id:robin.id,t:nameLanguage,retry:0}]},ids));
const unavailable=structuredClone(birds);for(const s of unavailable)s.names={};
const warn=console.warn;console.warn=()=>{};
let fallback;
try{fallback=await loadNameData(unavailable,async path=>({ok:path!=='languages/fi.json',json:async()=>JSON.parse(readFileSync('dist/'+path))}));}finally{console.warn=warn;}
assert(!fallback.includes('fi'));assert(fallback.includes('nl'));assert(unavailable.every(s=>!hasLanguagePair(s,'de','fi')));
console.log('PASS: Finnish source fidelity, Unicode answers, both directions, missing-name exclusion and failed-load isolation.');

assert.equal(newNamesText(1,'fi',false),'1 neuer finnischer Vogelname');
assert.equal(newNamesText(3,'fi',true),'3 new Finnish bird names');
assert.equal(explanationLanguage('fi','de'),'de');assert.equal(explanationLanguage('fi','en'),'en');
