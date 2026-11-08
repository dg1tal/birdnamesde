import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {answerSpecies} from '../dist/logic.js';
import {primaryName} from '../dist/name-languages.js';
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
 nameAnswerMarkup:()=>'<b>Correct answer</b>',scientificNameMarkup:()=>'',germanNames:()=>'',ebirdLink:()=>'',
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

// Name answers separate scientific codes; code-only answers remain one group.
const markupContext={english:false,esc:escape,primaryName,
 acceptedNames:(bird,target)=>[primaryName(bird,target)],contentLanguage:context.contentLanguage};
vm.createContext(markupContext);
vm.runInContext(source.slice(source.indexOf('function nameMarkup('),source.indexOf('\nfunction lookupAliases(')),markupContext);
for(const bird of birds){
 for(const target of ['en','sci','de']){
  const result=markupContext.nameAnswerMarkup(bird,target);
  const main=result.match(/<p class="answer-main answer-name-with-code">(.*?)<\/p>/s)[1];
  const reference=result.match(/<p class="answer-name-with-code answer-code-reference">(.*?)<\/p>/s)?.[1]||'';
  for(const code of bird.codes){
   const scientific=bird.scientificCodes?.includes(code);
   assert.equal(main.includes(`>${code}</span>`),target==='sci'?!!scientific:!scientific);
   assert.equal(reference.includes(`>${code}</span>`),target==='sci'?!scientific:!!scientific);
  }
 }
 const codeAnswer=markupContext.nameAnswerMarkup(bird,'code');
 assert(!codeAnswer.includes('answer-code-reference'));
 const group=codeAnswer.match(/<p class="answer-main answer-codes".*?<\/p>/s)[0];
 for(const code of bird.codes)assert(group.includes(`>${code}</span>`));
}
console.log('PASS: name answers pair scientific codes with Latin names; code-only answers retain every accepted alternative together across the catalogue.');

// Banding provenance remains visible in both lookup and study badges, including overlaps.
for(const bird of birds){
 for(const code of bird.codes){
  for(const answer of [false,true]){
   const html=markupContext.codeMarkup(bird,code,answer);
   assert.equal(html.includes('code-banding'),bird.bandingCode===code);
   assert.equal(html.includes('code-scientific'),!!bird.scientificCodes?.includes(code));
   assert(!html.includes('class="code-type"'));
  }
 }
}
const dual=markupContext.codeMarkup({bandingCode:'TEST',scientificCodes:['TEST'],scientificCodeName:'<script>'},'TEST');
assert.match(dual,/code-banding code-scientific/);
assert.match(dual,/Wissenschaftlicher Kurzcode: &lt;script&gt; · Banding-Code/);
for(const english of [false,true]){
 markupContext.english=english;
 const legend=markupContext.scientificCodeNote(blackbird);
 assert.match(legend,/<span class="code code-scientific">/);
 assert.match(legend,/<span class="code code-banding">/);
 assert(legend.includes(english?'>scientific</span>':'>wissenschaftlich</span>'));
 assert(legend.includes(english?'>banding</span>':'>Beringung</span>'));
 assert(legend.includes('>eBird</span>'));
 assert(!/Purple:|Teal|Violett:|Türkis/.test(legend));
 assert(legend.includes(english?'Codes may refer to more than one species.':'Codes können mehrere Arten bezeichnen.'));
}
console.log('PASS: banding provenance, dual scientific/banding badges, escaped titles and bilingual collision legend.');
