import {isNameLanguage} from './name-languages.js?v=20261113-french1';
import {family} from './learning-model.js?v=20261105-recovery1';

export function statsContext(value,learn){
 const sourceLanguage=isNameLanguage(value?.sourceLanguage)?value.sourceLanguage:learn.sourceLanguage;
 const nameLanguage=isNameLanguage(value?.nameLanguage)?value.nameLanguage:learn.nameLanguage;
 const method=['think','text','flash'].includes(value?.method)?value.method:family(learn.method)==='recognition'?'think':learn.method;
 return {sourceLanguage,nameLanguage,method};
}
export function statsPracticeSettings(learn,context){
 const method=context.method==='think'&&['think','mc'].includes(learn.method)?learn.method:context.method;
 return {...learn,sourceLanguage:context.sourceLanguage,nameLanguage:context.nameLanguage,target:context.nameLanguage,method};
}
// The catalogue can grow without changing the storage schema. Bound malformed
// input independently of the current catalogue, and never discard local IDs.
export function validateSavedSpecies(value,ids,{importing=false}={}){
 if(!Array.isArray(value)||value.length>10000||value.some(id=>typeof id!=='string'||!id||id.length>100))throw Error('Ungültige Merkliste.');
 const unique=[...new Set(value)];
 return {ids:importing?unique.filter(id=>ids.has(id)):unique,skipped:importing?unique.filter(id=>!ids.has(id)).length:0};
}
export function restoreEndedRound(snapshot){
 if(!snapshot)return null;
 const restored=structuredClone(snapshot);restored.session.paused=false;return restored;
}
