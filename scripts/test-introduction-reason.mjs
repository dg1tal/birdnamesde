import assert from 'node:assert/strict';
import {introductionSelectionReason,introductionReasonText} from '../dist/introduction-reason.js';
import {validateLesson} from '../dist/study-state.js';
import {regionalSnapshot,seasonLabel} from '../dist/hybrid-learning.js';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const settings={regionMode:'seasonal',ids:[]};
const hybrid={season:'autumn',seasonalReady:true,seasonalRequested:true,selectedGroups:['frequent','rare'],frequencyGroups:{frequent:['common'],medium:['medium'],rare:['rare']},additions:[{id:'extra',observedOn:'2026-11-20',expiresOn:'2026-12-04'}]};
const reason=(id,cfg=settings,h=hybrid)=>introductionSelectionReason(id,cfg,h);
for(const [id,expected] of [['common','frequent'],['medium','medium'],['rare','rare'],['extra','current'],['legacy','seasonal']])assert.equal(reason(id),expected);
assert.equal(reason('common',{...settings,ids:['common']}),'selected');
assert.equal(reason('common',{savedRound:true},{}),'saved');
const fallback={...hybrid,seasonalReady:false};
assert.equal(reason('common',settings,fallback),'seasonal-fallback');
const regional={...fallback,seasonalRequested:false};
assert.equal(reason('common',{regionMode:'recent'},regional),'recent');
assert.equal(reason('common',{regionMode:'all'},regional),'regional');

const round={version:2,queue:[{id:'extra',t:'en',retry:0,selectionReason:reason('extra')}],index:0,method:'think',done:false,paused:true,hint:false,answered:0,correct:0,firstAnswered:0,firstCorrect:0,introductions:[0],introIndex:0,regionalContext:regionalSnapshot(hybrid)};
const restored=validateLesson(JSON.parse(JSON.stringify(round)),new Set(['common','extra']));
assert(restored);
hybrid.additions.length=0;hybrid.frequencyGroups.frequent.length=0;
for(const english of [false,true]){
 const text=introductionReasonText(restored.queue[0],restored,'Berlin',english);
 assert.match(text,/Berlin/);assert.match(text,/2026-11-20/);
 assert.match(text,english?/when this round started/:/beim Start dieser Runde/);
 for(const selectionReason of ['saved','selected','current','frequent','medium','rare','seasonal','seasonal-fallback','recent','regional']){
  const copy=introductionReasonText({id:'extra',selectionReason},restored,'Berlin',english);
  assert(copy.length>20);assert(!copy.includes('undefined'));
 }
 assert.match(introductionReasonText({id:'common',selectionReason:'frequent'},restored,'Berlin',english),english?/frequently.*Autumn/:/Herbst.*häufig/);
 assert.match(introductionReasonText({id:'extra'},restored,'Berlin',english),/2026-11-20/);
 assert(!introductionReasonText({id:'common'},restored,'Berlin',english).includes(english?'frequently':'häufig gemeldet'));
}
assert(validateLesson({...round,queue:[{id:'extra',t:'en',retry:0}]},new Set(['extra'])),'Old rounds remain valid');
assert.equal(validateLesson({...round,queue:[{...round.queue[0],selectionReason:'invented'}]},new Set(['extra'])),null);
// Exercise the production round creation and introduction template together.
const appSource=readFileSync('dist/app.js','utf8');
const production=appSource.slice(appSource.indexOf('function startRound('),appSource.indexOf('function lessonProgressMarkup('));
for(const english of [false,true]){
 const app={innerHTML:''};
 const context=vm.createContext({
  english,app,session:null,endedRound:null,storageState:'ready',birds:[{id:'extra'}],
  crypto:{randomUUID:()=> 'test'},lessonBaseLimit:()=>10,regionMetadata:()=>({nameDe:'<Berlin>',nameEn:'<Berlin>'}),
  introductionSelectionReason,introductionReasonText,regionalSnapshot,seasonLabel,
  save(){},renderQuestion(){},studySpecies:()=>({id:'extra'}),studyMode(){},
  document:{body:{classList:{add(){}}}},isCodeTarget:()=>false,
  nameMarkup:()=> 'Vogel',languageLabel:()=> 'English',nameAnswerMarkup:()=> '<p>Bird</p>',
  studyDetailsMarkup:()=> '',studyMoreMarkup:()=> '',storageNotice:()=> '',lessonRegionLabel:()=> '<Berlin>',
  esc:s=>s.replaceAll('<','&lt;').replaceAll('>','&gt;'),$:()=>({}),
  focusElement(){},window:{scrollTo(){}},observeStudyActions(){},observeStudyPhotoLayout(){}
 });
 vm.runInContext(production,context);
 context.startRound([{id:'extra',t:'en',introduce:true}],{...settings,region:'DE-BE',sourceLanguage:'de'},true,restored.regionalContext);
 assert.equal(context.session.queue[0].selectionReason,'current');
 context.session.queue[0].introduced=true;
 context.renderIntroduction(context.session);
 assert.match(app.innerHTML,/id="intro-reason"/);
 assert.match(app.innerHTML,/aria-describedby="intro-instruction intro-reason"/);
 assert.match(app.innerHTML,/&lt;Berlin&gt;/);assert(!app.innerHTML.includes('<Berlin>'));
 assert.match(app.innerHTML,/2026-11-20/);
}
console.log('PASS: introduction selection reasons, exact seasonal groups, current/targeted/saved species, regional fallback, bilingual copy and frozen/legacy round restoration.');
