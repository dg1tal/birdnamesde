import {primaryName} from '../dist/name-languages.js';
import {SCIENTIFIC_NAME_ALIASES} from '../dist/scientific-name-aliases.js';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateScientificNames,renderScientificName,explanationLanguage} from '../dist/scientific-names.js';
const raw=readFileSync('dist/species.json'),birds=JSON.parse(raw).species;
const input=JSON.parse(readFileSync('dist/scientific-names.json'));
const data=validateScientificNames(input,birds);
assert.equal(data.meta.catalogueSha256,createHash('sha256').update(raw).digest('hex'));
assert.equal(Object.keys(data.species).length,birds.length);
assert.equal(Object.keys(data.terms).length,new Set(Object.values(data.species).flatMap(row=>row.parts)).size);
for(const bird of birds)for(const language of ['de','en','nl']){
 const html=renderScientificName(data,bird,language,language==='de'?'en':'de');
 assert(html.startsWith(`<details class="scientific-origin" lang="${language}" data-name-content>`));
 assert(!/^<details[^>]*\sopen(?:\s|>)/.test(html));
 assert.equal((html.match(/<dt>/g)||[]).length,2);
 assert(html.includes(`lang="la">${primaryName(bird,'sci')}</p>`));
 assert.equal(data.species[bird.id].scientificName,primaryName(bird,'sci'));
 for(const part of data.species[bird.id].parts){
  assert(data.terms[part].text[language].trim());
  assert(html.includes(data.sources[data.terms[part].source].url));
  for(const reference of data.terms[part].additionalSources||[])
   assert(html.includes(data.sources[reference.source].url),`${bird.sci}: supplementary reference in ${language}`);
 }
}
const bird=name=>birds.find(b=>b.sci===name);
const text=(name,lang='en')=>data.terms[data.species[bird(name).id].parts[1]].text[lang];
assert(text('Somateria fischeri').includes('Johann Gotthelf Fischer von Waldheim'));
for(const name of ['Agapornis fischeri','Tauraco fischeri'])assert(text(name).includes('Gustav Adolf Fischer'));
assert(text('Falco naumanni').includes('Johann Friedrich Naumann'));
assert(text('Turdus naumanni').includes('Johann Andreas Naumann'));
assert(text('Thalasseus sandvicensis').includes('Kent'));
assert(text('Branta sandvicensis').includes('Hawaii'));
assert(text('Passerculus sandwichensis').includes('Alaska'));
assert(text('Poicephalus meyeri').includes('Bernhard Meyer'));
assert(!text('Poicephalus meyeri').includes('Adolf'));
assert(text('Trochalopteron elliotii').includes('Daniel Giraud Elliot'));
assert(!text('Trochalopteron elliotii').includes('Walter Elliot'));
assert(text('Lophura edwardsi').includes('Alphonse Milne-Edwards'));
assert(text('Cygnus columbianus').includes('Columbia River'));
assert(text('Sibirionetta formosa').startsWith('beautiful'));
assert(text('Euplectes orix').startsWith('rice'));
assert(text('Stercorarius pomarinus').includes('covered nose'));
assert(text('Clanga pomarina').includes('Pomerania'));
assert(text('Suthora webbiana').includes('Edward Webb'));
assert(!text('Suthora webbiana').includes('Philip Barker'));
assert(text('Ichthyaetus audouinii').includes('Jean-Victor Audouin'));
assert(text('Turdus iliacus').includes('Gaza'));
assert(!text('Turdus iliacus').includes('flank'));
assert.equal(data.terms['e:granti'].uncertain,true);
for(const [language,wordLabel,partLabel] of [['de','Wortbedeutung','Wortbestandteil'],['en','Word meaning','Word component'],['nl','Woordbetekenis','Woordbestanddeel']]){
 assert(renderScientificName(data,bird('Platycercus adscitus'),language).includes(wordLabel));
 assert(renderScientificName(data,bird('Leptoptilos crumenifer'),language).includes(partLabel));
 assert(renderScientificName(data,bird('Suthora webbiana'),language).includes('Edward Webb'));
}
assert.equal(data.terms['e:crumenifer'].source,'jobling2010','A component reference must supplement, not replace, the full explanation source');
assert(data.terms['e:iliacus'].source!=='jobling2010','A corrected derivation must cite the supporting source');
for(const badReference of [null,{source:'missing',scope:'wordMeaning'},{source:'jobling2010',scope:'dedication<script>'},{source:'jobling2010',scope:'wordMeaning',page:0}]){
 const bad=structuredClone(input);bad.terms['e:merula'].additionalSources=[badReference];
 assert.throws(()=>validateScientificNames(bad,birds));
}
// The review separates taxon-specific dedications, disputed histories and grouped variants.
assert.equal(data.terms['e:elliotii'].source,'gould1873');
assert.equal(data.terms['e:elliotii'].page,undefined,'Do not retain a Jobling page for a different source');
assert.equal(data.terms['e:smithsonianus'].source,'coues1862');
assert.equal(data.terms['e:smithsonianus'].page,300);
assert.equal(data.terms['e:richardi'].uncertain,false,'New research resolves the former unidentified Richard');
assert.equal(data.terms['g:Myiopsitta'].source,'mouchard2019');
assert.equal(data.terms['g:Myiopsitta'].page,230);
// Source disagreements must survive compilation, with the correct scope and
// the naming author's explanation taking precedence over a later word split.
assert.equal(data.terms['g:Psittacara'].uncertain,false);
assert(data.terms['g:Psittacara'].additionalSources.some(r=>r.source==='vigors1825Psittacara'&&r.scope==='nameHistory'&&r.page===388));
assert.equal(data.terms['g:Lophodytes'].source,'jobling2010');
assert.equal(data.terms['g:Lophodytes'].page,230);
assert(data.terms['g:Lophodytes'].additionalSources.some(r=>r.source==='bou1915'&&r.page===188));
assert.equal(data.terms['e:rubecula'].uncertain,true,'The diminutive reading is not the only researched explanation');
for(const key of ['e:rubecula','e:hiaticula'])
 assert(data.terms[key].additionalSources.some(r=>r.source==='vorobyev2020'));
