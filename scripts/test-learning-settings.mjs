import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {LEARNING_COUNTRIES,LEARNING_REGION_DEFAULTS,loadSharedUI,migrateLearningRegion,restoreLessonState,selectionMessage} from '../dist/learning-settings.js';
const defaults={lookup:{query:''},learn:{region:'',sourceLanguage:'de',nameLanguage:'en'}};
const values=new Map([['birdnames-ui',JSON.stringify({learn:{region:'GB-ENG-CON',sourceLanguage:'de',nameLanguage:'nl'}})],['birdnames-ui-en',JSON.stringify({learn:{region:'NL'}})]]);
const storage={getItem:key=>values.get(key)};
const migrated=loadSharedUI(defaults,storage,false);assert.equal(migrated.learn.region,'GB-ENG-CON');
values.set('birdnames-ui-shared-v1',JSON.stringify(migrated));assert.deepEqual(loadSharedUI(defaults,storage,true),migrated);
values.set('birdnames-ui-shared-v1','broken');assert.equal(loadSharedUI(defaults,storage,true).learn.region,'NL');
const ids=new Set(['eurbla']);
const lesson={version:1,queue:[{id:'eurbla',t:'nl',retry:0}],index:0,method:'text',answered:0,correct:0,firstAnswered:0,firstCorrect:0,done:false,paused:false,hint:false,draft:'Mer',regionLabel:'Cornwall'};
const de={...lesson,sourceLanguage:'de'},en={...lesson,sourceLanguage:'en'};
const state=restoreLessonState(undefined,de,en,false,ids);assert.equal(state.session.sourceLanguage,'de');assert.equal(state.session.draft,'Mer');assert.equal(state.pending.length,1);assert.equal(state.pending[0].sourceLanguage,'en');
assert.deepEqual(restoreLessonState({version:1,...state},de,en,true,ids),state);
assert.deepEqual(restoreLessonState({version:1,session:null,pending:[]},de,en,true,ids),{session:null,pending:[]});
assert.equal(restoreLessonState(undefined,null,en,false,ids).session.sourceLanguage,'en');
assert(!selectionMessage({same:true,count:0},false).includes('Wortschatz'));
assert(selectionMessage({same:false,count:0,unavailable:true},true).includes('regional list'));
assert.equal(selectionMessage({count:1},false),'1 Art passt zur Auswahl.');

assert.match(selectionMessage({count:0,noGroups:true},true),/No species group/);
assert.match(selectionMessage({count:0,scope:'due'},false),/keine Wiederholungen fällig/);
assert.match(selectionMessage({count:0,scope:'wrong'},true),/last answered incorrectly/);
assert.equal(selectionMessage({count:3,scope:'due'},true),'3 species match your selection.');
assert.match(selectionMessage({count:0,unavailable:true},false),/regionale Liste/);

console.log('PASS: shared interface-independent settings, both legacy lessons preserved, cleared lessons stay cleared, drafts/region retained and actionable selection messages.');

// Existing learning regions must not silently restrict the new lookup filter.
const regionDefaults={lookup:{query:'',region:'',regionMode:'all'},learn:{region:''}};
const oldPreferences={getItem:key=>key==='birdnames-ui-shared-v1'?JSON.stringify({lookup:{query:'Amsel',level:'1'},learn:{region:'GB-ENG-CON'}}):null};
const lookupMigration=loadSharedUI(regionDefaults,oldPreferences,false);
assert.equal(lookupMigration.lookup.query,'Amsel');
assert.equal(lookupMigration.lookup.region,'');
assert.equal(lookupMigration.lookup.regionMode,'all');
assert.equal(lookupMigration.learn.region,'GB-ENG-CON');
const separateRegions={getItem:()=>JSON.stringify({lookup:{region:'DE-BY',regionMode:'recent'},learn:{region:'NL'}})};
const restoredRegions=loadSharedUI(regionDefaults,separateRegions,true);
assert.equal(restoredRegions.lookup.region,'DE-BY');
assert.equal(restoredRegions.lookup.regionMode,'recent');
assert.equal(restoredRegions.learn.region,'NL');
console.log('PASS: lookup starts with all regions for legacy settings and restores its own region independently of learning.');

