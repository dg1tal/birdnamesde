import assert from 'node:assert/strict';
import {RULES,reviewEvidence,gradeRecord,migrateRecords,evidence,secure,contextKey,dailyQueue,localDay,dailyLedger,introduce,beginIntroduction,pairKnown} from '../dist/learning-model.js';
import {validProgress} from '../dist/logic.js';
import {inspectBackup} from '../dist/backup.js';
const day=RULES.minGap,now=new Date(2026,10,2,12).getTime();
let p=reviewEvidence(undefined,{correct:true,now});assert.equal(p.confirmations,0);assert.equal(p.due,now+day);
for(let n=1;n<=3;n++){p=reviewEvidence(p,{correct:true,now:p.due});assert.equal(p.confirmations,n);assert.equal(secure(p),n>=3);assert.equal(p.interval,[3,7,14][n-1]);}
const secureP=p;const early=reviewEvidence(p,{correct:true,now:p.last+1000});assert.equal(early.confirmations,3);assert.equal(early.due,p.due);
const hinted=reviewEvidence(p,{correct:true,hint:true,now:p.due});assert.equal(hinted.confirmations,3);assert(hinted.due<=p.due+day);
const wrong=reviewEvidence(p,{correct:false,now:p.due});assert.equal(wrong.confirmations,0);assert.equal(wrong.stage,2);assert.equal(wrong.due,p.due+RULES.retryDelay);
const retry=reviewEvidence(wrong,{correct:true,retry:1,now:wrong.last+1000});assert.equal(retry.confirmations,0);assert.equal(retry.due,wrong.due);
const withinDay=reviewEvidence(retry,{correct:true,now:retry.due});assert.equal(withinDay.confirmations,0);assert.equal(withinDay.due,retry.due+day);
let failedFirst=reviewEvidence(undefined,{correct:false,now});const repaired=reviewEvidence(failedFirst,{correct:true,retry:1,now:now+1000});assert.equal(repaired.due,failedFirst.due);assert.equal(repaired.confirmations,0);const initialHint=reviewEvidence(undefined,{correct:true,hint:true,now});const initialRecall=reviewEvidence(initialHint,{correct:true,now:initialHint.due});assert.equal(initialRecall.confirmations,0);
const spaced=reviewEvidence(withinDay,{correct:true,now:withinDay.last+day});assert.equal(spaced.confirmations,1);
let r=gradeRecord(undefined,'de','think',{correct:true,now,gradeId:'one'});assert.equal(r.attempts,1);assert.equal(evidence(r,'de','mc').attempts,1);assert.equal(evidence(r,'de','text'),undefined);assert.equal(evidence(r,'nl','think'),undefined);
assert.equal(gradeRecord(r,'de','think',{correct:true,now,gradeId:'one'}),r);
r=gradeRecord(r,'de','text',{correct:true,now,gradeId:'two'});assert.equal(r.attempts,2);assert.equal(evidence(r,'de','text').confirmations,0);
const old={attempts:10,correct:9,streak:3,lapses:1,last:now-day*3,lastWrong:false,interval:7,due:now};const records=migrateRecords({'a:en':old});assert.equal(records['a:en'].attempts,10);assert.equal(evidence(records['a:en'],'de','think').legacyPending,true);assert(!secure(evidence(records['a:en'],'de','think')));
const claimed=gradeRecord(records['a:en'],'de','think',{correct:true,now,gradeId:'legacy'});assert.equal(claimed.attempts,11);assert.equal(evidence(claimed,'de','mc').attempts,1);assert.equal(evidence(claimed,'nl','mc'),undefined);assert.equal(claimed.legacy.due,old.due);
const units=Array.from({length:20},(_,i)=>({id:String(i),t:'en',allowNew:true}));
let plan=dailyQueue({units,records:{},source:'de',method:'think',now});assert.equal(plan.queue.length,3);assert.equal(plan.newCount,3);
let ledger=null;for(const u of plan.queue)ledger=introduce(ledger,'de:'+u.id+':en',now);assert.equal(ledger.introduced.length,3);assert.equal(dailyLedger(ledger,now+day).introduced.length,0);
assert.equal(dailyQueue({units,records:{},source:'nl',method:'text',ledger,now}).newCount,0);
const dueRecords=Object.fromEntries(units.slice(0,12).map(u=>[u.id+':en',{...r,contexts:{[contextKey('de','think')]:{...secureP,due:now,last:now-day}}}]));
plan=dailyQueue({units:units.map(u=>({...u,allowNew:false})),records:dueRecords,source:'de',method:'think',ledger,now});assert.equal(plan.queue.length,10);assert.equal(plan.more,2);assert.equal(plan.newCount,0);
const mix=dailyQueue({units:[{id:'x',t:'en',allowNew:false},{id:'x',t:'code',allowNew:false}],records:{'x:en':{...r,contexts:{'de:recognition':{...p,due:now}}},'x:code':{...r,contexts:{'de:recognition':{...p,due:now+day}}}},source:'de',method:'think',now});assert.deepEqual(mix.queue.map(u=>u.t),['en']);
let introduced=beginIntroduction(undefined,'de','think',now);assert(pairKnown(introduced,'de'));assert.equal(introduced.attempts,0);introduced=gradeRecord(introduced,'de','think',{correct:true,now:now+1000,gradeId:'first'});assert.equal(evidence(introduced,'de','think').due,now+1000+day);assert.equal(evidence(introduced,'de','think').confirmations,0);
const ids=new Set(['a']);const file={app:'BirdNames DE',version:2,records:{'a:en':claimed},daily:ledger};assert.deepEqual(validProgress(file,ids),file.records);assert.deepEqual(inspectBackup(file,ids).daily,ledger);
assert.throws(()=>inspectBackup({...file,daily:{date:'bad',introduced:[]}},ids));assert.throws(()=>validProgress({...file,records:{'a:en':{...claimed,contexts:{'de:recognition':{...p,stage:100}}}}},ids));
console.log('PASS: spaced evidence, early/retry/hint outcomes, mode/language separation, idempotent grading, historical migration, daily limits, filters, mixed targets and v2 backups.');

const knownMethod=dailyQueue({units:[{id:'a',t:'en',allowNew:true}],records:{'a:en':claimed},source:'de',method:'text',ledger,now});assert.equal(knownMethod.newCount,0);assert.equal(knownMethod.practiceCount,1);

const earlyLegacy=reviewEvidence({...evidence(records['a:en'],'de','think'),due:now+1000},{correct:true,now});assert.equal(earlyLegacy.due,now+1000);
