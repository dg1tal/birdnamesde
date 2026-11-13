import {primaryName} from './name-languages.js?v=20261113-french1';
const LANGUAGES=['de','en','nl'];
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const EVIDENCE_SCOPES={
 de:{wordMeaning:'Wortbedeutung',wordComponent:'Wortbestandteil',nameHistory:'Benennungsgeschichte',dedication:'Widmung',identity:'Personenidentität',nameContext:'Kontext der Benennung'},
 en:{wordMeaning:'Word meaning',wordComponent:'Word component',nameHistory:'Naming history',dedication:'Dedication',identity:'Identity of the person',nameContext:'Naming context'},
 nl:{wordMeaning:'Woordbetekenis',wordComponent:'Woordbestanddeel',nameHistory:'Naamgevingsgeschiedenis',dedication:'Opdracht',identity:'Identiteit van de persoon',nameContext:'Context van de naamgeving'}
};
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// A changed taxonomic combination must never inherit an old explanation by ID.
export function validateScientificNames(data,birds){
 if(!object(data)||data.version!==1||!object(data.terms)||!object(data.species)||!object(data.sources))throw Error('Invalid scientific-name explanations');
 for(const source of Object.values(data.sources)){
  if(!object(source)||typeof source.title!=='string'||typeof source.url!=='string')throw Error('Invalid name source');
  const url=new URL(source.url);
  if(url.protocol!=='https:'||url.username||url.password)throw Error('Invalid name source URL');
 }
 const species=Object.create(null);
 for(const bird of birds){
  if(!own(data.species,bird.id))continue;
  const row=data.species[bird.id];
  if(!object(row))throw Error('Invalid name explanation');
  if(row.scientificName!==primaryName(bird,'sci'))continue;
  if(!Array.isArray(row.parts)||row.parts.length!==2)throw Error('Invalid name parts');
  const words=primaryName(bird,'sci').split(' ');
  for(const [i,key] of row.parts.entries()){
   if(typeof key!=='string'||!own(data.terms,key))throw Error('Missing name part');
   const term=data.terms[key];
   if(!object(term)||term.term!==words[i]||!object(term.text)||typeof term.uncertain!=='boolean'||!own(data.sources,term.source)||
    (term.page!==undefined&&(!Number.isInteger(term.page)||term.page<1))||
    !LANGUAGES.every(language=>typeof term.text[language]==='string'&&term.text[language].trim().length>0&&term.text[language].length<=2000))throw Error('Invalid name gloss');
   if(term.additionalSources!==undefined&&(!Array.isArray(term.additionalSources)||!term.additionalSources.length||term.additionalSources.length>12||
    !term.additionalSources.every(reference=>object(reference)&&typeof reference.source==='string'&&own(data.sources,reference.source)&&typeof reference.scope==='string'&&own(EVIDENCE_SCOPES.de,reference.scope)&&
     (reference.page===undefined||(Number.isInteger(reference.page)&&reference.page>0)))))throw Error('Invalid supplementary name source');
  }
  species[bird.id]=row;
 }
 return {...data,species};
}

export function explanationLanguage(questionLanguage,interfaceLanguage='de'){
 return LANGUAGES.includes(questionLanguage)?questionLanguage:LANGUAGES.includes(interfaceLanguage)?interfaceLanguage:'de';
}

const COPY={
 de:{title:'Namensbedeutung und Herkunft',genus:'Gattung',epithet:'Artzusatz',uncertain:'Herleitung unsicher',note:'Erklärt die historische Benennung. Sie muss den Vogel nicht zutreffend beschreiben.',sources:'Quellen',page:'S.'},
 en:{title:'Scientific name: meaning and origin',genus:'Genus',epithet:'Species epithet',uncertain:'Derivation uncertain',note:'Explains the historical naming. The name may not accurately describe the bird.',sources:'Sources',page:'p.'},
 nl:{title:'Wetenschappelijke naam: betekenis en herkomst',genus:'Geslacht',epithet:'Soortaanduiding',uncertain:'Afleiding onzeker',note:'Verklaart de historische naamgeving. De naam hoeft de vogel niet juist te beschrijven.',sources:'Bronnen',page:'p.'}
};

export function renderScientificName(data,bird,questionLanguage,interfaceLanguage='de'){
 if(!data||!own(data.species,bird.id))return '';
 const row=data.species[bird.id];
 if(row.scientificName!==primaryName(bird,'sci'))return '';
 const language=explanationLanguage(questionLanguage,interfaceLanguage),copy=COPY[language];
 const parts=row.parts.map(key=>data.terms[key]);
 const sources=[...new Set(parts.map(part=>part.source))];
 const supplementary=parts.flatMap(part=>(part.additionalSources||[]).map(reference=>{
  const source=data.sources[reference.source];
  return `<li><span class="scientific-name" lang="la">${escape(part.term)}</span> — ${EVIDENCE_SCOPES[language][reference.scope]}: <a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)}${reference.page?', '+copy.page+' '+reference.page:''} ↗</a></li>`;
 })).join('');
 return `<details class="scientific-origin" lang="${language}" data-name-content><summary>${copy.title}<span class="sr">: ${escape(row.scientificName)}</span></summary><div class="scientific-origin-content"><p class="scientific-origin-name scientific-name" lang="la">${escape(row.scientificName)}</p><dl>${parts.map((part,i)=>`<div><dt><span class="origin-part-label">${i?copy.epithet:copy.genus}</span> <span class="scientific-name" lang="la">${escape(part.term)}</span></dt><dd>${escape(part.text[language])}${part.uncertain?` <span class="origin-uncertain">(${copy.uncertain})</span>`:''}</dd></div>`).join('')}</dl><p class="muted origin-note">${copy.note}</p><p class="origin-sources"><span>${copy.sources}:</span> ${sources.map(id=>{const source=data.sources[id],pages=[...new Set(parts.filter(part=>part.source===id&&part.page).map(part=>part.page))];return `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)}${pages.length?', '+copy.page+' '+pages.join(', '):''} ↗</a>`;}).join(' · ')}</p>${supplementary?`<ul class="origin-supplementary-sources">${supplementary}</ul>`:''}</div></details>`;
}
