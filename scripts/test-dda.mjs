import {dailyNewNamesText} from '../dist/learning-selection-copy.js';
import {questionReasonText} from '../dist/progress-copy.js';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {DDA_SOURCE,isCodeTarget,codeTarget,learningTargets,codeLabel,validDdaEntry,validateDdaData,ddaDefinition,reconcileDdaRecords,studySpecies} from '../dist/code-targets.js';
import {accepts,matches,answerSpecies,normalize} from '../dist/logic.js';
import {hasLanguagePair,targetName,primaryName,acceptedNames,languageLabel} from '../dist/name-languages.js';
import {searchLookup} from '../dist/lookup-search.js';
import {practiceQueue,dailyLearningPlan} from '../dist/practice-queue.js';
import {gradeRecord,evidence,beginIntroduction} from '../dist/learning-model.js';
import {inspectBackup} from '../dist/backup.js';
import {validateLesson} from '../dist/study-state.js';
import {scientificNameAliases} from '../dist/scientific-name-aliases.js';
const data=JSON.parse(readFileSync('dist/dda-codes.json'));
const birds=JSON.parse(readFileSync('dist/species.json')).species;
const ids=new Set(birds.map(s=>s.id));
assert.equal(validateDdaData(data,ids),data);assert.equal(data.meta.activeCount,261);
assert.equal(data.meta.sourceCount,262);assert.equal(data.meta.deprecated.length,1);assert.equal(data.meta.review.length,0);
for(const bird of birds)bird.dda=data.species[bird.id];
const blackbird=birds.find(b=>b.de==='Amsel'),swan=birds.find(b=>b.de==='Höckerschwan');
for(const bird of birds.filter(b=>b.dda)){
 assert(validDdaEntry(bird.dda));assert(accepts(bird,'dda',bird.dda.code));assert(accepts(bird,'dda',bird.dda.code.toUpperCase()));
 assert(!accepts(bird,'code',bird.dda.code));assert(!accepts(bird,'dda',bird.codes[0]));
 assert(hasLanguagePair(bird,'de','dda'));assert.equal(targetName(bird,'dda'),bird.dda.code);assert(matches(bird,bird.dda.code));
 assert(searchLookup(birds,bird.dda.code).some(h=>h.species.id===bird.id&&h.rank===0&&h.matches.some(m=>m.language==='dda')));
 assert(!bird.dda.name.startsWith('VERALTET:'));
}
assert(accepts(swan,'dda',' Hoe '));assert(!accepts(swan,'dda','Ho'));
assert(accepts(blackbird,'dda','a'));assert.equal(searchLookup(birds,'A')[0].species.id,blackbird.id);
assert(answerSpecies(birds,'dda','A','de').includes(blackbird));
const absent=birds.find(b=>!b.dda);assert(!hasLanguagePair(absent,'de','dda'));assert.equal(targetName(absent,'dda'),'');
assert.throws(()=>validateDdaData({...data,species:{...data.species,unknown:data.species[blackbird.id]}},ids));
assert.throws(()=>validateDdaData({...data,species:{[blackbird.id]:{...blackbird.dda,code:'AAAA'}}},ids));
assert.throws(()=>validateDdaData({...data,meta:{...data.meta,fetchedAt:'invalid'}},ids));
const settings={target:'mixed',nameLanguage:'en',sourceLanguage:'de',codeSystem:'dda',method:'text'};
assert.deepEqual(learningTargets(settings),['en','dda']);assert.deepEqual(learningTargets({...settings,target:'code'}),['dda']);
assert.deepEqual(learningTargets({...settings,codeSystem:undefined}),['en','code']);
const units=[{id:blackbird.id,t:'dda'}];
let records={[blackbird.id+':code']:gradeRecord(undefined,'de','text',{correct:true,now:1000})};
const plan=dailyLearningPlan({birds:[blackbird,absent],settings:{...settings,target:'code'},selection:{pool:[blackbird,absent],hybrid:{additions:[]}},records,ledger:null,now:2000,random:()=>0});
assert.equal(plan.queue.length,1);assert.equal(plan.queue[0].t,'dda');assert(plan.queue[0].introduce);
for(const method of ['text','flash','think','mc']){
 const queue=practiceQueue({units,records,source:'de',method});assert.equal(queue[0].t,'dda');assert(queue[0].introduce);
}
records[blackbird.id+':dda']={...gradeRecord(undefined,'de','text',{correct:true,now:1000}),ddaDefinition:ddaDefinition(blackbird.dda)};
const r=records[blackbird.id+':dda'];r.contexts['de:recall'].confirmations=3;
const before=structuredClone(r);reconcileDdaRecords(records,birds,5000);assert.deepEqual(r,before);
const revised={...blackbird,dda:{...blackbird.dda,code:'Am'}};
reconcileDdaRecords(records,[revised],5000);assert.equal(evidence(r,'de','text').confirmations,0);assert.equal(evidence(r,'de','text').due,5000);assert.equal(r.attempts,1);assert.equal(r.correct,1);
assert.equal(records[blackbird.id+':code'].attempts,1);
const backup=inspectBackup({app:'BirdNames DE',version:3,records,savedSpecies:[]},ids);assert.equal(backup.count,2);assert.equal(backup.records[blackbird.id+':dda'].ddaDefinition,r.ddaDefinition);
const item={id:blackbird.id,t:'dda',retry:0,dda:structuredClone(blackbird.dda)};
const round={version:2,queue:[item],index:0,method:'text',sourceLanguage:'de',nameLanguage:'en',answered:0,correct:0,firstAnswered:0,firstCorrect:0,done:false,paused:true,hint:false};
assert(validateLesson(round,ids));assert(!validateLesson({...round,queue:[{...item,dda:null}]},ids));
assert.equal(targetName(studySpecies([revised],item),'dda'),'A');
// The production markup keeps reference codes separate from each answer system.
const source=readFileSync('dist/app.js','utf8');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ctx={birds,DDA_SOURCE,isCodeTarget,codeLabel,normalize,primaryName,acceptedNames,languageLabel,scientificNameAliases,esc,english:false,t:x=>x,renderScientificName:()=>'',nameOrigins:null,ebirdLink:()=>''};
vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function scientificNameMarkup('),source.indexOf('function lookupNameList(')),ctx);
for(const english of [false,true]){
 ctx.english=english;
 for(const [bird,expectedOrigins] of [[blackbird,['scientific','common','banding','dda']],[swan,['scientific','banding','dda']],[birds.find(b=>b.de==='Felsentaube'),['scientific','common','banding','dda']]]){
  const dda=ctx.nameAnswerMarkup(bird,'dda'),ebird=ctx.nameAnswerMarkup(bird,'code'),reference=ctx.codeGroups(bird);
  assert(dda.includes(esc(bird.dda.code)));assert(!dda.includes(DDA_SOURCE));assert(!reference.includes(DDA_SOURCE));assert(!dda.includes(bird.codes[0]));assert(!ebird.includes('code-dda'));assert(reference.includes('code-dda'));
  for(const compact of [false,true]){
   const card=ctx.codeGroups(bird,false,compact);
   const row=card.match(/<div class="species-code-items">([\s\S]*?)<\/div>/)[1];
   for(const code of bird.codes)assert(row.includes(`<span data-name-content>${esc(code)}</span>`));
   assert(row.includes(`<span data-name-content lang="de">${esc(bird.dda.code)}</span>`),'DDA sits in the same row as all other origins');
   assert.equal((card.match(/class="species-code-items"/g)||[]).length,1);
   assert.equal((card.match(/class="code-legend"/g)||[]).length,1);
   assert(!card.includes('code-group-label'));
   const legend=card.match(/<ul class="code-legend"[^>]*>([\s\S]*?)<\/ul>/)[1];
   assert(legend.includes('code-dda'));assert(legend.includes('>DDA</li>'));
   assert.deepEqual([...legend.matchAll(/class="code-swatch code-([^"]+)"/g)].map(match=>match[1]),expectedOrigins,'The legend explains exactly the displayed origins');
   assert(card.includes(english?'Code colour key':'Farblegende der Kürzel'));
   assert(legend.includes(english?'Scientific':'Wissenschaftlich'));
  }
  const ddaLegend=dda.match(/<ul class="code-legend"[^>]*>([\s\S]*?)<\/ul>/)[1];
  assert.equal((ddaLegend.match(/<li>/g)||[]).length,1,'DDA answers only describe their own system');
 }
 assert(!ctx.codeGroups(absent).includes('code-dda'),'Unavailable DDA data has no badge or legend entry');
 const scoped=birds.find(b=>b.de==='Felsentaube');assert(ctx.ddaQuestionScope(scoped).includes('Straßentaube'));
 const scopedAnswer=ctx.nameAnswerMarkup(scoped,'dda');
 assert(!scopedAnswer.includes('dda-scope'),'The question already shows the DDA scope; the answer must not repeat it');
 assert.equal((ctx.ddaQuestionScope(scoped)+scopedAnswer).split('class="dda-scope"').length-1,1);
 assert(ctx.codeGroups(scoped).includes('dda-scope'),'Standalone references retain the scope note');
}
assert(!ctx.ddaQuestionScope(blackbird));
assert(dailyNewNamesText([{t:'dda'}],'en').includes('Code'));assert(!dailyNewNamesText([{t:'dda'}],'en').includes('Vogelname'));
assert(questionReasonText({t:'dda',reason:'new'},true).includes('code'));

console.log('PASS: all 261 DDA mappings, source exclusion, search, umlauts, separate methods/queues/progress/backups, changed-answer reviews, frozen paused answers and bilingual production markup.');
