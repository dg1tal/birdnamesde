import assert from 'node:assert/strict';
import {loadLearningState,validateLearningSnapshot,persistLearningState,LEARNING_STATE_KEYS} from '../dist/learning-storage.js';
import {gradeRecord,RULES,lessonQueueLimit} from '../dist/learning-model.js';
import {validateLesson,recordLessonAnswer} from '../dist/study-state.js';
import {restoreLessonState} from '../dist/learning-settings.js';
import {inspectBackup,backupPanel,backupPreview} from '../dist/backup.js';
import {validTimestamp} from '../dist/progress-validation.js';

const ids=new Set(['eurbla']);
const record=gradeRecord(undefined,'de','text',{correct:true,now:100000000,gradeId:'a'});
const file={app:'BirdNames DE',version:2,records:{'eurbla:en':record}};
const raw={records:file.records,'progress-version':2,'daily-v2':null,'lesson-state-v2':{version:1,session:null,pending:[]}};
const state=validateLearningSnapshot(raw,ids);
assert.equal(state.records['eurbla:en'].attempts,1);
assert.equal(state.session,null);
assert.equal(inspectBackup(file,ids).count,1);
// Context and historical counters are optional in older files, but never coerced.
for(const location of ['outer','context','legacy']){
 for(const field of ['attempts','correct','streak','lapses','lessonFirstAttempts','lessonFirstCorrect','lessonRepeatAttempts']){
  for(const bad of ['oops',{},-1,0.5,Number.MAX_SAFE_INTEGER+1]){
   const r=structuredClone(record);
   const p=location==='outer'?r:location==='context'?r.contexts['de:recall']:(r.legacy={...record});
   p[field]=bad;
   assert.throws(()=>inspectBackup({...file,records:{'eurbla:en':r}},ids),`${location}.${field}=${bad}`);
  }
 }
}
for(const fields of [{correct:2},{lessonFirstCorrect:2},{lessonFirstAttempts:1,lessonRepeatAttempts:1}]){
 const r=structuredClone(record);Object.assign(r.contexts['de:recall'],fields);
 assert.throws(()=>inspectBackup({...file,records:{'eurbla:en':r}},ids));
}
for(const path of ['outer','context','legacy'])for(const field of ['due','last','introducedAt'])for(const bad of [NaN,Infinity,-1,1e308,'1000']){
 const r=structuredClone(record),p=path==='outer'?r:path==='context'?r.contexts['de:recall']:(r.legacy={...record});p[field]=bad;
 assert.throws(()=>inspectBackup({...file,records:{'eurbla:en':r}},ids));
}
assert(validTimestamp(0));assert(validTimestamp(8640000000000000));assert(!validTimestamp(8640000000000001));
const fractional=structuredClone(record);fractional.contexts['de:recall'].interval=.5;assert(inspectBackup({...file,records:{'eurbla:en':fractional}},ids));
const old={attempts:10,correct:8,streak:2,lapses:2,interval:3,due:1000,last:0,lastWrong:false};
const v1={app:'BirdNames DE',version:1,records:{'eurbla:en':old}};
const migrated=inspectBackup(v1,ids);assert.deepEqual(migrated.records['eurbla:en'].legacy,old);
assert.deepEqual(migrated.records['eurbla:en'].contexts,{});
let next=gradeRecord(inspectBackup(file,ids).records['eurbla:en'],'de','text',{correct:true,now:200000000,gradeId:'b'});
assert.equal(inspectBackup({...file,records:{'eurbla:en':next}},ids).records['eurbla:en'].contexts['de:recall'].lessonFirstAttempts,2);
assert.equal(inspectBackup({...file,records:{...file.records,'unknown:en':null}},ids).skipped,1);
assert.throws(()=>validateLearningSnapshot({...raw,records:{...file.records,'unknown:en':null}},ids));
for(const records of [null,[],0,{'eurbla:en':null}])assert.throws(()=>validateLearningSnapshot({...raw,records},ids));
for(const daily of [{date:'2026-02-30',introduced:[]},{date:'bad',introduced:[]},[]])assert.throws(()=>validateLearningSnapshot({...raw,'daily-v2':daily},ids));
for(const shared of [{version:3},{version:1,pending:[]},{version:1,session:null,pending:[null]},{version:1,session:{},pending:[]},{version:1,session:null,pending:[{}]}])assert.throws(()=>validateLearningSnapshot({...raw,'lesson-state-v2':shared},ids));
assert.throws(()=>inspectBackup({app:'BirdNames DE rescue',version:1,state:raw},ids));

