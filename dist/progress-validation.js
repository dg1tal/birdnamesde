import {isNameLanguage} from './name-languages.js?v=20261108-names2026';

const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const invalid=()=>{throw Error('Ungültige Lernwerte.');};
export const validTimestamp=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&Number.isFinite(new Date(value).getTime());
function counters(p,required=[]){
 for(const field of new Set([...required,'attempts','correct','streak','lapses','confirmations','stage','lessonFirstAttempts','lessonFirstCorrect','lessonRepeatAttempts'])){
  if((required.includes(field)||p[field]!==undefined)&&(!Number.isSafeInteger(p[field])||p[field]<0))invalid();
 }
 if(p.correct!==undefined&&p.attempts!==undefined&&p.correct>p.attempts)invalid();
 if(p.streak!==undefined&&p.correct!==undefined&&p.streak>p.correct)invalid();
 if(p.confirmations!==undefined&&p.correct!==undefined&&p.confirmations>p.correct)invalid();
 if((p.lessonFirstCorrect||0)>(p.lessonFirstAttempts||0))invalid();
 if(p.attempts!==undefined&&(p.lessonFirstAttempts||0)+(p.lessonRepeatAttempts||0)>p.attempts)invalid();
}
function dates(p,required=[]){
 for(const field of ['due','last','introducedAt'])if((required.includes(field)||p[field]!==undefined)&&!validTimestamp(p[field]))invalid();
 if(p.interval!==undefined&&(typeof p.interval!=='number'||!Number.isFinite(p.interval)||p.interval<0))invalid();
}
export function validateRecord(p){
 if(!object(p))invalid();
 counters(p,['attempts','correct','streak','lapses']);dates(p,['due','last']);
 if(typeof p.interval!=='number'||typeof p.lastWrong!=='boolean')invalid();
 if(p.contexts!==undefined){
  if(!object(p.contexts)||Object.keys(p.contexts).length>100)invalid();
  for(const [key,v]of Object.entries(p.contexts)){
   const [source,method,...rest]=key.split(':');
   if(rest.length||!isNameLanguage(source)||!['recognition','recall','self'].includes(method)||!object(v))invalid();
   counters(v,['attempts','correct','lapses','stage','confirmations']);dates(v,['due','last']);
   if(typeof v.interval!=='number'||v.stage>5||typeof v.lastWrong!=='boolean'||v.initialSuccess!==undefined&&typeof v.initialSuccess!=='boolean'||v.gradeIds!==undefined&&(!Array.isArray(v.gradeIds)||v.gradeIds.length>20||!v.gradeIds.every(id=>typeof id==='string'&&id.length<200)))invalid();
  }
 }
 if(p.legacy!==undefined){
  if(!object(p.legacy))invalid();
  counters(p.legacy,['streak']);dates(p.legacy,['due','last']);
 }
 if(p.legacyClaimed!=null&&(!p.contexts||!Object.hasOwn(p.contexts,p.legacyClaimed)))invalid();
 return structuredClone(p);
}
export function validateRecords(value,ids,{strictKeys=false}={}){
 if(!object(value))invalid();
 const result={};
 for(const [key,p]of Object.entries(value)){
  const [id,target,...extra]=key.split(':');
  if(extra.length||!ids.has(id)||!(isNameLanguage(target)||target==='code')){if(strictKeys)invalid();continue;}
  result[key]=validateRecord(p);
 }
 return result;
}
export function validateDaily(value){
 if(value==null)return null;
 if(!object(value)||typeof value.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value.date)||!Number.isFinite(Date.parse(value.date))||new Date(value.date).toISOString().slice(0,10)!==value.date||!Array.isArray(value.introduced)||value.introduced.length>10000||!value.introduced.every(k=>typeof k==='string'&&k.length<200))invalid();
 return {date:value.date,introduced:[...new Set(value.introduced)]};
}