assert.equal(data.terms['e:rubetra'].uncertain,false,'Documented Latin/Greek word history resolves the former generic uncertainty');
assert.equal(data.terms['e:atthis'].uncertain,true,'Conflicting identifications must remain qualified');
assert.equal(data.terms['e:atthis'].source,'beolens2014Atthis');
assert(data.terms['e:atthis'].additionalSources.some(r=>r.source==='jobling2010'&&r.scope==='dedication'));
const reedlingPart=data.species[bird('Panurus biarmicus').id].parts[1];
const lannerPart=data.species[bird('Falco biarmicus').id].parts[1];
assert.notEqual(reedlingPart,lannerPart,'The reused epithet has different naming histories in the reedling and falcon');
for(const language of ['de','en','nl']){
 assert.notEqual(data.terms[reedlingPart].text[language],data.terms[lannerPart].text[language]);
 for(const root of ['rubus','batis','batos'])assert(data.terms['e:rubetra'].text[language].includes(root));
}
for(const key of ['e:kundoo','g:Iduna','g:Surnia','g:Xema','g:Zapornia'])
 assert.equal(data.terms[key].uncertain,true,`${key}: no conjectural root may become a certain derivation`);
assert.notDeepEqual(data.terms['e:fuscatus'].text,data.terms['e:fuscescens'].text);
assert.equal(data.terms['e:fuscescens'].text.en.split(';')[0],'brownish, becoming dusky');
// Regression checks from the complete review of previously unmarked terms.
// These catch semantic/source-scope errors as well as extraction artefacts.
assert.equal(data.terms['g:Acrocephalus'].text.en.split(';')[0],'high head');
assert(data.terms['g:Junco'].text.en.includes('junco = Reed Bunting'));
assert(data.terms['g:Junco'].text.en.includes('iuncus = rush'));
assert(data.terms['g:Gallinago'].text.en.startsWith('hen-like'));
assert(data.terms['g:Periparus'].text.en.includes('peri = all around, very'));
assert(data.terms['e:phoenicuroides'].text.en.startsWith('resembling the shrike'));
assert(data.terms['e:pilaris'].text.en.includes('pilus = hair'));
assert(!data.terms['e:pilaris'].text.en.includes('pilare'));
assert(data.terms['e:penelope'].text.en.startsWith('an ancient duck name'));
assert(data.terms['e:platalea'].text.en.includes('Latin platalea = spoonbill'));
assert.equal(data.terms['e:audouinii'].source,'review20261108_fb72b3252776');
assert.equal(data.terms['e:audouinii'].page,464);
assert(data.terms['e:audouinii'].additionalSources.some(r=>r.source==='review20261108_5b51bea962ec'&&r.scope==='identity'));
assert.equal(data.terms['g:Sibirionetta'].page,11);
assert(data.sources[data.terms['g:Sibirionetta'].source].url.startsWith('https://www.zobodat.at/'));
assert.equal(data.terms['g:Thalasseus'].source,'jobling2010');
assert.equal(data.terms['g:Thalasseus'].page,383);
assert(data.terms['g:Thalasseus'].additionalSources.some(r=>r.source==='mouchard2019'&&r.page===160));
assert.equal(data.terms['e:philomelos'].source,'hanzab2006SongThrush');
for(const key of ['g:Entomyzon','g:Hydrocoloeus','g:Pandion','g:Thalasseus','e:moschata','e:philomelos'])
 assert.equal(data.terms[key].uncertain,true,`${key}: competing analyses must remain visible`);
