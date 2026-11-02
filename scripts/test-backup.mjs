import assert from 'node:assert/strict';
import {inspectBackup,backupSummary,backupFilename,backupPanel,backupPreview} from '../dist/backup.js';
import {migrateRecords} from '../dist/learning-model.js';
import {review} from '../dist/logic.js';
const ids=new Set(['eurbla','eursta']);
const record=review(undefined,true,1000);
const records={'eurbla:en':record,'eurbla:code':record,'eursta:nl':record};
const file={app:'BirdNames DE',version:1,exported:'2026-11-01T12:34:56.789Z',records};
const candidate=inspectBackup(file,ids);
assert.equal(candidate.count,3);assert.equal(candidate.species,2);assert.equal(candidate.skipped,0);
assert.deepEqual(candidate.records,migrateRecords(records));
assert.equal(backupSummary(records),'3 Lernziele für 2 Arten');
assert.equal(backupSummary({'eurbla:en':record},true),'1 learning target for 1 species');
assert.equal(backupFilename(file.exported),'birdnames-de-lernstand-2026-11-01T12-34-56Z.json');
assert.throws(()=>inspectBackup({...file,records:[]},ids));
assert.throws(()=>inspectBackup({...file,records:null},ids));
assert.equal(inspectBackup({...file,version:2},ids).count,3);
assert.throws(()=>inspectBackup({...file,version:3},ids));
assert.throws(()=>inspectBackup({...file,records:{'eurbla:en':{...record,streak:-1}}},ids));
assert.throws(()=>inspectBackup({...file,records:{'missing:en':record}},ids),/Keine unterstützten/);
const partial=inspectBackup({...file,records:{...records,'missing:en':record,'eurbla:unknown':record}},ids);
assert.equal(partial.skipped,2);assert.equal(partial.count,3);
const empty=inspectBackup({...file,records:{}},ids);assert.equal(empty.count,0);
assert.equal(inspectBackup({...file,exported:'invalid date'},ids).exported,null);
assert.equal(inspectBackup({...file,exported:undefined},ids).exported,null);
for(const english of [false,true]){
 const panel=backupPanel(english);
 assert(panel.includes('id="export"'));assert(panel.includes('id="import"'));
 assert(panel.includes('id="import-preview" hidden'));
 assert(!panel.includes('id="confirm-import"'));
 assert(backupPanel(english,false).includes(english?'cannot save your progress':'kann deinen Lernstand gerade nicht speichern'));
 const preview=backupPreview({candidate,current:{'eurbla:code':record},filename:'<script>alert(1)</script>.json',hasSession:true,english});
 assert(!preview.includes('<script>'));assert(preview.includes('&lt;script&gt;'));
 for(const id of ['confirm-import','cancel-import','export-before-import'])assert(preview.includes(`id="${id}"`));
 assert(preview.includes(english?'not be merged':'nicht zusammengeführt'));
 assert(preview.includes(english?'paused sessions will also be ended':'pausierten Einheiten werden beendet'));
 const emptyPreview=backupPreview({candidate:empty,current:records,filename:'empty.json',english});
 assert(emptyPreview.includes(english?'This backup is empty':'Diese Sicherung ist leer'));
 const partialPreview=backupPreview({candidate:partial,current:records,filename:'partial.json',english});
 assert(partialPreview.includes(english?'2 unsupported records':'2 nicht unterstützte Einträge'));
}
console.log('PASS: backup scope/counts, dated filenames, strict object schema, unknown/partial/empty files, escaped preview and explicit replacement actions.');

const {persistLearningState}=await import('../dist/learning-storage.js');
function fakeDB(mode){
 const db={saved:{records:{old:true},lesson:{old:true}},aborted:false};
 db.transaction=()=>{
  if(mode==='closed')throw Error('closed');
  const writes=[];
  const tx={objectStore:()=>({put:(value,key)=>{
   if(mode==='clone'&&writes.length)throw Error('clone failed');
   writes.push([key,value]);
  }}),abort:()=>{db.aborted=true;tx.onabort?.();}};
  queueMicrotask(()=>{
   if(db.aborted)return;
   if(mode==='quota'){tx.onerror();tx.onabort();return;}
   for(const [key,value]of writes)db.saved[key]=value;
   tx.oncomplete();
  });
  return tx;
 };
 return db;
}
const snapshot={records,session:null,pending:[]};
assert.equal(await persistLearningState(null,snapshot),false);
for(const mode of ['closed','quota','clone']){
 const db=fakeDB(mode);
 assert.equal(await persistLearningState(db,snapshot),false);
 assert.deepEqual(db.saved,{records:{old:true},lesson:{old:true}});
 if(mode==='clone')assert(db.aborted,'A partially queued write must be aborted');
}
const db=fakeDB('ok');assert.equal(await persistLearningState(db,snapshot),true);
assert.deepEqual(db.saved.records,records);assert.equal(db.saved['progress-version'],2);assert.equal(db.saved['daily-v2'],null);
assert.deepEqual(db.saved['lesson-state-v2'],{version:1,session:null,pending:[]});
console.log('PASS: replacement snapshots commit atomically; missing/closed storage, quota and synchronous write errors preserve previous data.');
