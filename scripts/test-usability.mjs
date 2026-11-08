import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {statsContext,statsPracticeSettings,validateSavedSpecies,restoreEndedRound} from '../dist/usability-state.js';
import {inspectBackup,backupPreview} from '../dist/backup.js';
import {persistLearningState,validateLearningSnapshot} from '../dist/learning-storage.js';
import {loadSharedUI} from '../dist/learning-settings.js';
import {lessonProgress,recordLessonAnswer} from '../dist/study-state.js';
import {encodeBackupFile,decodeBackupFile} from '../dist/backup-file.js';
const learn={sourceLanguage:'de',nameLanguage:'en',target:'en',method:'mc',region:'DE'};
const original=structuredClone(learn);
const stats=statsContext(null,learn);stats.nameLanguage='nl';stats.method='text';
assert.deepEqual(learn,original);
assert.deepEqual(statsPracticeSettings(learn,stats),{...learn,sourceLanguage:'de',nameLanguage:'nl',target:'nl',method:'text'});
assert.equal(statsPracticeSettings(learn,{...stats,method:'think'}).method,'mc');
assert.equal(statsPracticeSettings({...learn,method:'flash'},{...stats,method:'think'}).method,'think');
const preferences=loadSharedUI({learn,lookup:{}},{getItem:()=>JSON.stringify({learn,stats})},false);
assert.deepEqual(preferences.stats,stats);assert.deepEqual(preferences.learn.nameLanguage,'en');
const ids=new Set(['eurbla','blutit']);
assert.deepEqual(validateSavedSpecies(['eurbla','eurbla','unknown'],ids).ids,['eurbla','unknown']);
assert.deepEqual(validateSavedSpecies(['eurbla','unknown'],ids,{importing:true}),{ids:['eurbla'],skipped:1});
for(const bad of [null,{},[''],[1],['a'.repeat(101)]])assert.throws(()=>validateSavedSpecies(bad,ids));
const file={app:'BirdNames DE',version:3,exported:new Date().toISOString(),records:{},daily:null,savedSpecies:['eurbla','unknown','eurbla']};
const candidate=inspectBackup(file,ids);
assert.equal(candidate.count,0);assert.deepEqual(candidate.savedSpecies,['eurbla']);assert.equal(candidate.skippedSaved,1);
for(const english of [false,true]){
 const html=backupPreview({candidate,current:{},currentSavedSpecies:['blutit'],filename:'list.json',english});
 assert(!html.includes(english?'This backup is empty':'Diese Sicherung ist leer'));
 assert(html.includes(english?'list will be replaced':'wird vollständig ersetzt'));
 assert(html.includes(english?'unknown saved species':'unbekannte gemerkte Arten'));
 const old=inspectBackup({...file,version:2},ids);
 assert.equal(old.savedSpecies,null);
 assert(backupPreview({candidate:old,current:{},filename:'old.json',english}).includes(english?'current list is retained':'aktuelle Merkliste bleibt erhalten'));
}
assert.throws(()=>inspectBackup({...file,savedSpecies:null},ids));
assert.throws(()=>inspectBackup({...file,savedSpecies:undefined},ids));
const encoded=await encodeBackupFile(file,'list.json');
assert.deepEqual((await decodeBackupFile(Object.assign(encoded.blob,{name:encoded.filename}))).savedSpecies,file.savedSpecies);
const state=validateLearningSnapshot({'saved-species-v1':['unknown','eurbla']},ids);
assert.deepEqual(state.savedSpecies,['unknown','eurbla']);
assert.deepEqual(validateLearningSnapshot({},ids).savedSpecies,[]);
assert.throws(()=>validateLearningSnapshot({'saved-species-v1':null},ids));
// A failed import must not write either progress or list; successful snapshot
// publication occurs only after the single transaction completes.
for(const fail of [false,true]){
 const stored={records:{before:true},'saved-species-v1':['blutit']};
 const db={transaction(){const writes=[];const tx={objectStore:()=>({put(value,key){writes.push([key,value]);}}),abort(){}};queueMicrotask(()=>{if(fail)tx.onerror();else{for(const [k,v]of writes)stored[k]=v;tx.oncomplete();}});return tx;}};
 assert.equal(await persistLearningState(db,{records:{},daily:null,session:null,pending:[],savedSpecies:['eurbla']}),!fail);
 assert.deepEqual(stored['saved-species-v1'],fail?['blutit']:['eurbla']);
 assert.deepEqual(stored.records,fail?{before:true}:{});
}
// Run the actual end-round handler; undo captures only rounds, not learning data.
const source=readFileSync('dist/app.js','utf8');
const launchSource=source.slice(source.indexOf('const launch=preset=>'),source.indexOf("  $('#practice-due')",source.indexOf('const launch=preset=>')));
const launchContext={endedRound:null,ui:{learn:structuredClone(learn)},context:stats,statsPracticeSettings,nameTarget:'en',saveUI(){},learn(){},location:{hash:'#statistik'},skipNextRoute:false,setActiveNav(){},window:{scrollTo(){}},focusHeading(){}};
vm.createContext(launchContext);vm.runInContext(launchSource+';launch({scope:"due"});',launchContext);
assert.equal(launchContext.ui.learn.target,'mixed');assert.equal(launchContext.ui.learn.nameLanguage,'nl');assert.equal(launchContext.ui.learn.method,'text');
const handler=source.slice(source.indexOf('async function endLesson()'),source.indexOf('function showSummary('));
const round={queue:[{id:'eurbla',t:'en',retry:0},{id:'blutit',t:'en',retry:0}],index:0,done:true,result:{correct:true,answer:'Blackbird'},answered:1,correct:1,firstAnswered:1,firstCorrect:1,draft:'retained',introIndex:1,method:'text',paused:false};
const pending=[{id:'older-1'},{id:'older-2'}];
for(const succeed of [true,false]){
 const context={session:structuredClone(round),pendingLessons:structuredClone(pending),records:{stable:true},daily:{stable:true},savedSpecies:['eurbla'],endedRound:null,structuredClone,lessonProgress,english:false,save:async()=>succeed,announce(){},showSummary(){}};
 vm.createContext(context);vm.runInContext(handler,context);await context.endLesson();
 if(!succeed){assert.equal(context.session.draft,'retained');assert.equal(context.pendingLessons.length,2);assert.equal(context.endedRound,null);continue;}
 assert.equal(context.session.id,'older-1');
 const restored=restoreEndedRound(context.endedRound);
 assert.deepEqual(restored.session,round);assert.deepEqual(restored.pending,pending);
 assert.deepEqual(context.records,{stable:true});assert.deepEqual(context.daily,{stable:true});
 assert.equal(recordLessonAnswer(restored.session,true,'again'),false);
 assert.equal(restored.session.answered,1);
}
console.log('PASS: independent statistics, explicit practice context, version-3 list-only/legacy backups, validation, atomic list/progress replacement and production end-round undo without duplicate grading.');