for(const language of ['de','en','nl']){
 for(const key of ['g:Glareola','e:glareola'])assert(data.terms[key].text[language].includes('glarea'));
 for(const row of Object.values(data.terms))
  assert(!/caligatusbooted|gallinagowoodcock|gutturalisof|regalisroyal|regulorumof|regulusprince/.test(row.text[language]));
}
const unmarkedAudit=JSON.parse(readFileSync('docs/scientific-name-unmarked-review-20261123.json'));
const auditedKeys=new Set(unmarkedAudit.terms.map(r=>r.termKey));
assert.equal(auditedKeys.size,1191,'The systematic review must account for every starting unmarked term');
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
for(const row of unmarkedAudit.terms){
 assert.equal(row.afterSha256,createHash('sha256').update(JSON.stringify(canonical(data.terms[row.termKey]))).digest('hex'),`${row.termKey}: review record must describe the published entry`);
 assert(row.consultedPassages.length>0,`${row.termKey}: source check must be recorded`);
 for(const ref of row.consultedPassages)assert(data.sources[ref.source],`${row.termKey}: registered source`);
}
const countryExtension=JSON.parse(readFileSync('data/scientific-name-country-extension.json'));
const extensionKeys=new Set(countryExtension.newTermKeys);
assert.equal(extensionKeys.size,56,'Every new country-expansion term is explicitly reviewed');
assert.equal(countryExtension.species.length,54);
assert([...extensionKeys].every(key=>data.terms[key]&&!auditedKeys.has(key)));
for(const row of countryExtension.species){
 assert.equal(data.species[row.id].scientificName,row.currentScientificName||row.scientificName);
 for(const part of ['genus','epithet'])assert(row[part+'Source'].printedPage>0);
}
assert.equal(data.terms['g:Perisoreus'].uncertain,true,'Competing suggestions are not a settled derivation');
assert.equal(data.terms['e:examinandus'].uncertain,true,'Do not conceal the dictionary’s different spelling examinatus');
assert.equal(data.terms['g:Fringillaria'].page,164,'The current combination needs its own genus source');
assert.equal(data.species.houbun3.scientificName,'Fringillaria sahari');
assert(data.terms['e:heinei'].additionalSources.some(r=>r.source==='heineanumHeinei'&&r.scope==='dedication'));
const previouslyUncertain=Object.keys(data.terms).filter(key=>!auditedKeys.has(key)&&!extensionKeys.has(key));
assert.equal(previouslyUncertain.length,47);
assert(previouslyUncertain.every(key=>data.terms[key].uncertain));
// Explanations must expose the roots, including mixed-language compounds and
// diminutives, without inventing a throat component for the robin's epithet.
for(const language of ['de','en','nl']){
 const robin=renderScientificName(data,bird('Erithacus rubecula'),language);
 for(const root of ['erithakos','ruber'])assert(robin.includes(root));
 assert(!data.terms['e:rubecula'].text[language].includes('gula'));
 for(const [key,roots] of Object.entries({
  'g:Dendrocopos':['dendron','kopos'],
  'g:Bombycilla':['bombux','cilla'],
  'g:Arundinax':['arundo','anax'],
  'e:fuligula':['fuligo','gula'],
  'e:caryocatactes':['karyon','katagnumi'],
  'e:phoenicuroides':['phoenicurus','-oides'],
  'e:trochiloides':['trochilus','-oides']
 }))for(const root of roots)assert(data.terms[key].text[language].includes(root),`${key}: ${language} needs ${root}`);
 assert(data.terms['g:Forpus'].uncertain);
 assert(data.terms['g:Erithacus'].uncertain);
 assert(data.terms['g:Melanocorypha'].uncertain);
 assert(!data.terms['g:Forpus'].text[language].includes('phoreo'),'A proposed root must not become a certain derivation');
}
for(const key of ['g:Cisticola','g:Aratinga','g:Poicephalus','g:Cyanoliseus','e:plancus','e:atthis','e:cirrocephalus']){
 assert.equal(data.terms[key].uncertain,true,key);
 const row=Object.entries(data.species).find(([,s])=>s.parts.includes(key));
 const target=birds.find(b=>b.id===row[0]);
 for(const [lang,label] of [['de','Herleitung unsicher'],['en','Derivation uncertain'],['nl','Afleiding onzeker']])
  assert(renderScientificName(data,target,lang).includes(label),`${key}: ${lang}`);
}
assert(renderScientificName(data,bird('Surnia ulula'),'en').includes('Derivation uncertain'));
for(const lang of ['de','en','nl']){
 assert.equal(explanationLanguage(lang,'en'),lang);
 assert.equal(explanationLanguage('sci',lang),lang);
}
assert.equal(explanationLanguage('xx','xx'),'de');
assert(renderScientificName(data,bird('Turdus merula'),'sci','en').includes('Genus'));
assert.equal(renderScientificName(null,bird('Turdus merula'),'de'),'');
assert.equal(renderScientificName(data,{id:'absent',sci:'Unknown bird'},'de'),'');
const changed={...bird('Turdus merula'),sci:'Different combination'};
assert.equal(renderScientificName(data,changed,'de'),'');
assert(!validateScientificNames(input,[changed]).species[changed.id]);
for(const mutate of [d=>{d.version=9;},d=>{d.sources.jobling2010.url='javascript:alert(1)';},d=>{d.terms['e:merula'].text.nl='';},d=>{d.species[bird('Turdus merula').id].parts[1]='missing';}]){
 const bad=structuredClone(input);mutate(bad);assert.throws(()=>validateScientificNames(bad,birds));
}
const hostile=structuredClone(input);hostile.terms['e:merula'].text.en='<img src=x onerror="alert(1)">';
const safe=renderScientificName(validateScientificNames(hostile,birds),bird('Turdus merula'),'en');
assert(safe.includes('&lt;img'));assert(!safe.includes('<img'));
const app=readFileSync('dist/app.js','utf8');
const question=app.slice(app.indexOf('function renderQuestion('),app.indexOf('\nasync function finish('));
assert(!question.includes('scientificNameMarkup('),'No etymology hints on unanswered questions');
for(const fn of ['renderIntroduction','renderFeedback','lookupNameList','studyMoreMarkup']){
 const start=app.indexOf(`function ${fn}(`),end=app.indexOf('\nfunction ',start+1);
 assert(app.slice(start,end).includes(fn==='renderIntroduction'||fn==='renderFeedback'?'studyDetailsMarkup(':'scientificNameMarkup('),fn);
}
console.log(`PASS: all ${birds.length} name explanations in de/en/nl; exact taxonomy, homonyms, sources, uncertainty, language independence, safe HTML and answer-only placement.`);

for(const [id,oldName,newName] of SCIENTIFIC_NAME_ALIASES){
 for(const language of ['de','en','nl']){
  const html=renderScientificName(data,birds.find(b=>b.id===id),language);
  assert(!html.includes('eBird/Clements 2025'));assert(!html.includes(oldName));
  assert(html.includes(newName),'Explain the current displayed scientific name');
  assert.deepEqual(data.species[id].parts.map(key=>data.terms[key].term),newName.split(' '));
 }
}

assert.equal(data.terms['g:Nannus'].text.de,'Zwerg; aus griechisch nannos');
assert.equal(data.terms['g:Melophus'].page,250);
assert.equal(data.terms['g:Schoeniclus'].page,350);
// Cached pre-migration data must never explain an old combination under a current name.
const stale=structuredClone(input);
for(const [id,oldName] of SCIENTIFIC_NAME_ALIASES)stale.species[id].scientificName=oldName;
const filtered=validateScientificNames(stale,birds);
for(const [id] of SCIENTIFIC_NAME_ALIASES){
 assert(!filtered.species[id]);
 assert.equal(renderScientificName(stale,birds.find(b=>b.id===id),'de'),'');
}
