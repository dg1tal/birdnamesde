// Serializable lesson state. Grading and navigation are separate so restored
// feedback cannot grade an answer twice.
export function validateLesson(value, ids) {
  if (!value || value.version !== 1 || !Array.isArray(value.queue) || !value.queue.length || value.queue.length > 939) return null;
  if (!Number.isInteger(value.index) || value.index < 0 || value.index >= value.queue.length) return null;
  if (!['text','flash','mc'].includes(value.method)) return null;
  if (!value.queue.every(i => i && ids.has(i.id) && ['en','de','code'].includes(i.t) && Number.isInteger(i.retry) && i.retry >= 0 && i.retry <= 2)) return null;
  for (const field of ['answered','correct','firstAnswered','firstCorrect']) if (!Number.isInteger(value[field]) || value[field] < 0) return null;
  if (value.correct > value.answered || value.firstCorrect > value.firstAnswered || value.firstAnswered > value.answered) return null;
  if (typeof value.done !== 'boolean' || typeof value.paused !== 'boolean' || typeof value.hint !== 'boolean') return null;
  if (value.done && (!value.result || typeof value.result.correct !== 'boolean' || typeof value.result.answer !== 'string')) return null;
  if(value.answered !== value.index + (value.done?1:0)) return null;
  if(value.firstAnswered !== value.queue.slice(0,value.index+(value.done?1:0)).filter(i=>!i.retry).length) return null;
  if(value.regionIds!=null&&(!Array.isArray(value.regionIds)||value.regionIds.length>ids.size||!value.regionIds.every(id=>ids.has(id))||!value.queue.every(i=>value.regionIds.includes(i.id))))return null;
  if(value.regionLabel!==undefined&&(typeof value.regionLabel!=='string'||value.regionLabel.length>150))return null;
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
  if (!correct && item.retry < 2) x.queue.splice(Math.min(x.index+4,x.queue.length),0,{...item,retry:item.retry+1});
  return true;
}
