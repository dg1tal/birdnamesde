import {NAME_LANGUAGES,isNameLanguage,primaryName} from './name-languages.js?v=20261113-french1';

export const LOOKUP_PAGE_SIZE=60;
export function lookupSettings(saved,learningRegion='DE',english=false,countries=['DE','NL','GB']){
 const state={...saved};
 const validRegion=region=>typeof region==='string'&&countries.includes(region.split('-')[0])&&/^[A-Z]{2}(?:-[A-Z0-9]{1,4}){0,2}$/.test(region);
 if(!state.geographyVersion){
  state.region=validRegion(state.region)?state.region:countries.includes(learningRegion?.split('-')[0])?learningRegion.split('-')[0]:'DE';
  state.geographyVersion=1;
 }else state.region=state.region===''||validRegion(state.region)?state.region:'DE';
 state.regionMode=state.region&&state.regionMode==='recent'?'recent':'all';
 state.mainLanguage=isNameLanguage(state.mainLanguage)?state.mainLanguage:english?'en':'de';
 state.nameLanguages=Array.isArray(state.nameLanguages)?[...new Set(state.nameLanguages.filter(isNameLanguage))]:NAME_LANGUAGES.map(l=>l.code);
 state.visible=Number.isInteger(state.visible)&&state.visible>=LOOKUP_PAGE_SIZE?Math.min(state.visible,10000):LOOKUP_PAGE_SIZE;
 return state;
}
export function lookupTitle(species,language){return primaryName(species,language)||species.sci;}
export function sortLookup(species,language){
 const collator=new Intl.Collator(language==='sci'?'la':language,{sensitivity:'base',numeric:true});
 return [...species].sort((a,b)=>collator.compare(lookupTitle(a,language),lookupTitle(b,language))||a.sci.localeCompare(b.sci)||a.id.localeCompare(b.id));
}
export function lookupLanguages(state){
 return NAME_LANGUAGES.filter(l=>l.code!==state.mainLanguage&&(l.code==='sci'||state.nameLanguages.includes(l.code)));
}
export function showGermanStatus(species,region){return region.split('-')[0]==='DE'&&species.statusCountry==='DE';}
