import {validateLesson} from './study-state.js';

// First visit adopts the current interface's old preferences. All later visits
// share the same preferences; old keys stay intact as a recovery copy.
export function loadSharedUI(defaults,storage,english){
 const ui=structuredClone(defaults);
 for(const key of ['birdnames-ui-shared-v1',...(english?['birdnames-ui-en','birdnames-ui']:['birdnames-ui','birdnames-ui-en'])]){
  try{
   const value=JSON.parse(storage.getItem(key)||'null');
   if(!value||typeof value!=='object'||Array.isArray(value))continue;
   for(const field of ['lookup','learn'])if(value[field]&&typeof value[field]==='object'&&!Array.isArray(value[field]))ui[field]={...ui[field],...value[field]};
   return ui;
  }catch{}
 }
 return ui;
}

export function restoreLessonState(shared,de,en,english,ids){
 const restore=(value,source)=>{
  const lesson=validateLesson(value,ids);if(!lesson)return null;
  lesson.sourceLanguage??=source;lesson.nameLanguage??=lesson.queue.find(i=>i.t!=='code')?.t||(source==='en'?'de':'en');lesson.paused=true;
  return lesson;
 };
 // A deliberately cleared shared session must never resurrect an old lesson.
 if(shared?.version===1){
  const session=restore(shared.session,'de');
  const pending=Array.isArray(shared.pending)?shared.pending.slice(0,2).map(x=>restore(x,'de')).filter(Boolean):[];
  return {session:session||pending.shift()||null,pending};
 }
 const lessons=(english?[[en,'en'],[de,'de']]:[[de,'de'],[en,'en']]).map(([value,source])=>restore(value,source)).filter(Boolean);
 return {session:lessons.shift()||null,pending:lessons};
}

export function selectionMessage({same,count,unavailable},english){
 if(same)return english?'Choose different question and answer languages to start.':'Wähle unterschiedliche Frage- und Antwortsprachen, um zu starten.';
 if(unavailable)return english?'This regional list is unavailable. Change or remove the regional filter in settings.':'Diese regionale Liste ist nicht verfügbar. Ändere oder entferne den Regionsfilter in den Einstellungen.';
 if(count)return english?`${count} ${count===1?'species matches':'species match'} your selection.`:`${count} ${count===1?'Art passt':'Arten passen'} zur Auswahl.`;
 return english?'No matching species. Adjust vocabulary levels, species groups, learning progress or regional filters in settings.':'Keine passenden Arten. Passe Lernstufen, Artengruppen, Lernstand oder Regionsfilter in den Einstellungen an.';
}
