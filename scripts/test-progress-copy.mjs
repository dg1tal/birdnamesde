import assert from 'node:assert/strict';
import {lessonProgressText,completionMessage,attemptText,masteryText,progressDefinitions,questionReason,questionReasonText} from '../dist/progress-copy.js';
import {evidenceText,statusLabel} from '../dist/learning-model.js';
assert.equal(lessonProgressText({total:10,completed:4,repeats:2}).pending,'Noch offen: 6 Rundenfragen · 2 Zusatzversuche');
assert.equal(lessonProgressText({total:10,completed:4,repeats:2},true).pending,'Remaining: 6 round questions · 2 extra attempts');
for(const en of [false,true])assert.equal(progressDefinitions(en).length,4);
assert.equal(attemptText(1),'Zusatzversuch 1 von höchstens 2 nach einem Fehler');assert.match(masteryText(2),/zeitversetzte/);
assert.equal(statusLabel('think'),'Sicher wiedererkannt');assert.equal(statusLabel('text'),'Sicher abgerufen');assert.equal(statusLabel('flash'),'Nach eigener Einschätzung sicher');
assert.match(evidenceText({confirmations:2},'think'),/Noch im Lernen/);assert.match(evidenceText({confirmations:3},'think'),/Sicher wiedererkannt/);assert.match(evidenceText({legacyPending:true},'text',true),/Earlier progress/);
const before={attempts:2,due:1000};assert.equal(questionReason({progress:undefined,now:1000}),'new');assert.equal(questionReason({progress:before,now:1000}),'due');assert.equal(questionReason({progress:before,now:999}),'practice');assert.equal(questionReason({retry:1,progress:before,now:999}),'retry');
assert.match(questionReasonText({reason:'legacy'}),/früheren Lernstand/);assert.match(questionReasonText({retry:1}),/zählt nicht als neue Rundenfrage/);
console.log('PASS: bilingual counters, separate evidence wording, historical status and frozen question reasons.');

const complete={total:3,completed:3,repeats:0},now=new Date(2026,10,5,12).getTime();
for(const english of [false,true]){
 for(const completed of [0,1,2])assert.equal(completionMessage({...complete,completed},{daily:true,now},english),'');
 assert.equal(completionMessage({...complete,repeats:1},{daily:true,now},english),'');
 assert.equal(completionMessage(complete,{daily:true,pendingDaily:true,now},english),'');
 assert.equal(completionMessage(complete,{daily:true,dueCount:1,now},english),'');
 assert.equal(completionMessage(complete,{daily:true,nextDue:now+60000,now},english),'');
 assert.equal(completionMessage(complete,{daily:true,nextDue:now+86400000,now},english),english?'Daily round complete.':'Tagesrunde erledigt.');
 assert.equal(completionMessage(complete,{now},english),english?'No reviews are due right now.':'Zurzeit sind keine Wiederholungen fällig.');
 assert.equal(completionMessage({total:0,completed:0,repeats:0},{daily:true,now},english),'');
}
console.log('PASS: no completion claims for early endings, pending retries/method attempts, due targets or later reviews today; DE/EN completed rounds remain positive.');
