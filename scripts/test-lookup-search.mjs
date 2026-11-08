import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {searchLookup} from '../dist/lookup-search.js';
import {matches,accepts} from '../dist/logic.js';
import {lookupTitle} from '../dist/lookup-settings.js';
import {primaryName,languageLabel} from '../dist/name-languages.js';
import {contentLanguage} from '../dist/accessibility.js';
import {SCIENTIFIC_NAME_ALIASES,scientificNameAliases} from '../dist/scientific-name-aliases.js';
const birds=JSON.parse(readFileSync('dist/species.json')).species;
const nl=JSON.parse(readFileSync('dist/languages/nl.json')).species;
const german=JSON.parse(readFileSync('dist/german-names.json')).species;
for(const bird of birds){bird.names={nl:nl[bird.id]};bird.germanNames=german[bird.id]?.names||[];}
const find=name=>birds.find(bird=>bird.de===name);
const blackbird=find('Amsel');
for(const query of ['Amsel','amsel','AMSEL','Merel','Turdus merula','Common Blackbird']){
 const hit=searchLookup(birds,query)[0];assert.equal(hit.species.id,blackbird.id,query);assert.equal(hit.rank,0,query);
}
const eubl=searchLookup(birds,'EUBL');
const collisions=birds.filter(bird=>bird.codes.includes('EUBL'));
assert(collisions.length>=2);assert.deepEqual(eubl.filter(hit=>hit.rank===0).map(hit=>hit.species.id).sort(),collisions.map(bird=>bird.id).sort());
assert(eubl.filter(hit=>hit.rank===0).every(hit=>hit.matches.some(match=>match.language==='code'&&match.value==='EUBL')));
assert.equal(searchLookup(birds,'merel')[0].matches[0].language,'nl');
assert(searchLookup(birds,'Moenchs').some(hit=>hit.species.de==='Mönchsgrasmücke'&&hit.rank===1));
assert(searchLookup(birds,'Ziegenmelker').some(hit=>hit.species.de==='Nachtschwalbe'&&hit.rank===0));
for(const query of ['a','mer','EUBL','ame','Turdus mer','common black','Moenchs','Ziegenmelker','brent goose','Amsel Turdus','mel','!!!','no-such-bird-9384']){
 const hits=searchLookup(birds,query);
 if(query!=='!!!')assert.deepEqual(hits.map(hit=>hit.species.id).sort(),birds.filter(bird=>matches(bird,query)).map(bird=>bird.id).sort(),query+' preserves searchable species');
 assert.equal(new Set(hits.map(hit=>hit.species.id)).size,hits.length,'No repeated species');
 assert(hits.every((hit,index)=>index===0||hit.rank>=hits[index-1].rank),'Strongest matches first');
 assert(hits.every(hit=>hit.matches.length),'Every result explains its match');
}
assert.equal(searchLookup(birds,'Amsel Turdus')[0].rank,3);
assert.equal(searchLookup(birds,'   ').length,0);assert.equal(searchLookup(birds,'!!!').length,0);
// Exact code and exact name have equal priority, irrespective of case or display language.
const fake=(id,de,codes=[])=>({id,de,en:'',sci:id,codes,aliases:{de:[],en:[]}});
const fixtures=[fake('a','XMERELX'),fake('b','Merel'),fake('c','Other',['MEREL']),fake('d','Merelbird')];
assert.deepEqual(searchLookup(fixtures,'merel').map(hit=>[hit.species.id,hit.rank]),[['b',0],['c',0],['d',1],['a',2]]);
const app=readFileSync('dist/app.js','utf8');
const render=app.slice(app.indexOf('function lookupHitList('),app.indexOf('\nfunction lookup()'));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const context=vm.createContext({english:false,ui:{lookup:{mainLanguage:'de'}},lookupTitle,languageLabel,primaryName,contentLanguage,scientificNameAliases,esc,birds,nameMarkup:s=>esc(s.de),card:s=>`<article>${esc(s.id)}</article>`});
vm.runInContext(app.slice(app.indexOf('function codeBadge('),app.indexOf('function lookupAliases(')),context);
vm.runInContext(render,context);
const markup=context.lookupHitList(searchLookup(birds,'merel'));
assert(markup.includes('Niederländisch:'));assert(markup.includes('lang="nl">Merel</strong>'));assert(markup.includes('<details class="lookup-hit"'));assert(markup.includes('Exakte Treffer'));
context.english=true;assert(context.lookupHitList(eubl).includes('Exact matches'));
assert(context.lookupHitList([{species:fixtures[0],rank:0,matches:[{language:'de',value:'<img src=x onerror=alert(1)>'}]}]).includes('&lt;img'));
console.log('PASS: ranked multilingual lookup, real code collisions, aliases, umlauts, cross-field queries, unique species, visible match provenance, bilingual disclosures and escaping.');