// Fixed GB-sized membership: the regression must not depend on daily region data.
const gbIds=new Set(Array.from({length:875},(_,i)=>'bird'+i));
const make=queue=>({version:2,queue,index:0,method:'text',sourceLanguage:'sci',nameLanguage:'en',answered:0,correct:0,firstAnswered:0,firstCorrect:0,done:false,paused:true,hint:false,draft:'saved draft'});
const big=make([...gbIds].flatMap(id=>[{id,t:'en',retry:0},{id,t:'code',retry:0}]));
while(big.queue.length<1879){
 recordLessonAnswer(big,big.queue[big.index].retry>0);
 if(big.queue.length<1879){big.index++;big.done=false;}
}
assert.equal(big.answered,257);
for(const version of [1,2]){
 const restored=restoreLessonState({version:1,session:JSON.parse(JSON.stringify({...big,version})),pending:[]},null,null,false,gbIds,{strict:true}).session;
 assert.deepEqual(restored.queue,JSON.parse(JSON.stringify(big.queue)));assert.equal(restored.draft,'saved draft');
 assert.equal(recordLessonAnswer(restored,true),false,'Restored feedback cannot grade twice');
 restored.index++;restored.done=false;assert(recordLessonAnswer(restored,true));assert(validateLesson(restored,gbIds));
}
assert.equal(lessonQueueLimit(940),5640);
const maxIds=new Set(Array.from({length:940},(_,i)=>'bird'+i));
const max=make([...maxIds].flatMap(id=>['en','code'].flatMap(t=>Array.from({length:1+RULES.maxRetries},(_,retry)=>({id,t,retry})))));
assert(validateLesson(max,maxIds));max.queue.push({id:'bird0',t:'en',retry:2});assert.equal(validateLesson(max,maxIds),null);
assert.equal(validateLesson(make(Array.from({length:1881},()=>({id:'bird0',t:'en',retry:0}))),maxIds),null);

// Event adapter exercises the production loader and records every write.
function adapter(data=raw,mode='ok'){
 const req={},reads=[],writes=[];let tx;const db={closed:false,close(){this.closed=true;},createObjectStore(){},transaction(store,access){
  if(mode==='transaction-throw')throw Error('transaction');
  tx={error:null,abort(){tx.onabort?.();},objectStore:()=>({get(key){
   if(mode==='get-throw')throw Error('get');
   const read={get result(){if(mode==='result-throw')throw Error('result');return data[key];}};reads.push(read);return read;
  },put(value,key){writes.push([key,value]);}})};
  if(mode==='abort')queueMicrotask(()=>tx.onabort());
  else if(mode!=='read-hang')queueMicrotask(()=>tx.oncomplete?.());
  return tx;
 }};
 const indexedDB={open(){if(mode==='open-throw')throw Error('open');return req;}};
 const success=()=>{req.result=db;req.onsuccess();};
 return {indexedDB,req,db,writes,success,complete:()=>tx?.oncomplete?.()};
}
async function load(data=raw,mode='ok'){
 const a=adapter(data,mode);const p=loadLearningState({indexedDB:a.indexedDB,ids});
 if(mode!=='open-throw')a.success();
 return {...a,result:await p};
}
const loaded=await load();assert.equal(loaded.result.status,'ready');assert.equal(loaded.writes.length,0);
const damaged=await load({...raw,records:{'eurbla:en':null}});
assert.equal(damaged.result.status,'recovery');assert.deepEqual(damaged.result.raw.records,{'eurbla:en':null});assert.equal(damaged.writes.length,0);
for(const mode of ['open-throw','transaction-throw','get-throw','abort','result-throw']){
 const a=await load(raw,mode);assert(['recovery','unavailable'].includes(a.result.status));assert.equal(a.writes.length,0);
}
for(const mode of ['blocked','read-hang']){
 let expire,cleared=false;const a=adapter(raw,mode==='blocked'?'ok':mode);
 const p=loadLearningState({indexedDB:a.indexedDB,ids,setTimer(fn,ms){assert.equal(ms,10000);expire=fn;return 1;},clearTimer(){cleared=true;}});
 if(mode==='read-hang')a.success();else a.req.onblocked?.();
 expire();const result=await p;assert.equal(result.status,'unavailable');assert(cleared);
 if(mode==='blocked'){a.success();assert(a.db.closed);}else a.complete();
 assert.equal(result.state,null);assert.equal(a.writes.length,0);
}
// An explicit replacement can commit; a failed transaction keeps the source intact.
const success=await persistLearningState(loaded.db,{records:state.records,session:null,pending:[],daily:null});assert(success);
assert.equal(loaded.writes.length,4);assert.deepEqual(raw.records,file.records);
for(const english of [false,true]){
 const html=backupPanel(english,false,{recovery:true,readable:true});assert(!html.includes('id="reset"'));assert(html.includes(english?'rescue file':'Rettungsdatei'));
 assert(backupPanel(english,false,{recovery:true}).includes('id="export" type="button" disabled'));
 const preview=backupPreview({candidate:inspectBackup(file,ids),current:{},filename:'backup.json',hasSession:true,english,recovery:true,readable:false});
 assert(preview.includes(english?'could not be validated':'konnte nicht geprüft'));assert(preview.includes('id="export-before-import" disabled'));
}
console.log('PASS: large round recovery, strict counters/dates, compatible backups, safe startup failures/timeouts, raw preservation and recovery UI.');
