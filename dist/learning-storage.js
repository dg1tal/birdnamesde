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
