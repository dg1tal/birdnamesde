import {normalize} from './logic.js?v=20261113-french1';
import {NAME_LANGUAGES,acceptedNames} from './name-languages.js?v=20261113-french1';
import {sortLookup} from './lookup-settings.js?v=20261113-french1';
import {scientificNameAliases} from './scientific-name-aliases.js?v=20261108-quality1';

const variants=value=>[...new Set([normalize(value),normalize(value.toLowerCase().replace(/ae/g,'ä').replace(/oe/g,'ö').replace(/ue/g,'ü'))])].filter(Boolean);
const contains=(field,token)=>token.some(value=>field.normalized.includes(value));
const begins=(field,token)=>token.some(value=>field.words.some(word=>word.startsWith(value)));
const cache=new WeakMap();
function fields(species){
 if(cache.has(species))return cache.get(species);
 const aliases=scientificNameAliases(species);
 const entries=NAME_LANGUAGES.flatMap(({code})=>[...new Set([...acceptedNames(species,code).filter(name=>code!=='sci'||!aliases.some(a=>a.name===name)),...(code==='de'?(species.germanNames||[]).map(n=>n.name):[])])].map(value=>({language:code,value})));
 entries.push(...aliases.map(({name,source})=>({language:'sci',value:name,source})));
 entries.push(...species.codes.map(value=>({language:'code',value})));
 const result=entries.map(field=>({...field,normalized:normalize(field.value),words:field.value.split(/[^\p{L}\p{N}]+/u).filter(Boolean).map(normalize)}));
 cache.set(species,result);return result;
}

// One result per species. Equal-strength fields stay visible so code/name and
// cross-language collisions never depend on a guessed language or letter case.
export function searchLookup(species,query,language='de'){
 const tokens=String(query).trim().split(/\s+/).map(variants).filter(values=>values.length);
 if(!tokens.length)return [];
 const whole=variants(query),hits=[];
 for(const bird of sortLookup(species,language)){
  const entries=fields(bird);
  if(!tokens.every(token=>entries.some(field=>contains(field,token))))continue;
  const ranked=entries.map(field=>({field,rank:whole.includes(field.normalized)?0:tokens.every(token=>begins(field,token))?1:tokens.every(token=>contains(field,token))?2:3}));
  const rank=Math.min(...ranked.map(item=>item.rank));
  const matches=ranked.filter(item=>item.rank===rank&&(rank!==3||tokens.some(token=>contains(item.field,token)))).map(item=>({language:item.field.language,value:item.field.value,...(item.field.source?{source:item.field.source}:{})}));
  hits.push({species:bird,rank,matches});
 }
 return hits.sort((a,b)=>a.rank-b.rank);
}
