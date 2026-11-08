import {RULES,lessonQueueLimit,lessonBaseLimit} from './learning-model.js?v=20261105-recovery1';
import {isNameLanguage} from './name-languages.js?v=20261108-names2026';
import {validSeasonalDataset} from './hybrid-learning.js?v=20261108-quality1';
// Serializable lesson state. Grading and navigation are separate so restored
// feedback cannot grade an answer twice.
export function validateLesson(value, ids) {
  if (!value || ![1,2].includes(value.version) || !Array.isArray(value.queue) || !value.queue.length || value.queue.length > lessonQueueLimit(ids.size)) return null;
  if(value.queue.filter(i=>i?.retry===0).length>lessonBaseLimit(ids.size))return null;
  if (!Number.isInteger(value.index) || value.index < 0 || value.index >= value.queue.length) return null;
  if (!['text','flash','mc','think'].includes(value.method)) return null;
  if (!value.queue.every(i => i && ids.has(i.id) && (isNameLanguage(i.t)||i.t==='code') && Number.isInteger(i.retry) && i.retry >= 0 && i.retry <= RULES.maxRetries)) return null;
  if(!value.queue.every(i=>i.reason===undefined||['new','due','practice','retry','legacy'].includes(i.reason)))return null;
  for (const field of ['answered','correct','firstAnswered','firstCorrect']) if (!Number.isInteger(value[field]) || value[field] < 0) return null;
  if (value.correct > value.answered || value.firstCorrect > value.firstAnswered || value.firstAnswered > value.answered) return null;
  if (typeof value.done !== 'boolean' || typeof value.paused !== 'boolean' || typeof value.hint !== 'boolean') return null;
  if (value.done && (!value.result || typeof value.result.correct !== 'boolean' || typeof value.result.answer !== 'string')) return null;
  if(value.answered !== value.index + (value.done?1:0)) return null;
  if(value.firstAnswered !== value.queue.slice(0,value.index+(value.done?1:0)).filter(i=>!i.retry).length) return null;
  if(value.regionIds!=null&&(!Array.isArray(value.regionIds)||value.regionIds.length>ids.size||!value.regionIds.every(id=>ids.has(id))||!value.queue.every(i=>value.regionIds.includes(i.id))))return null;
  if(value.regionLabel!==undefined&&(typeof value.regionLabel!=='string'||value.regionLabel.length>150))return null;
  if(value.sourceLanguage!==undefined&&!isNameLanguage(value.sourceLanguage))return null;
  if(value.nameLanguage!==undefined&&!isNameLanguage(value.nameLanguage))return null;
  if(value.regionalContext!=null){
    const h=value.regionalContext;
    if(h.seasonalDataset!=null&&!validSeasonalDataset(h.seasonalDataset))return null;
    if(h.selectedGroups!=null&&(!Array.isArray(h.selectedGroups)||h.selectedGroups.length>3||new Set(h.selectedGroups).size!==h.selectedGroups.length||!h.selectedGroups.every(g=>['frequent','medium','rare'].includes(g))))return null;
    if(!['winter','spring','summer','autumn'].includes(h.season)||typeof h.seasonalReady!=='boolean'||typeof h.seasonalRequested!=='boolean'||!Array.isArray(h.additions)||h.additions.length>ids.size||!h.additions.every(r=>r&&ids.has(r.id)&&/^\d{4}-\d{2}-\d{2}$/.test(r.observedOn)&&/^\d{4}-\d{2}-\d{2}$/.test(r.expiresOn)&&Date.parse(r.expiresOn)-Date.parse(r.observedOn)===14*86400000))return null;
  }
  for(const i of value.queue){
    if(i.choices!==undefined&&(!Array.isArray(i.choices)||!i.choices.length||i.choices.length>4||!i.choices.every(v=>typeof v==='string'&&v.length<=300)))return null;
    if(i.optionsVisible!==undefined&&typeof i.optionsVisible!=='boolean')return null;
    if(i.introduce!==undefined&&typeof i.introduce!=='boolean')return null;
  }
  if(value.introductions!==undefined&&(!Array.isArray(value.introductions)||!value.introductions.every(n=>Number.isInteger(n)&&n>=0&&n<value.queue.length)))return null;
  if(value.introIndex!==undefined&&(!Number.isInteger(value.introIndex)||value.introIndex<0||value.introIndex>(value.introductions?.length||0)))return null;
  const lesson = structuredClone(value);
  lesson.photos = !!lesson.photos;
  lesson.revealed = !!lesson.revealed;
  lesson.draft = typeof lesson.draft === 'string' ? lesson.draft.slice(0,300) : '';
  return lesson;
}
export function lessonProgress(x) {
  const total = x.queue.filter(i => i.retry === 0).length;
  const completed = x.queue.slice(0,x.index + (x.done ? 1 : 0)).filter(i => i.retry === 0).length;
  const repeats = x.queue.slice(x.index + (x.done ? 1 : 0)).filter(i => i.retry > 0).length;
  return {total,completed,repeats};
}
export function recordLessonAnswer(x, correct, answer='') {
  if (x.done) return false;
  const item = x.queue[x.index];
  x.done = true;
  x.result = {correct,answer:String(answer).slice(0,300)};
  x.answered++;
  x.correct += +correct;
  if (!item.retry) { x.firstAnswered++; x.firstCorrect += +correct; }
  if ((!correct || x.hint) && item.retry < RULES.maxRetries && x.index+1<x.queue.length) x.queue.splice(Math.min(x.index+4,x.queue.length),0,{...item,retry:item.retry+1,reason:'retry',introduce:false,uid:(item.uid||String(x.index))+':retry'+(item.retry+1),choices:undefined,optionsVisible:false});
  x.supported=(x.supported||0)+ +(correct&&x.hint);
  return true;
}