const exact=context.lookupHitList(searchLookup(birds,'Amsel'));
assert(!exact.includes('lang="de">Amsel</strong>'),'Identical title does not repeat as a reason');
assert(exact.includes('Goldamsel'),'Different alias remains visible');
assert(exact.includes('role="heading" aria-level="3"'),'Species title remains a heading');

for(const english of [false,true]){
 context.english=english;
 for(const [species,type,label] of [['Anadyrknutt','code-scientific',english?'Scientific':'Wissenschaftlich'],['Raubseeschwalbe','code-banding',english?'Banding':'Beringung'],['Fahlente','code-common','eBird']]){
  const hit=searchLookup(birds,'CATE').find(hit=>hit.species.de===species);
  const result=context.lookupHitList([hit]);
  assert(result.includes(type),species+' search match has its own code colour');
  assert(result.includes(`<span>${label}:</span>`),species+' search match uses the short bilingual origin label');
 }
}

assert.equal(SCIENTIFIC_NAME_ALIASES.length,11);
for(const [id,oldName,newName] of SCIENTIFIC_NAME_ALIASES){
 const bird=birds.find(b=>b.id===id);
 assert.equal(bird.sci,oldName);assert.equal(bird.scientificCodeName,newName);
 assert.equal(primaryName(bird,'sci'),newName);
 for(const name of [oldName,newName]){
  assert(accepts(bird,'sci',name.toLowerCase()),name+' accepted as scientific answer');
  assert.equal(searchLookup([bird],name)[0]?.rank,0,name+' remains searchable');
 }
 assert(!accepts(bird,'sci','Nannus hiemalis'));

 for(const query of [newName,newName.toUpperCase(),newName.toLowerCase()]){
  const hit=searchLookup(birds,query).find(h=>h.species.id===id);
  assert.equal(hit?.rank,0,query+' exact synonym');
  assert(hit.matches.some(m=>m.language==='sci'&&m.value===newName&&m.source==='eBird/Clements 2026'));
  assert(matches(bird,query),'Filter help finds the same synonym');
 }
 for(const english of [false,true]){
  context.english=english;
  const markup=context.lookupHitList(searchLookup([bird],newName));
  assert(markup.includes('eBird/Clements 2026'));assert(markup.includes('lang="la"'));
  const details=context.codeGroups(bird);
  assert(details.includes(english?'Same species':'Dieselbe Art'));assert(details.includes(oldName));assert(details.includes(newName));
 }
}
const wren=birds.find(b=>b.id==='winwre4');
assert.equal(searchLookup(birds,'Nannus hiemalis').length,0,'Do not conflate Winter Wren');
assert.equal(searchLookup([wren],'Nannus troglodytes').length,1);
assert.equal(searchLookup(birds.filter(b=>b.id!==wren.id),'Nannus troglodytes').length,0,'Search preserves the filtered pool');
assert.deepEqual(scientificNameAliases({...wren,sci:'unexpected'}),[]);
assert.deepEqual(scientificNameAliases({...wren,scientificCodeName:'Nannus hiemalis'}),[]);
for(const id of ['spofly1','eurrob1','grhowl'])assert.deepEqual(scientificNameAliases(birds.find(b=>b.id===id)),[],'No inferred synonyms across concept changes');
console.log('PASS: all eleven reviewed scientific synonyms, exact provenance, filter parity, bilingual notes and no inferred species equivalence.');
