import {validateLesson} from './study-state.js?v=20261108-names2026';

// Countries remain selectable if a regional snapshot is temporarily unavailable.
export const LEARNING_COUNTRIES=[
 {code:'DE',nameDe:'Deutschland',nameEn:'Germany'},
 {code:'NL',nameDe:'Niederlande',nameEn:'Netherlands'},
 {code:'GB',nameDe:'Vereinigtes Königreich (UK)',nameEn:'United Kingdom (UK)'}
];
export const LEARNING_REGION_DEFAULTS={region:'DE',regionMode:'seasonal',frequencyGroups:['frequent','medium']};
export function migrateLearningRegion(settings,previous){
 const migrated={...settings};
 const region=previous?previous.region:settings.region;
 if(typeof region==='string'&&/^[A-Z]{2}(?:-[A-Z0-9]{1,4}){0,2}$/.test(region))migrated.region=region;
 else{
  Object.assign(migrated,structuredClone(LEARNING_REGION_DEFAULTS));
  if(previous)migrated.regionMigrationNotice=true;
 }
 delete migrated.levels;
 return migrated;
}

// First visit adopts the current interface's old preferences. All later visits
// share the same preferences; old keys stay intact as a recovery copy.
export function loadSharedUI(defaults,storage,english){
 const ui=structuredClone(defaults);
 for(const key of ['birdnames-ui-shared-v1',...(english?['birdnames-ui-en','birdnames-ui']:['birdnames-ui','birdnames-ui-en'])]){
  try{
   const value=JSON.parse(storage.getItem(key)||'null');
   if(!value||typeof value!=='object'||Array.isArray(value))continue;
   for(const field of ['lookup','learn'])if(value[field]&&typeof value[field]==='object'&&!Array.isArray(value[field]))ui[field]={...ui[field],...value[field]};
   ui.learn=migrateLearningRegion(ui.learn,value.learn);
   return ui;
  }catch{}
 }
 ui.learn=migrateLearningRegion(ui.learn);
 return ui;
}

export function restoreLessonState(shared,de,en,english,ids,{strict=false}={}){
 const restore=(value,source)=>{
  const lesson=validateLesson(value,ids);if(!lesson){if(strict&&value!=null)throw Error('Ungültige gespeicherte Einheit.');return null;}
  lesson.sourceLanguage??=source;lesson.nameLanguage??=lesson.queue.find(i=>i.t!=='code')?.t||(source==='en'?'de':'en');lesson.paused=true;
  return lesson;
 };
 // A deliberately cleared shared session must never resurrect an old lesson.
 if(strict&&shared!=null&&(shared.version!==1||!Object.hasOwn(shared,'session')||!Array.isArray(shared.pending)||shared.pending.length>2||shared.pending.some(x=>x==null)))throw Error('Ungültige gespeicherte Einheiten.');
 if(shared?.version===1){
  const session=restore(shared.session,'de');
  const pending=Array.isArray(shared.pending)?shared.pending.slice(0,2).map(x=>restore(x,'de')).filter(Boolean):[];
  return {session:session||pending.shift()||null,pending};
 }
 const lessons=(english?[[en,'en'],[de,'de']]:[[de,'de'],[en,'en']]).map(([value,source])=>restore(value,source)).filter(Boolean);
 return {session:lessons.shift()||null,pending:lessons};
}

export function selectionMessage({same,count,unavailable,noGroups,noFrequency,scope},english){
 if(same)return english?'Choose different question and answer languages to start.':'Wähle unterschiedliche Frage- und Antwortsprachen, um zu starten.';
 if(unavailable)return english?'This regional list is unavailable. Choose another region or list in settings.':'Diese regionale Liste ist nicht verfügbar. Wähle in den Einstellungen eine andere Region oder Liste.';
 if(noGroups)return english?'No species group selected. Include at least one group.':'Keine Artengruppe ausgewählt. Beziehe mindestens eine Artengruppe ein.';
 if(count)return english?`${count} ${count===1?'species matches':'species match'} your selection.`:`${count} ${count===1?'Art passt':'Arten passen'} zur Auswahl.`;
 if(noFrequency)return english?'No frequency group selected. Include at least one group or choose another regional list.':'Keine Häufigkeitsstufe ausgewählt. Beziehe mindestens eine Stufe ein oder wähle eine andere regionale Liste.';
 if(scope==='due')return english?'No reviews are due within these species filters. Include all progress or change the species filters.':'Innerhalb dieser Artenfilter sind keine Wiederholungen fällig. Beziehe alle Lernstände ein oder ändere die Artenfilter.';
 if(scope==='wrong')return english?'No species last answered incorrectly match these filters. Include all progress or change the species filters.':'Keine zuletzt falsch beantwortete Art passt zu diesen Filtern. Beziehe alle Lernstände ein oder ändere die Artenfilter.';
 return english?'No matching species. Adjust species groups, learning progress or regional selection in settings.':'Keine passenden Arten. Passe Artengruppen, Lernstand oder regionale Auswahl in den Einstellungen an.';
}
