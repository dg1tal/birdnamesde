// Add a registry entry and a sourced names JSON to support another language.
// UI locale never determines which bird name is shown or accepted.
export const NAME_LANGUAGES=Object.freeze([
 {code:'de',labels:{de:'Deutsch',en:'German'},field:'de'},
 {code:'en',labels:{de:'Englisch',en:'English'},field:'en'},
 {code:'nl',labels:{de:'Niederländisch',en:'Dutch'},data:'languages/nl.json'}
]);
export const isNameLanguage=code=>NAME_LANGUAGES.some(l=>l.code===code);
export const languageLabel=(code,locale='de')=>NAME_LANGUAGES.find(l=>l.code===code)?.labels[locale]||code;
export function primaryName(species,code){
 const language=NAME_LANGUAGES.find(l=>l.code===code);
 return language?.field?species[language.field]||'':species.names?.[code]?.name||'';
}
export function acceptedNames(species,code){
 const primary=primaryName(species,code);if(!primary)return [];
 const extra=code==='en'?[species.enGB,...(species.aliases?.en||[])]:code==='de'?[...(species.aliases?.de||[]),...(species.germanNames||[]).filter(n=>n.status==='alternative'&&!n.ambiguous).map(n=>n.name)]:species.names?.[code]?.aliases||[];
 return [...new Set([primary,...extra].filter(x=>typeof x==='string'&&x.trim()))];
}
export function normalizeAnswer(value,code){
 let text=String(value??'').normalize('NFKC').toLowerCase();
 if(code==='de')text=text.replace(/ae/g,'ä').replace(/oe/g,'ö').replace(/ue/g,'ü');
 return text.replace(/ß/g,'ss').normalize('NFD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]/gu,'');
}
export function acceptsName(species,code,value){
 if(!isNameLanguage(code))return false;
 const answer=normalizeAnswer(value,code);
 return !!answer&&acceptedNames(species,code).some(n=>normalizeAnswer(n,code)===answer);
}
export function validateNameData(data,code,speciesIds){
 if(!data||data.version!==1||data.language!==code||!isNameLanguage(code)||!data.species||typeof data.species!=='object'||Array.isArray(data.species))throw Error('Invalid language data');
 const result={};
 for(const [id,item] of Object.entries(data.species)){
  if(!speciesIds.has(id)||!item||typeof item.name!=='string'||!item.name.trim()||item.name.length>300||!Array.isArray(item.aliases)||!item.aliases.every(n=>typeof n==='string'&&n.trim()&&n.length<=300))throw Error('Invalid translated name');
  result[id]={name:item.name,aliases:[...item.aliases]};
 }
 return result;
}
export async function loadNameData(birds,fetchData=globalThis.fetch){
 const ids=new Set(birds.map(s=>s.id));const available=NAME_LANGUAGES.filter(l=>l.field).map(l=>l.code);
 for(const language of NAME_LANGUAGES.filter(l=>l.data)){
  try{
   const response=await fetchData(language.data);if(!response.ok)throw Error('Language file unavailable');
   const names=validateNameData(await response.json(),language.code,ids);
   for(const s of birds){s.names??={};if(names[s.id])s.names[language.code]=names[s.id];}
   available.push(language.code);
  }catch{console.warn('Name language unavailable: '+language.code);}
 }
 return available;
}
export function hasLanguagePair(s,source,target){return !!primaryName(s,source)&&(target==='code'?!!s.codes?.length:!!primaryName(s,target));}
export function targetName(s,target){return target==='code'?s.codes?.[0]||'':primaryName(s,target);}
