// Code systems are learning targets, not name languages.
export const DDA_SOURCE='https://www.dda-web.de/monitoring/mhb/artkuerzel';
export const isCodeTarget=target=>target==='code'||target==='dda';
export const codeTarget=settings=>settings.codeSystem==='dda'?'dda':'code';
export const learningTargets=settings=>settings.target==='mixed'?[settings.nameLanguage,codeTarget(settings)]:[settings.target==='code'?codeTarget(settings):settings.target];
export const codeLabel=(target,english=false)=>target==='dda'?(english?'DDA abbreviations':'DDA-Artkürzel'):(english?'eBird entry codes':'eBird-Kurzcodes');
export const normalizeCode=value=>String(value??'').normalize('NFKC').trim().toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss');
export const codeAnswers=(species,target)=>target==='dda'?(species.dda?[species.dda.code]:[]):species.codes||[];
export function validDdaEntry(entry){
 return !!entry&&typeof entry==='object'&&!Array.isArray(entry)&&Number.isSafeInteger(entry.sourceId)&&entry.sourceId>0&&typeof entry.name==='string'&&entry.name.length>0&&entry.name.length<=300&&typeof entry.scientificName==='string'&&entry.scientificName.length>0&&entry.scientificName.length<=300&&typeof entry.code==='string'&&/^[A-ZÄÖÜ][a-zäöüß]{0,2}$/.test(entry.code)&&!!entry.scope&&typeof entry.scope==='object'&&!Array.isArray(entry.scope)&&Object.keys(entry.scope).every(k=>['de','en'].includes(k)&&typeof entry.scope[k]==='string'&&entry.scope[k].length<=1000);
}
export function validateDdaData(data,ids){
 if(data?.version!==1||!data.meta||data.meta.sourceUrl!==DDA_SOURCE||typeof data.meta.sourceStand!=='string'||data.meta.sourceStand.length>80||!Number.isFinite(Date.parse(data.meta.fetchedAt))||Date.parse(data.meta.fetchedAt)>Date.now()+300000||!data.species||Array.isArray(data.species)||typeof data.species!=='object'||!Object.keys(data.species).length||!Object.entries(data.species).every(([id,e])=>ids.has(id)&&validDdaEntry(e)))throw Error('Invalid DDA data');
 if(new Set(Object.values(data.species).map(e=>e.sourceId)).size!==Object.keys(data.species).length)throw Error('Duplicate DDA source ID');
 return data;
}
export const ddaDefinition=entry=>JSON.stringify([entry.sourceId,entry.scientificName,entry.code,entry.scope.de||'',entry.scope.en||'']);
// Keep answer totals, but changes to an answer or its scope need fresh evidence.
export function reconcileDdaRecords(records,birds,now=Date.now()){
 for(const bird of birds){
  const record=records[bird.id+':dda'];if(!record||!bird.dda)continue;
  const definition=ddaDefinition(bird.dda);
  if(record.ddaDefinition&&record.ddaDefinition!==definition){
   for(const context of Object.values(record.contexts||{}))Object.assign(context,{confirmations:0,streak:0,stage:0,initialSuccess:false,interval:0,due:now});
   Object.assign(record,{streak:0,interval:0,due:now});
  }
  record.ddaDefinition=definition;
 }
 return records;
}
export function studySpecies(birds,item){
 const bird=birds.find(b=>b.id===item.id);
 return bird&&item.t==='dda'&&item.dda?{...bird,dda:item.dda}:bird;
}
