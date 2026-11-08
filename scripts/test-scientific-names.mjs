import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateScientificNames,renderScientificName,explanationLanguage} from '../dist/scientific-names.js';
const raw=readFileSync('dist/species.json'),birds=JSON.parse(raw).species;
const input=JSON.parse(readFileSync('dist/scientific-names.json'));
const data=validateScientificNames(input,birds);
assert.equal(data.meta.catalogueSha256,createHash('sha256').update(raw).digest('hex'));
assert.equal(Object.keys(data.species).length,birds.length);
assert.equal(Object.keys(data.terms).length,1234);
for(const bird of birds)for(const language of ['de','en','nl']){
 const html=renderScientificName(data,bird,language,language==='de'?'en':'de');
 assert(html.startsWith(`<details class="scientific-origin" lang="${language}" data-name-content>`));
 assert(!/^<details[^>]*\sopen(?:\s|>)/.test(html));
 assert.equal((html.match(/<dt>/g)||[]).length,2);
 assert(html.includes(`lang="la">${bird.sci}</p>`));
 for(const part of data.species[bird.id].parts){
  assert(data.terms[part].text[language].trim());
  assert(html.includes(data.sources[data.terms[part].source].url));
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
assert(text('Trochalopteron elliotii').includes('Walter Elliot'));
assert(text('Lophura edwardsi').includes('Alphonse Milne-Edwards'));
assert(text('Cygnus columbianus').includes('Columbia River'));
assert(text('Sibirionetta formosa').startsWith('beautiful'));
assert(text('Euplectes orix').startsWith('rice'));
assert(text('Stercorarius pomarinus').includes('covered nose'));
assert(text('Clanga pomarina').includes('Pomerania'));
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
for(const fn of ['renderIntroduction','renderFeedback','lookupNameList','studyDetailsMarkup']){
 const start=app.indexOf(`function ${fn}(`),end=app.indexOf('\nfunction ',start+1);
 assert(app.slice(start,end).includes(fn==='renderIntroduction'||fn==='renderFeedback'?'studyDetailsMarkup(':'scientificNameMarkup('),fn);
}
console.log('PASS: all 940 name explanations in de/en/nl; exact taxonomy, homonyms, sources, uncertainty, language independence, safe HTML and answer-only placement.');
