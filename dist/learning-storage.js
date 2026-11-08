import {validateRecords,validateDaily} from './progress-validation.js?v=20261105-recovery1';
import {migrateRecords} from './learning-model.js?v=20261105-recovery1';
import {restoreLessonState} from './learning-settings.js?v=20261108-quality1';

// The records and saved lessons form one atomic snapshot. Callers may publish
// imported state in memory only after this transaction has committed.
export function persistLearningState(db,state){
 if(!db)return Promise.resolve(false);
 return new Promise(resolve=>{
  let tx;
  try{
   tx=db.transaction('state','readwrite');
   tx.oncomplete=()=>resolve(true);
   tx.onerror=tx.onabort=()=>resolve(false);
   const store=tx.objectStore('state');
   store.put(state.records,'records');
   store.put(2,'progress-version');
   store.put(state.daily||null,'daily-v2');
   store.put({version:1,session:state.session,pending:state.pending},'lesson-state-v2');
  }catch{
   try{tx?.abort();}catch{}
   resolve(false);
  }
 });
}

export const LEARNING_STATE_KEYS=['records','progress-version','daily-v2','lesson-state-v2','lesson','lesson-en'];

// All validation happens before publishing state or permitting any normal write.
export function validateLearningSnapshot(raw,ids,english=false){
 if(raw['progress-version']!==undefined&&![1,2].includes(raw['progress-version']))throw Error('Unsupported progress version');
 const records=validateRecords(raw.records===undefined?{}:raw.records,ids,{strictKeys:true});
 const daily=validateDaily(raw['daily-v2']);
 const restored=restoreLessonState(raw['lesson-state-v2'],raw.lesson,raw['lesson-en'],english,ids,{strict:true});
 return {records:migrateRecords(records),daily,session:restored.session,pending:restored.pending};
}
export function loadLearningState({indexedDB,ids,english=false,timeoutMs=10000,setTimer=setTimeout,clearTimer=clearTimeout}){
 return new Promise(resolve=>{
  let settled=false,db=null,tx=null,raw=null,timer;
  const finish=(status,state=null,error=null)=>{
   if(settled)return;settled=true;clearTimer(timer);
   resolve({status,db,raw,state,error});
  };
  const failed=error=>finish(raw?'recovery':'unavailable',null,error);
  timer=setTimer(()=>{
   if(settled)return;
   failed(Error('Storage initialization timed out'));
   try{tx?.abort();}catch{}
  },timeoutMs);
  try{
   const request=indexedDB.open('birdnames-de',1);
   request.onerror=()=>failed(request.error);
   request.onupgradeneeded=()=>{
    if(settled){try{request.transaction.abort();}catch{}return;}
    try{request.result.createObjectStore('state');}catch(error){failed(error);try{request.transaction.abort();}catch{}}
   };
   request.onsuccess=()=>{
    if(settled){request.result.close();return;}
    try{
     db=request.result;tx=db.transaction('state');
     tx.onerror=tx.onabort=()=>failed(tx.error||Error('Storage read aborted'));
     const store=tx.objectStore('state'),reads=LEARNING_STATE_KEYS.map(key=>[key,store.get(key)]);
     tx.oncomplete=()=>{
      if(settled)return;
      try{
       raw=Object.fromEntries(reads.map(([key,read])=>[key,read.result]));
       finish('ready',validateLearningSnapshot(raw,ids,english));
      }catch(error){failed(error);}
     };
    }catch(error){failed(error);}
   };
  }catch(error){failed(error);}
 });
}
