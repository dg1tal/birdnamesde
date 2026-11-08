import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {answerSpecies} from '../dist/logic.js';
import {primaryName,acceptedNames,languageLabel} from '../dist/name-languages.js';
const birds=JSON.parse(readFileSync('dist/species.json')).species;
const dutch=JSON.parse(readFileSync('dist/languages/nl.json')).species;
for(const bird of birds)bird.names={nl:dutch[bird.id]};
const blackbird=birds.find(b=>b.de==='Amsel');
for(const [target,answer] of [['en','Common Blackbird'],['en','Eurasian Blackbird'],['code','tume'],['sci','Turdus merula'],['nl',dutch[blackbird.id].name]]){
 assert(answerSpecies(birds,target,answer,'de').includes(blackbird));
}
assert.deepEqual(answerSpecies(birds,'en','Blackb','de'),[]);
assert.deepEqual(answerSpecies(birds,'en','<script>','de'),[]);
assert.deepEqual(answerSpecies(birds,'en','','de'),[]);
const collision=[{...blackbird,id:'a'},{...blackbird,id:'b'},{...blackbird,id:'missing',de:''}];
assert.deepEqual(answerSpecies(collision,'code','TUME','de').map(b=>b.id),['a','b']);

// Exercise the production feedback renderer, including its placement and visibility.
const source=readFileSync('dist/app.js','utf8');
const render=source.slice(source.indexOf('function renderFeedback('),source.indexOf('\nfunction stats()'));
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const elements=new Map();
const context={birds,answerSpecies,esc:escape,english:false,Date,
 $:selector=>{if(!elements.has(selector))elements.set(selector,{setAttribute(){}});return elements.get(selector);},
 lessonProgress:()=>({completed:1}),lessonProgressMarkup:()=>'',lessonProgressText:()=>({}),
 contentLanguage:code=>code==='sci'?'la':code,
 nameMarkup:(bird,code)=>`<span data-name-content lang="${code==='sci'?'la':code}">${escape(primaryName(bird,code))}</span>`,
 nameAnswerMarkup:()=>'<b>Correct answer</b>',studyDetailsMarkup:()=>'<p>Species reference</p>',scientificNameMarkup:()=>'',germanNames:()=>'',ebirdLink:()=>'',
 questionReasonText:()=>'',regionalQuestionNote:()=>'',progress:()=>({}),evidenceText:()=>'',scheduleText:()=>'',
 observeStudyActions(){},focusHeading(){}
};
vm.createContext(context);vm.runInContext(render,context);
function feedback(answer,{correct=false,method='text',sourceLanguage='de',english=false,target='en'}={}){
 context.english=english;context.session={result:{correct,answer},method,sourceLanguage};
 context.renderFeedback(blackbird,{t:target});return elements.get('#feedback').innerHTML;
}
const html=feedback('Common Blackbird');
assert.match(html,/Deine Antwort wäre:<\/span> <span data-name-content lang="de">Amsel<\/span>/);
assert(html.indexOf('id="feedback-your-answer"')<html.indexOf('id="feedback-answer-meaning"'));
assert(html.indexOf('id="feedback-answer-meaning"')<html.indexOf('id="feedback-accepted"'));
assert.match(html,/aria-describedby="feedback-your-answer feedback-answer-meaning feedback-accepted"/);
for(const method of ['text','think','mc'])assert.match(feedback('TUME',{method,target:'code'}),/Deine Antwort wäre:.*Amsel/);
assert.match(feedback('Common Blackbird',{sourceLanguage:'nl',english:true}),/Your answer would be:.*lang="nl">Merel/);
assert.match(feedback('Common Blackbird',{sourceLanguage:'sci'}),/lang="la">Turdus merula/);
assert.match(feedback('<script>'),/Keine passende Art gefunden\./);
assert(!feedback('<script>').includes('<script>'));
for(const options of [{correct:true},{method:'flash'}])assert(!feedback('Common Blackbird',options).includes('id="feedback-answer-meaning"'));
for(const answer of ['Weiß ich nicht','I don’t know'])assert(!feedback(answer).includes('id="feedback-answer-meaning"'));
console.log('PASS: wrong-answer species, aliases, codes, Dutch/scientific source names, collisions, safe rendering and feedback visibility.');

// Exercise the shared production card helpers with real accepted names and editorial metadata.
const german=JSON.parse(readFileSync('dist/german-names.json')).species;
for(const bird of birds)bird.germanNames=german[bird.id]?.names||[];
const markupContext={birds,english:false,esc:escape,primaryName,acceptedNames,languageLabel,
 contentLanguage:context.contentLanguage,t:s=>s,ebirdLink:()=>'',nameOrigins:null,renderScientificName:()=>''};