for(const english of [false,true]){
 assert.match(selectionMessage({count:0,noFrequency:true},english),english?/No frequency group/:/Keine Häufigkeitsstufe/);
 // Current additions may still supply species even when no historical group is selected.
 assert.equal(selectionMessage({count:2,noFrequency:true},english),english?'2 species match your selection.':'2 Arten passen zur Auswahl.');
 assert.match(selectionMessage({count:0,noFrequency:true,noGroups:true},english),english?/No species group/:/Keine Artengruppe/);
 assert.match(selectionMessage({count:0,noFrequency:true,unavailable:true},english),english?/regional list/:/regionale Liste/);
}
console.log('PASS: empty seasonal selections explain the missing frequency group without rejecting available current additions.');

// New rounds require geography; only settings are migrated, never lesson queues.
assert.deepEqual(LEARNING_COUNTRIES.map(c=>c.code),JSON.parse(readFileSync('data/region-countries.json')).map(c=>c.code));
const newDefaults={lookup:{region:''},learn:{sourceLanguage:'de',nameLanguage:'en',...structuredClone(LEARNING_REGION_DEFAULTS)}};
const firstVisit=loadSharedUI(newDefaults,{getItem:()=>null},false);
assert.deepEqual(firstVisit.learn,newDefaults.learn);assert(!firstVisit.learn.regionMigrationNotice);
for(const key of ['birdnames-ui-shared-v1','birdnames-ui','birdnames-ui-en']){
 const old={region:'',regionMode:'all',frequencyGroups:['rare'],levels:[2],sourceLanguage:'nl',nameLanguage:'sci',method:'text',groups:['Enten'],ids:['eurbla'],scope:'wrong',count:'25',photos:false};
 const storage={getItem:k=>k===key?JSON.stringify({lookup:{region:''},learn:old}):null};
 const loaded=loadSharedUI(newDefaults,storage,false);
 assert.equal(loaded.learn.region,'DE');assert.equal(loaded.learn.regionMode,'seasonal');assert.deepEqual(loaded.learn.frequencyGroups,['frequent','medium']);
 assert(loaded.learn.regionMigrationNotice);assert(!('levels' in loaded.learn));assert.equal(loaded.lookup.region,'');
 for(const field of ['sourceLanguage','nameLanguage','method','groups','ids','scope','count','photos'])assert.deepEqual(loaded.learn[field],old[field]);
 assert.equal(old.region,'');assert.deepEqual(old.levels,[2]);
 const dismissed={...loaded.learn,regionMigrationNotice:false};
 assert.equal(migrateLearningRegion(dismissed,dismissed).regionMigrationNotice,false);
}
for(const region of ['DE','NL','GB','GB-ENG-CON','DE-BY-GAP','FR']){
 const saved={region,regionMode:'recent',frequencyGroups:['rare'],levels:[]};
 const loaded=migrateLearningRegion(saved,saved);
 assert.equal(loaded.region,region);assert.equal(loaded.regionMode,'recent');assert.deepEqual(loaded.frequencyGroups,['rare']);assert(!loaded.regionMigrationNotice);assert(!('levels' in loaded));
}
for(const region of ['',null,undefined,'garbage'])assert.equal(migrateLearningRegion({region},{region}).region,'DE');
for(const english of [false,true]){
 assert(!selectionMessage({unavailable:true},english).includes(english?'remove':'entferne'));
 assert(!selectionMessage({count:0},english).includes(english?'packages':'Artenpakete'));
}
console.log('PASS: regional defaults, migration of all old preference keys, retained selections and notice dismissal; lookup and paused lessons stay independent.');
