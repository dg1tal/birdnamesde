import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {lookupSettings,lookupTitle,sortLookup,lookupLanguages,showGermanStatus,LOOKUP_PAGE_SIZE} from '../dist/lookup-settings.js';
import {NAME_LANGUAGES,primaryName,languageLabel,loadNameData} from '../dist/name-languages.js';
import {validateRegions} from '../dist/regions.js';

assert.equal(lookupSettings({},'GB-SCT',false).region,'GB');
assert.equal(lookupSettings({region:'NL-NH'},'DE',false).region,'NL-NH');
const explicitAll=lookupSettings({geographyVersion:1,region:''},'NL',true);
assert.equal(explicitAll.region,'');assert.equal(explicitAll.mainLanguage,'en');
assert.equal(lookupSettings(explicitAll,'DE',false).region,'');
assert.equal(lookupSettings({geographyVersion:1,region:'GB',mainLanguage:'nl'},'DE',false).mainLanguage,'nl');
assert.equal(lookupSettings({region:'<script>',mainLanguage:'xx',nameLanguages:['nl','nl','xx']},'NL',false).region,'NL');
assert.equal(lookupSettings({region:'DE',visible:Infinity},'DE').visible,LOOKUP_PAGE_SIZE);
assert.equal(lookupSettings({geographyVersion:1,region:'',regionMode:'recent'},'DE').regionMode,'all');
assert.deepEqual(lookupLanguages({mainLanguage:'nl',nameLanguages:['de']}).map(l=>l.code),['de','sci']);
const fake=[{id:'a',de:'Zebra',en:'Alpha',sci:'A a'},{id:'b',de:'Amsel',en:'Zebra',sci:'B b'}];
assert.equal(sortLookup(fake,'de')[0].id,'b');assert.equal(sortLookup(fake,'en')[0].id,'a');
assert.equal(lookupTitle({...fake[0],de:''},'de'),'A a');
assert(showGermanStatus({statusCountry:'DE'},'DE-BY'));assert(!showGermanStatus({statusCountry:'DE'},'NL'));
assert(!showGermanStatus({statusCountry:'DE'},''));assert(!showGermanStatus({},'DE'));

const {species:birds,meta}=JSON.parse(readFileSync('dist/species.json'));
await loadNameData(birds,async path=>({ok:true,json:async()=>JSON.parse(readFileSync('dist/'+path))}));
const german=JSON.parse(readFileSync('dist/german-names.json')).species;
for(const s of birds)s.germanNames=german[s.id]?.names||[];
const source=readFileSync('dist/app.js','utf8');
const render=source.slice(source.indexOf('function englishNames('),source.indexOf('\nfunction lookupCountryControl('));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ui={lookup:{mainLanguage:'de',nameLanguages:['de','en','nl','sci'],region:'DE'}};
const context=vm.createContext({ui,NAME_LANGUAGES,lookupTitle,lookupLanguages,showGermanStatus,primaryName,languageLabel,esc,
 english:false,lookupPhotos:false,t:s=>s,nameMarkup:(s,l)=>`<span data-name-content lang="${l==='sci'?'la':l}">${esc(primaryName(s,l))}</span>`});
vm.runInContext(render,context);
const jay=context.card(birds.find(s=>s.id==='eurjay1'));
assert(jay.includes('code-scientific'));
assert(jay.includes('Wissenschaftlicher Kurzcode: Garrulus glandarius'));
assert(jay.includes('wiss.'));
assert(jay.indexOf('>GAGL<')<jay.indexOf('>ECFJ<'));
assert(jay.indexOf('>GAGL<')<jay.indexOf('>EUJA<'));
const redpoll=birds.find(s=>s.de==='Birkenzeisig');
assert(context.card(redpoll).includes(redpoll.note));
ui.lookup.region='GB';assert(!context.card(redpoll).includes(redpoll.note));
ui.lookup.mainLanguage='nl';assert(context.card(birds.find(s=>s.id==='eurbla')).includes('<h2><span class="card-language-label">Niederländisch</span><span data-name-content lang="nl">Merel</span></h2>'));
for(const mainLanguage of ['de','en','nl','sci']){
 ui.lookup.mainLanguage=mainLanguage;
 for(const s of birds){const html=context.card(s);assert(!html.includes('Status & Varianten'));assert(!html.includes('undefined'));assert(!html.includes('Codequelle:'));}
}
ui.lookup.mainLanguage='de';assert(context.card(birds.find(s=>!s.de)).includes('Name nicht verfügbar auf'));
const stamp=new Date().toISOString(),list={ids:['eurbla'],reportedTaxa:1,updatedAt:stamp};
const snapshot={version:1,recentDays:30,catalogFingerprint:meta.catalog.fingerprint,regions:[{code:'DE',nameDe:'Deutschland',nameEn:'Germany',all:list,recent:list}]};
assert(validateRegions(snapshot,new Set(birds.map(s=>s.id)),meta.catalog.fingerprint));
assert.throws(()=>validateRegions({...snapshot,catalogFingerprint:'old'},new Set(birds.map(s=>s.id)),meta.catalog.fingerprint));
console.log('PASS: lookup migration, independent geography/languages, sorting/fallback, national context, all catalogue cards and cache-version rejection.');