vm.createContext(markupContext);
vm.runInContext(source.slice(source.indexOf('function scientificNameMarkup('),source.indexOf('function lookupNameList(')),markupContext);
for(const bird of birds){
 for(const target of ['en','sci','de','nl']){
  if(!primaryName(bird,target))continue;
  const answer=markupContext.nameAnswerMarkup(bird,target);
  assert(!answer.includes('class="code'),'Name answers do not attach code badges');
  for(const name of acceptedNames(bird,target))assert(answer.includes(escape(name)),'Every accepted name remains visible');
  const details=markupContext.studyDetailsMarkup(bird,target,'de');
  assert(details.includes('species-codes'));
  assert(details.indexOf('reference-name')<details.indexOf('species-codes'));
 }
 for(const answer of [false,true]){
  const codes=markupContext.codeGroups(bird,answer);
  for(const code of bird.codes){
   assert.equal(codes.split(`<span data-name-content>${code}</span>`).length-1,1,'Each code appears once');
   const others=birds.filter(b=>b.id!==bird.id&&b.codes.includes(code));
   const item=codes.split('class="species-code-item"').find(item=>item.includes(`<span data-name-content>${code}</span>`));
   assert.equal(item.includes('class="code-collisions"'),others.length>0);
   for(const other of others)assert(item.includes(escape(other.de)));
  }
 }
 const codeAnswer=markupContext.nameAnswerMarkup(bird,'code');
 assert(codeAnswer.includes('aria-label="Akzeptierte eBird-Kurzcodes"'));
 assert(!markupContext.studyDetailsMarkup(bird,'code','de').includes('species-codes'),'No duplicate code section');
}
const blackbirdAnswer=markupContext.nameAnswerMarkup(blackbird,'en');
assert.match(blackbirdAnswer,/variant-label">US/);assert.match(blackbirdAnswer,/variant-label">GB/);
assert(blackbirdAnswer.includes('Common Blackbird'));assert(!blackbirdAnswer.includes('Ebenfalls akzeptiert'));assert(!blackbirdAnswer.includes('Also accepted'));
assert.match(markupContext.nameAnswerMarkup(blackbird,'de'),/Alternative deutsche Namen:.*Schwarzdrossel/s);
const editorial={...blackbird,germanNames:[{name:'Old name',status:'historical'},{name:'Ambiguous',status:'alternative',ambiguous:true}]};
const accepted=markupContext.nameAnswerMarkup(editorial,'de');
assert(!accepted.includes('Old name'));assert(!accepted.includes('Ambiguous'));
const details=markupContext.studyDetailsMarkup(editorial,'de','de');
assert.match(details,/Historische deutsche Namen.*Old name/s);assert.match(details,/Ambiguous.*mehrdeutig/s);
const dual={...blackbird,id:'dual',codes:['TEST'],scientificCodes:['TEST'],scientificCodeName:'<script>',bandingCode:'TEST'};
const dualCodes=markupContext.codeGroups(dual);
assert.equal(dualCodes.split('<span data-name-content>TEST</span>').length-1,1);
assert.match(dualCodes,/Auch Beringungscode/);assert.match(dualCodes,/&lt;script&gt;/);assert(!dualCodes.includes('<script>'));
for(const english of [false,true]){
 markupContext.english=english;
 const codes=markupContext.codeGroups(blackbird);
 for(const text of english?['Scientific quick codes','Banding codes','eBird codes from English names','Also for other species']:['Wissenschaftliche Kurzcodes','Beringungscodes','eBird-Codes aus englischen Namen','Auch für andere Arten'])assert(codes.includes(text));
 const other=birds.find(b=>b.id!==blackbird.id&&b.codes.includes('EUBL'));
 assert(codes.includes(escape(english?other.en:other.de)));
}
markupContext.birds=[{id:'other',de:'<script>',codes:['TEST']}];markupContext.english=false;
assert(markupContext.codeGroups(dual).includes('lang="de">&lt;script&gt;</span>'));
console.log('PASS: shared name variants, separate labelled codes, unique dual-source badges, accessible bilingual collisions, safe rendering and unchanged accepted answers across the catalogue.');

markupContext.birds=birds;
for(const target of ['en','de','sci','nl','code']){
 const answer=markupContext.nameAnswerMarkup(blackbird,target);
 const details=markupContext.studyDetailsMarkup(blackbird,target,'de');
 const compact=target==='code'?answer:details;
 assert(compact.includes('species-codes-compact'));
 assert(!compact.includes('code-group-label'),'Study codes have no provenance headings');
 assert(!answer.includes('Also accepted:')&&!answer.includes('Ebenfalls akzeptiert:'));
 for(const code of blackbird.codes)assert.equal(compact.split(`<span data-name-content>${code}</span>`).length-1,1);
}
const common=markupContext.codeMarkup(blackbird,'COBL');assert(common.includes('code-common'));
const styles=readFileSync('dist/style.css','utf8');
assert.match(styles,/\.code-common\{background:#[a-f0-9]+;color:/);
assert.match(styles,/body\.dark \.code-common\{background:#[a-f0-9]+;color:/);
