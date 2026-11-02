import assert from 'node:assert/strict';
import {lessonProgressText,attemptText,masteryText,progressDefinitions,questionReason,questionReasonText} from '../dist/progress-copy.js';
import {lessonProgress,recordLessonAnswer,validateLesson} from '../dist/study-state.js';
import {review,due,mastered} from '../dist/logic.js';

const lesson={version:1,queue:[{id:'eursta',t:'en',retry:0}],index:0,method:'text',paused:false,done:false,hint:false,answered:0,correct:0,firstAnswered:0,firstCorrect:0};
assert.equal(lessonProgressText(lessonProgress(lesson)).primary,'Rundenfragen: 0 von 1 beantwortet');
assert.equal(lessonProgressText(lessonProgress(lesson),true).pending,'Remaining: 1 round question · 0 extra attempts');
recordLessonAnswer(lesson,false,'wrong');
assert.equal(lessonProgressText(lessonProgress(lesson)).pending,'Noch offen: 0 Rundenfragen · 1 Zusatzversuch');
assert.equal(lessonProgressText(lessonProgress(lesson),true).primary,'Round questions: 1 of 1 answered');
// A full bar can still leave an extra attempt, including after pause/reload.
const restored=validateLesson(JSON.parse(JSON.stringify(lesson)),new Set(['eursta']));
assert.deepEqual(lessonProgressText(lessonProgress(restored)),lessonProgressText(lessonProgress(lesson)));
lesson.index++;lesson.done=false;
assert.equal(attemptText(lesson.queue[lesson.index].retry),'Zusatzversuch 1 von höchstens 2 nach einem Fehler');
recordLessonAnswer(lesson,false,'wrong again');
assert.equal(lessonProgressText(lessonProgress(lesson),true).pending,'Remaining: 0 round questions · 1 extra attempt');
lesson.index++;lesson.done=false;
assert.equal(attemptText(lesson.queue[lesson.index].retry,true),'Extra attempt 2 of at most 2 after an error');
recordLessonAnswer(lesson,false,'still wrong');
assert.equal(lessonProgressText(lessonProgress(lesson)).pending,'Noch offen: 0 Rundenfragen · 0 Zusatzversuche');
assert.equal(lesson.firstAnswered,1);assert.equal(lesson.answered,3);
assert.equal(attemptText(0),'Erster Versuch in dieser Runde');
assert.equal(attemptText(0,true),'First attempt in this round');

let record;
for(let n=1;n<=3;n++){
 record=review(record,true,n*1000);
 assert.equal(mastered(record),n===3);
 assert.match(masteryText(record.streak),n===3?/^Beherrscht:/:new RegExp(`${n} von 3`));
}
// Mastery and scheduled reviews overlap; untouched targets are never due.
assert(due(record,record.due));assert(mastered(record));assert(!due(undefined));
assert.match(masteryText(7,true),/^Mastered:/);
record=review(record,true,4000,true);assert(!mastered(record));assert.equal(record.streak,0);
assert.match(masteryText(record.streak,true),/0 of 3/);
record=review(record,false,5000);assert.equal(record.streak,0);
for(const en of [false,true]){
 const definitions=progressDefinitions(en);
 assert.equal(definitions.length,4);
 assert(definitions.every(([term,description])=>term&&description));
}
assert.equal(lessonProgressText({total:10,completed:4,repeats:2}).pending,'Noch offen: 6 Rundenfragen · 2 Zusatzversuche');
assert.equal(lessonProgressText({total:10,completed:4,repeats:2},true).pending,'Remaining: 6 round questions · 2 extra attempts');
console.log('PASS: fixed round totals, first/extra attempts through retry limits and restore, due/mastered overlap and hint/error resets.');

const before={attempts:2,due:1000};
assert.equal(questionReason({progress:undefined,now:1000}),'new');
assert.equal(questionReason({progress:before,now:1000}),'due');
assert.equal(questionReason({progress:before,now:999}),'practice');
assert.equal(questionReason({retry:1,progress:before,now:999}),'retry');
const question={id:'eursta',t:'en',retry:0,reason:questionReason({progress:before,now:1000})};
const graded=review(before,true,1000,false);
assert(graded.due>1000);assert.match(questionReasonText(question),/war vor dieser Frage fällig/);
assert.match(questionReasonText({retry:1,reason:'new'}),/zählt nicht als neue Rundenfrage/);
assert.match(questionReasonText({reason:'new',t:'code'},true),/had not practised this code/);
assert.equal(questionReasonText({retry:0,t:'en'}),'Dieser Vogel gehört zu deiner gewählten Runde.');
const withReason={...lesson,queue:lesson.queue.map(i=>({...i,reason:'due'}))};
assert(validateLesson(withReason,new Set(['eursta'])));
assert.equal(validateLesson({...withReason,queue:withReason.queue.map(i=>({...i,reason:'unknown'}))},new Set(['eursta'])),null);
console.log('PASS: question reasons captured before grading, separate names/codes, retries, neutral legacy fallback and restored metadata.');
