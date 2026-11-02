import {validateSeasonal,hybridSelection,hybridQueue,seasonLabel,FREQUENCY_GROUPS,frequencyGroups,frequencyLabel} from './hybrid-learning.js?v=20261102-frequency1';
import {SPECIES_PACKAGES,speciesPackageControls} from './species-packages.js?v=20261102-packages1';
import {createAnnouncer,setTextIfChanged,focusElement,contentLanguage,queueFocus,activateView} from './accessibility.js?v=20261101-wave2';
import {persistLearningState} from './learning-storage.js?v=20261101-wave2';
import {inspectBackup,backupSummary,backupFilename,backupPanel,backupPreview} from './backup.js?v=20261101-wave2';
import {lessonProgressText,attemptText,masteryText,progressDefinitions} from './progress-copy.js?v=20261101-progress2';
import {studyViewportMetrics,studyScrollDelta} from './study-viewport.js?v=20261101-keyboard5';
import {studyPhotoHeight} from './study-photo-layout.js?v=20261101-adaptive1';
import {renderInformation} from './info-page.js?v=20261102-frequency1';
import {loadSharedUI,restoreLessonState,selectionMessage} from './learning-settings.js?v=20261102-frequency1';
import {NAME_LANGUAGES,isNameLanguage,languageLabel,primaryName,acceptedNames,loadNameData,hasLanguagePair,targetName} from './name-languages.js?v=20261101-scientific1';
import {validateRegions,regionalSelection,regionAllows,regionalDataStale,regionChildren,topRegion} from './regions.js?v=20261029-uklocal1';
import {english,localize,t,reviewMessage,importErrorMessage} from './i18n.js?v=20261102-packages1';
const defaultNameTarget=english?'de':'en';
let nameTarget=defaultNameTarget,availableNameLanguages=['de','en'];
import {validateLesson,lessonProgress,recordLessonAnswer} from './study-state.js?v=20261102-frequency1';
import {createPhotoCache} from './photo-cache.js';
import {normalize,matches,accepts,review,mastered,due} from './logic.js?v=20261101-wave2';
const $=s=>document.querySelector(s),main=$('#app');
let app=$('#nachschlagen');
$('#app-start-status').setAttribute('role','status');$('#app-start-status').textContent=t('Artenbestand wird geladen …');
const announce=createAnnouncer($('#a11y-status'));
$('#skip-content').onclick=event=>{event.preventDefault();focusElement($('#answer')||$('#search')||$('main h1')||main);};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let birds=[],meta={},records={},db,storageOK=true,session=null,pendingLessons=[],theme='system';
// Loaded separately from the taxonomy so media updates cannot overwrite species data.
let photos={};
let germanNamesMeta={};
let regionalData=null,seasonalData=null,currentNotable=null;
const defaults={lookup:{query:'',group:'',region:'',regionMode:'all',photos:false,scroll:0},learn:{target:nameTarget,nameLanguage:nameTarget,sourceLanguage:english?'en':'de',method:'mc',scope:'all',count:'10',levels:[1],groups:null,ids:[],photos:true,region:'',regionMode:'seasonal',frequencyGroups:['frequent','medium']}};
let hasRouted=false;
let ui=structuredClone(defaults);
try{ui=loadSharedUI(defaults,localStorage,english);}catch{}
function saveUI(){try{localStorage.setItem('birdnames-ui-shared-v1',JSON.stringify(ui));}catch{}}
let lookupPhotos=!!ui.lookup.photos,learnPhotos=!!ui.learn.photos,skipNextRoute=false;
window.addEventListener('pagehide',()=>{rememberLookup();});
window.addEventListener('scroll',()=>{const top=$('#back-top');if(top)top.hidden=window.scrollY<600;},{passive:true});
const studyPhotos=createPhotoCache({baseURL:document.baseURI});
const speciesPhotos=s=>photos[s.id]?[photos[s.id],...(photos[s.id].additional||[])]:[];
function warmStudyPhotos(x){if(x.photos)studyPhotos.warm(x.queue.slice(x.index,x.index+3).flatMap(item=>speciesPhotos(item)));}
function mountStudyPhoto(s){const images=speciesPhotos(s);document.querySelectorAll('#feedback .study-photo-slot').forEach(slot=>{const p=images[+slot.dataset.photoIndex];if(!p)return;studyPhotos.get(p).then(image=>{if(!slot.isConnected)return;image.className='species-photo';image.alt=s.de+(p.label?' – '+t(p.label):'')+' ('+s.sci+')';image.width=p.width;image.height=p.height;slot.replaceWith(image);}).catch(()=>{if(!slot.isConnected)return;const figure=slot.closest('.bird-photo');slot.parentElement.hidden=true;figure.querySelector('.photo-error').hidden=false;});});}
const ebirdLink=s=>`<a class="species-ebird" href="https://ebird.org/species/${encodeURIComponent(s.id)}" target="_blank" rel="noopener noreferrer">Art auf eBird ↗<span class="sr">: ${esc(s.de)}</span></a>`;
const gallery=s=>`https://media.ebird.org/catalog?mediaType=photo&taxonCode=${encodeURIComponent(s.id)}`;
const photoFallback=s=>`<p class="photo-fallback">Bild derzeit nicht verfügbar. <a href="${gallery(s)}" target="_blank" rel="noopener noreferrer">eBird-Fotogalerie öffnen ↗</a></p>`;
function photoMarkup(s,study=false,expanded=false) {
 const images=speciesPhotos(s);if(!images.length)return photoFallback(s);
 return `<div class="photo-set${images.length>1?' photo-set-multiple':''}${images.some(p=>p.mediaType==='illustration')?' photo-set-illustrated':''}">${images.map((p,index)=>{
  const img=study?`<span class="study-photo-slot" data-photo-index="${index}" aria-hidden="true"></span>`:`<img class="species-photo" src="${esc(p.local)}" alt="${esc(s.de)}${p.label?' – '+esc(t(p.label)):''} (${esc(s.sci)})" width="${p.width}" height="${p.height}" loading="${expanded?'eager':'lazy'}" decoding="async">`;
  return `<figure class="bird-photo${p.mediaType==='illustration'?' bird-illustration':''}">${p.mediaType==='illustration'?'<div class="media-badge">Historische Illustration</div>':''}${p.label?`<div class="photo-label">${esc(t(p.label))}</div>`:''}${expanded?`<div class="photo-visual">${img}</div>`:`<button type="button" class="photo-visual photo-zoom" data-photo-species="${esc(s.id)}" aria-label="${esc(s.de)}${p.label?' – '+esc(t(p.label)):''}: Bilder vergrößern">${img}<span class="zoom-hint" aria-hidden="true">⤢ Vergrößern</span></button>`}<div class="photo-error" hidden>${photoFallback(s)}</div><figcaption>${p.comparisonDescription?`<p class="comparison-description">${esc(t(p.comparisonDescription))}</p>`:''}${p.mediaType==='illustration'?'Illustration':'Foto'}: ${esc(p.attribution||p.credit)} · <a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer" title="${esc(p.title)}">Wikimedia Commons ↗</a> · <a href="${esc(p.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.license)}</a><details class="photo-credit"><summary>Bildnachweis</summary><p>${esc(p.title)} · ${esc(t(p.transformation||'für die Anzeige verkleinert, Inhalt unverändert'))}${p.verificationUrl?` · <a href="${esc(p.verificationUrl)}" target="_blank" rel="noopener noreferrer">Originallegende ↗</a>`:''}${p.attribution&&p.attribution!==p.credit?' · Urheber: '+esc(p.credit):''}.</p></details></figcaption></figure>`;
 }).join('')}</div>${photos[s.id].comparisonMissing?`<p class="photo-fallback">Geschlechtervergleich noch unvollständig. <a href="${gallery(s)}" target="_blank" rel="noopener noreferrer">Weitere Fotos auf eBird ↗</a></p>`:''}`;
}
let photoInvoker=null;
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-photo-species]');if(!button)return;
 const s=birds.find(s=>s.id===button.dataset.photoSpecies);if(!s)return;
 let dialog=$('#photo-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='photo-dialog';dialog.setAttribute('aria-labelledby','photo-dialog-title');document.body.append(dialog);dialog.addEventListener('close',()=>{focusElement(photoInvoker,{preventScroll:true});photoInvoker=null;});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
 dialog.innerHTML=`<div class="dialog-header"><h2 id="photo-dialog-title">${esc(s.de)}</h2><button id="close-photo">Schließen ×</button></div>${photoMarkup(s,false,true)}<p class="muted">Fotos und Illustrationen sind nicht maßstabsgetreu. Bei historischen Abbildungen kann die Farbwiedergabe vom heutigen Foto abweichen.</p>`;
 photoInvoker=button;$('#close-photo').onclick=()=>dialog.close();dialog.showModal();dialog.scrollTop=0;$('#close-photo').focus({preventScroll:true});
});
document.addEventListener('error',event=>{const img=event.target;if(img instanceof HTMLImageElement&&img.classList.contains('species-photo')){const figure=img.closest('.bird-photo');img.parentElement.hidden=true;figure.querySelector('.photo-error').hidden=false;}},true);
const levels=SPECIES_PACKAGES.map(p=>p.de);
let studyPhotoFrame=0;
const studyPhotoObserver=new ResizeObserver(scheduleStudyPhotoLayout);
function scheduleStudyPhotoLayout(){
  if(studyPhotoFrame)return;
  studyPhotoFrame=requestAnimationFrame(()=>{
    studyPhotoFrame=0;
    if(!document.body.classList.contains('studying'))return;
    const set=$('#feedback .photo-set'),actions=$('#feedback .study-actions');
    const visuals=set?[...set.querySelectorAll('.photo-visual')].filter(el=>el.getClientRects().length):[];
    if(!visuals.length||!actions)return;
    const rowTop=Math.min(...visuals.map(el=>el.closest('.bird-photo').getBoundingClientRect().top));
    const firstRow=visuals.filter(el=>Math.abs(el.closest('.bird-photo').getBoundingClientRect().top-rowTop)<2);
    const photoTop=Math.max(...firstRow.map(el=>el.getBoundingClientRect().top+window.scrollY));
    const viewport=window.visualViewport;
    // Document coordinates keep image sizing stable while scrolling through the text.
    const height=studyPhotoHeight({photoTop,
      viewportBottom:viewport?viewport.offsetTop+viewport.height:window.innerHeight,
      actionsTop:actions.getBoundingClientRect().top});
    const value=height+'px';
    if(set.style.getPropertyValue('--study-photo-height')!==value)set.style.setProperty('--study-photo-height',value);
  });
}
function observeStudyPhotoLayout(){
  studyPhotoObserver.disconnect();
  if(!$('#feedback .photo-set'))return;
  studyPhotoObserver.observe($('.question'));studyPhotoObserver.observe($('#feedback .study-actions'));
  scheduleStudyPhotoLayout();
}
let studyVisibilityFrame=0,studyFocusPinned=true;
const studyActionsObserver=new ResizeObserver(()=>updateStudyViewport(true));
function studyMode(active){
  announce.clear();
  studyPhotoObserver.disconnect();studyActionsObserver.disconnect();
  document.body.classList.toggle('studying',active);updateStudyViewport();
}
function ensureStudyFocusVisible(){
  if(studyVisibilityFrame)return;
  studyVisibilityFrame=requestAnimationFrame(()=>{
    studyVisibilityFrame=0;
    if(!studyFocusPinned||!document.body.classList.contains('studying')||$('#photo-dialog')?.open)return;
    const focused=document.activeElement;
    const input=focused?.id==='answer';
    const feedback=focused?.matches('#feedback h2');
    const flash=focused?.matches('#revealed-answer,#yes,#no');
    if(!input&&!feedback&&!flash)return;
    const bar=$('.study-actions');if(!bar)return;
    const v=window.visualViewport;
    const metrics=studyViewportMetrics({layoutHeight:window.innerHeight,viewportHeight:v?.height,offsetTop:v?.offsetTop});
    const first=input?focused:flash?$('#answer-area').firstElementChild:$('#feedback .feedback-result');
    const last=input?($('#hint-text')?.textContent?$('#hint-text'):focused):flash?$('#answer-area .study-actions').previousElementSibling:$('#feedback .feedback-answer');
    const delta=studyScrollDelta({top:first.getBoundingClientRect().top,bottom:last.getBoundingClientRect().bottom,
      visibleTop:metrics.top,visibleBottom:Math.min(metrics.bottom,bar.getBoundingClientRect().top)});
    if(Math.abs(delta)>1)window.scrollBy({top:delta,behavior:'instant'});
  });
}
function updateStudyViewport(reveal=false){
  const root=document.documentElement;
  if(!document.body.classList.contains('studying')){
    root.style.removeProperty('--study-keyboard-inset');root.style.removeProperty('--study-bottom-space');return;
  }
  const v=window.visualViewport,bar=$('.study-actions');
  const metrics=studyViewportMetrics({layoutHeight:window.innerHeight,viewportHeight:v?.height,offsetTop:v?.offsetTop,actionsHeight:bar?.getBoundingClientRect().height});
  root.style.setProperty('--study-keyboard-inset',metrics.inset+'px');
  root.style.setProperty('--study-bottom-space',metrics.padding+'px');
  scheduleStudyPhotoLayout();if(reveal)ensureStudyFocusVisible();
}
function observeStudyActions(){
  studyActionsObserver.disconnect();const bar=$('.study-actions');if(bar)studyActionsObserver.observe(bar);
  updateStudyViewport(true);
}
// Scroll events reposition the bar, but never fight a reader's manual scrolling.
window.visualViewport?.addEventListener('resize',()=>updateStudyViewport(true));
window.visualViewport?.addEventListener('scroll',()=>updateStudyViewport());
window.addEventListener('resize',()=>updateStudyViewport(true));
document.addEventListener('focusin',event=>{
  if(event.target.matches('#answer,#feedback h2,#revealed-answer,#yes,#no')){studyFocusPinned=true;ensureStudyFocusVisible();}
});
// Mobile browser chrome can resize during a swipe. Once the user starts reading,
// those resizes must not pull the page back to the still-focused result heading.
for(const type of ['wheel','touchmove'])document.addEventListener(type,()=>{studyFocusPinned=false;},{passive:true});
document.addEventListener('keydown',event=>{
  if(document.activeElement?.id!=='answer'&&['PageDown','PageUp','Home','End','ArrowDown','ArrowUp'].includes(event.key))studyFocusPinned=false;
});
document.addEventListener('pointerdown',event=>{
  if(document.activeElement?.id==='answer'&&event.target.closest('#hint,#answer-form .input-clear'))event.preventDefault();
});

const key=(s,t)=>s.id+':'+t,progress=(s,t)=>records[key(s,t)];
try{const savedTheme=localStorage.getItem('birdnames-theme');if(['system','light','dark'].includes(savedTheme))theme=savedTheme;}catch{}
function applyTheme(){
 document.body.classList.toggle('dark',theme==='dark'||(theme==='system'&&matchMedia('(prefers-color-scheme:dark)').matches));
 $('#theme-picker').setAttribute('aria-label',english?'Appearance':'Farbschema');
 const labels=english?{system:'System settings',light:'Day',dark:'Night'}:{system:'Systemeinstellungen',light:'Tag',dark:'Nacht'};
 document.querySelectorAll('[data-theme]').forEach(button=>{
  const selected=button.dataset.theme===theme;
  button.setAttribute('aria-pressed',String(selected));button.title=labels[button.dataset.theme];button.setAttribute('aria-label',labels[button.dataset.theme]);
 });
}
localize();
document.querySelectorAll('[data-ui-language]').forEach(button=>button.onclick=async()=>{if(button.dataset.uiLanguage===(english?'en':'de'))return;rememberLookup();saveUI();await save();try{sessionStorage.setItem('birdnames-interface-reload',JSON.stringify({at:Date.now(),resume:!!session&&!session.paused}));localStorage.setItem('birdnames-language',button.dataset.uiLanguage);}catch{}location.reload();});
applyTheme();matchMedia('(prefers-color-scheme:dark)').addEventListener('change',applyTheme);
document.querySelectorAll('[data-theme]').forEach(button=>button.onclick=()=>{theme=button.dataset.theme;applyTheme();try{localStorage.setItem('birdnames-theme',theme)}catch{}});
async function initDB(){return new Promise((resolve,reject)=>{
 const req=indexedDB.open('birdnames-de',1);req.onupgradeneeded=()=>req.result.createObjectStore('state');req.onerror=()=>reject(req.error);
 req.onsuccess=()=>{db=req.result;const tx=db.transaction('state'),store=tx.objectStore('state'),r=store.get('records'),shared=store.get('lesson-state-v2'),de=store.get('lesson'),en=store.get('lesson-en');
 tx.oncomplete=()=>{records=r.result||{};const restored=restoreLessonState(shared.result,de.result,en.result,english,new Set(birds.map(s=>s.id)));session=restored.session;pendingLessons=restored.pending;
 let resume=false;try{const flag=JSON.parse(sessionStorage.getItem('birdnames-interface-reload')||'null');sessionStorage.removeItem('birdnames-interface-reload');resume=flag?.resume&&Date.now()-flag.at>=0&&Date.now()-flag.at<10000;}catch{}
 if(session)session.paused=!resume;resolve();};tx.onerror=()=>reject(tx.error);};
});}
async function save(state={records,session,pending:pendingLessons}){
 storageOK=await persistLearningState(db,state);return storageOK;
}
function storageNotice(){return storageOK?'':`<p class="notice" role="alert">${english?'Your browser cannot save progress right now. Before closing, download a backup under Statistics → Back up or restore progress.':'Der Browser kann den Lernstand gerade nicht speichern. Lade vor dem Schließen eine Sicherung unter Statistik → Lernstand sichern oder wiederherstellen herunter.'}</p>`;}
const opt=(v,l=v,selected=false)=>`<option value="${esc(v)}"${selected?' selected':''}>${esc(l)}</option>`;
const groups=()=>[...new Set(birds.map(s=>s.group))].sort((a,b)=>a.localeCompare(b,'de'));
function nameMarkup(s,code){return `<span data-name-content${code==='sci'?' lang="la" class="scientific-name"':` lang="${esc(code)}"`}>${esc(primaryName(s,code))}</span>`;}
function nameAnswerMarkup(s,target){
 if(target==='code')return `<p class="answer-main code">${esc(s.codes[0])}</p>`;
 const aliases=acceptedNames(s,target).filter(n=>n!==primaryName(s,target));
 return `<p class="answer-main">${nameMarkup(s,target)}</p>${aliases.length?`<p class="answer-aliases"><span class="muted">${english?'Also accepted:':'Ebenfalls akzeptiert:'}</span> <span data-name-content lang="${esc(contentLanguage(target))}">${aliases.map(esc).join(' · ')}</span></p>`:''}`;
}
function englishNames(s){return s.enGB?`<div class="english-variants" data-name-content lang="en"><span><span class="variant-label">US</span> ${esc(s.en)}</span><span><span class="variant-label">GB</span> ${esc(s.enGB)}</span></div>`:`<p class="english" data-name-content lang="en">${esc(s.en)}</p>`;}
const otherEnglishNames=s=>s.aliases.en.filter(name=>name!==s.enGB);
function germanNames(s){
 const names=s.germanNames||[];if(!names.length)return '';
 const groups=[['alternative','Alternative deutsche Namen'],['historical','Historische deutsche Namen']];
 return `<div class="german-names">${groups.map(([status,label])=>{const a=names.filter(n=>n.status===status);return a.length?`<p><span class="muted">${label}:</span> ${a.map(n=>`${nameMarkup({de:n.name},'de')}${n.region?' ('+esc(t(n.region))+')':''}${n.ambiguous?' <span class="muted">(mehrdeutig)</span>':''}`).join(' · ')}</p>`:'';}).join('')}<details class="name-sources"><summary>Quellen zu deutschen Namen</summary><ul>${names.map(n=>`<li><strong data-name-content lang="de">${esc(n.name)}:</strong> ${esc(t(n.note))} <a href="${esc(n.source)}" target="_blank" rel="noopener noreferrer">${esc(n.sourceTitle)} ↗</a></li>`).join('')}</ul></details></div>`;
}

function lookupNameList(s){
 const rows=NAME_LANGUAGES.filter(language=>language.code!=='de').map(language=>{
  const name=primaryName(s,language.code);
  const value=!name?`<span class="muted">${english?'Name unavailable':'Name nicht verfügbar'}</span>`:language.code==='en'?englishNames(s):nameMarkup(s,language.code);
  return `<div><dt>${esc(languageLabel(language.code,english?'en':'de'))}</dt><dd>${value}</dd></div>`;
 }).join('');
 return `<dl class="lookup-name-list">${rows}</dl>`;
}
function card(s){return `<article class="card"><h2><span class="card-language-label">${esc(languageLabel('de',english?'en':'de'))}</span>${nameMarkup(s,'de')}</h2>${lookupNameList(s)}${germanNames(s)}<p><span class="code">${esc(s.codes[0])}</span><a href="https://ebird.org/species/${s.id}" target="_blank" rel="noopener">eBird ↗<span class="sr">: ${esc(s.de)}</span></a></p>${lookupPhotos?photoMarkup(s):''}<div class="tags">${esc(s.group)} · ${levels[s.level-1]}</div><details><summary>Status & Varianten</summary><p>${s.status.map(v=>esc(t(v))).join(' · ')}</p><p>${[...s.aliases.de.filter(name=>!(s.germanNames||[]).some(n=>n.name===name)),...otherEnglishNames(s)].length?`<span data-name-content>${esc([...s.aliases.de.filter(name=>!(s.germanNames||[]).some(n=>n.name===name)),...otherEnglishNames(s)].join(' · '))}</span>`:t('Keine weiteren Namensvarianten hinterlegt.')}</p>${s.codes.length>1?`<p>Weitere offizielle Quick Codes: ${s.codes.slice(1).map(esc).join(', ')}</p>`:''}${s.codeSource==='banding_code'?'<p>Codequelle: Banding-Code-Spalte der offiziellen eBird-Tabelle; kein separater common-name Quick Code eingetragen.</p>':'<p>Codequelle: com_quick_codes der offiziellen eBird-Tabelle.</p>'}${s.note?`<p>${esc(t(s.note))}</p>`:''}</details></article>`}
function rememberLookup() {
  if ($('#search')) ui.lookup.scroll = window.scrollY;
  saveUI();
}
function focusHeading(selector='main h1') {queueFocus($(selector));}
// Use the same explicit clear control on search and answer inputs in every browser.
function clearableField(markup,value='') {
  return `<span class="clearable-field">${markup}<button type="button" class="input-clear" aria-label="${english?'Clear input':'Eingabe löschen'}"${value?'':' hidden'}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></span>`;
}
function updateClearButtons(){
  document.querySelectorAll('.clearable-field').forEach(field=>{
    const input=field.querySelector('input');
    field.querySelector('.input-clear').hidden=!input.value||input.disabled||input.readOnly;
  });
}
document.addEventListener('input',event=>{
  if(event.target.matches('.clearable-field input'))updateClearButtons();
});
document.addEventListener('click',event=>{
  const button=event.target.closest('.input-clear');if(!button)return;
  const input=button.closest('.clearable-field').querySelector('input');
  if(input.disabled||input.readOnly)return;
  input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));
  input.focus({preventScroll:true});
  if(input.id==='answer'){studyFocusPinned=true;ensureStudyFocusVisible();}
});
function lookup() {
  app=activateView(main,'nachschlagen');
  const state=ui.lookup;
  app.innerHTML=`<h1 class="sr">Arten nachschlagen</h1><div class="lookup-tools"><label class="search-label" for="search">Art suchen</label>${clearableField(`<input type="search" id="search" class="search" aria-controls="results" placeholder="${english?'German, English, Dutch, scientific name or code':'Deutsch, Englisch, Niederländisch, wissenschaftlich oder Code'}" autocomplete="off" value="${esc(state.query)}">`,state.query)}<div class="lookup-options"><details id="lookup-filter-options"><summary><span>${english?'Filters':'Filter'}</span><span id="filter-count"></span></summary><div class="lookup-filters"><div class="field"><label for="group">Artengruppe</label><select id="group">${opt('','Alle Artengruppen')+groups().map(g=>opt(g,g,g===state.group)).join('')}</select></div></div>${regionControls(state,true)}</details><label class="photo-option"><input type="checkbox" id="lookup-photos" ${lookupPhotos?'checked':''}>Artenbilder</label></div><div id="active-filters" class="active-filters" aria-label="Aktive Filter"></div></div><div id="results-meta" class="meta"></div><div id="results" class="grid"></div><button class="back-top quiet" id="back-top" hidden>↑ Zur Suche</button>`;
  const update=()=>{
    Object.assign(state,{query:$('#search').value,group:$('#group').value,region:$('#local-region-field').hidden?$('#region').value:$('#local-region').value,regionMode:$('#region-mode').value});
    updateRegionStatus(state,true);
    const result=birds.filter(s=>(!state.group||s.group===state.group)&&regionAllows(regionalData,state.region,state.regionMode,s.id)&&matches(s,state.query));
    $('#results-meta').innerHTML=`<span>${result.length} von ${birds.length} Arten</span><span class="lookup-sort">Nach deutschem Namen sortiert</span><button class="quiet" id="clear-lookup"${state.group||state.region||state.query?'':' hidden'}>Alles zurücksetzen</button>`;
    $('#active-filters').innerHTML=(state.group?`<button class="filter-chip" data-clear="group">${esc(state.group)} <span aria-hidden="true">×</span><span class="sr">: Filter entfernen</span></button>`:'')+(state.region?`<button class="filter-chip" data-clear="region">${esc(regionalData?.regions.find(r=>r.code===state.region)?.[english?'nameEn':'nameDe']||state.region)} · ${english?(state.regionMode==='all'?'All records':'Last 30 days'):(state.regionMode==='all'?'Alle Nachweise':'Letzte 30 Tage')} <span aria-hidden="true">×</span><span class="sr">: Filter entfernen</span></button>`:'');
    const lookupFixes=[['group',state.group,english?'Remove species group':'Artengruppe entfernen'],['region',state.region,english?'Remove regional filter':'Regionsfilter entfernen']].filter(([key,active])=>active&&birds.some(s=>(key==='group'||!state.group||s.group===state.group)&&(key==='region'||regionAllows(regionalData,state.region,state.regionMode,s.id))&&matches(s,state.query)));
    $('#results').innerHTML=result.length?result.map(card).join(''):`<div class="panel empty-state"><h2>Keine passende Art</h2><p>${state.group||state.region?'Aktive Filter schränken die Suche ein. Entferne einen Filter oder setze die Suche zurück.':'Versuche einen kürzeren Namen oder einen anderen Code.'}</p><div class="toolbar">${lookupFixes.map(([key,,label])=>`<button type="button" data-clear="${key}">${esc(label)}</button>`).join('')}<button id="empty-reset">Suche und Filter zurücksetzen</button></div></div>`;
    const clearRegion=()=>{$('#region-country').value='';$('#region').innerHTML=regionOptions('','');$('#region').disabled=true;configureLocalRegions('');};
    const clear=()=>{state.scroll=0;$('#search').value='';$('#group').value='';clearRegion();$('#region-mode').value='all';update();$('#search').focus();};
    $('#clear-lookup')?.addEventListener('click',clear);$('#empty-reset')?.addEventListener('click',clear);
    document.querySelectorAll('[data-clear]').forEach(b=>b.onclick=()=>{if(b.dataset.clear==='region')clearRegion();else $('#'+b.dataset.clear).value='';state.scroll=0;update();($('#lookup-filter-options').open?$('#'+(b.dataset.clear==='region'?'region-country':b.dataset.clear)):$('#lookup-filter-options > summary')).focus();});
    updateClearButtons();
    $('#filter-count').textContent=[state.group,state.region].filter(Boolean).length?' · '+[state.group,state.region].filter(Boolean).length:'';
    announce(english?`${result.length} of ${birds.length} species match your search and filters.`:`${result.length} von ${birds.length} Arten passen zu Suche und Filtern.`);
    saveUI();
  };
  $('#lookup-filter-options').open=!!state.filtersOpen;
  $('#lookup-filter-options').ontoggle=()=>{state.filtersOpen=$('#lookup-filter-options').open;saveUI();};
  ['search','group','local-region','region-mode'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',()=>{state.scroll=0;update();}));
  $('#region-country').onchange=e=>{const country=e.target.value;$('#region').innerHTML=regionOptions(country,country);$('#region').disabled=!country;$('#region-label').textContent=country==='GB'?(english?'Constituent country':'Landesteil'):'Region';configureLocalRegions(country);state.scroll=0;update();};
  $('#region').onchange=e=>{configureLocalRegions(e.target.value);state.scroll=0;update();};
  $('#lookup-photos').onchange=e=>{lookupPhotos=e.target.checked;state.photos=lookupPhotos;update();};
  $('#back-top').onclick=()=>{window.scrollTo(0,0);$('#search').focus({preventScroll:true});};
  update();requestAnimationFrame(()=>window.scrollTo(0,state.scroll||0));
}
function languageOptions(selected){return NAME_LANGUAGES.map(l=>`<option value="${l.code}"${selected===l.code?' selected':''}${availableNameLanguages.includes(l.code)?'':' disabled'}>${esc(languageLabel(l.code,english?'en':'de'))}${availableNameLanguages.includes(l.code)?'':english?' (unavailable)':' (nicht verfügbar)'}</option>`).join('');}
function nameLanguageControls(cfg){return `<fieldset class="name-language-settings"><legend>${english?'Question and answer names':'Namen für Frage und Antwort'}</legend><div class="settings"><div class="field"><label for="source-language">${english?'Question':'Frage'}</label><select id="source-language" aria-describedby="name-language-status">${languageOptions(cfg.sourceLanguage)}</select></div><div class="field" id="answer-language-field"><label for="answer-language">${english?'Answer':'Antwort'}</label><select id="answer-language" aria-describedby="name-language-status">${languageOptions(cfg.nameLanguage)}</select></div></div><button type="button" id="swap-name-languages" class="quiet">${english?'⇄ Swap names':'⇄ Namen tauschen'}</button><p id="name-language-status" role="status"></p></fieldset>`;}
function regionOptions(country,selected){
 const available=regionalData?.regions.filter(r=>r.code===country||r.parentCode===country)||[];
 if(!country)return opt('',english?'Choose a country first':'Zuerst ein Land wählen',true);
 const missing=selected&&!available.some(r=>r.code===selected)?opt(selected,english?'Saved region (data unavailable)':'Gespeicherte Region (Daten nicht verfügbar)',true):'';
 return missing+available.map(r=>opt(r.code,(!r.parentCode?(english?'Whole '+(r.code==='GB'?'UK':r.nameEn):r.nameDe+' – gesamt'):(english?r.nameEn:r.nameDe)),r.code===selected)).join('');
}
function localRegionOptions(parent,selected){
 const children=regionChildren(regionalData,parent);
 const missing=selected!==parent&&!children.some(r=>r.code===selected)?opt(selected,english?'Saved local region (unavailable)':'Gespeicherte lokale Region (nicht verfügbar)',true):'';
 const name=regionalData?.regions.find(r=>r.code===parent)?.[english?'nameEn':'nameDe']||parent;
 return opt(parent,english?'All of '+name:name+' – gesamt',selected===parent)+missing+children.map(r=>opt(r.code,english?r.nameEn:r.nameDe,r.code===selected)).join('');
}
function configureLocalRegions(parent,selected=parent){
 const visible=parent.includes('-')&&(regionChildren(regionalData,parent).length>0||selected!==parent);
 $('#local-region-field').hidden=!visible;$('#local-region').disabled=!visible;
 $('#local-region').innerHTML=localRegionOptions(parent,selected);
}
function regionControls(cfg,forLookup=false){
 const country=cfg.region.split('-')[0],parent=topRegion(cfg.region);const countries=regionalData?.countries||[];
 const missing=country&&!countries.some(c=>c.code===country)?opt(country,english?'Saved country (unavailable)':'Gespeichertes Land (nicht verfügbar)',true):'';
 const hasLocal=parent.includes('-')&&(regionChildren(regionalData,parent).length>0||cfg.region!==parent);
 return `<fieldset class="region-settings"><legend>${forLookup?(english?'Filter by region':'Nach Region filtern'):(english?'Where would you like to study?':'Wo möchtest du lernen?')}</legend><div class="settings"><div class="field"><label for="region-country">${english?'Country':'Land'}</label><select id="region-country">${opt('',forLookup?(english?'All regions':'Alle Regionen'):(english?'No regional filter':'Kein Regionsfilter'),!country)}${missing}${countries.map(c=>opt(c.code,english?c.nameEn:c.nameDe,c.code===country)).join('')}</select></div><div class="field" id="parent-region-field"><label id="region-label" for="region">${country==='GB'?(english?'Constituent country':'Landesteil'):'Region'}</label><select id="region"${country?'':' disabled'}>${regionOptions(country,parent)}</select></div><div class="field" id="local-region-field"${hasLocal?'':' hidden'}><label for="local-region">${english?'Local region':'Lokale Region'}</label><select id="local-region"${hasLocal?'':' disabled'}>${localRegionOptions(parent,cfg.region)}</select></div><div class="field" id="region-mode-field"${forLookup?'':' hidden'}><label for="region-mode">${english?'Species records':'Artennachweise'}</label><select id="region-mode">${forLookup?'':opt('seasonal',english?'Seasonal frequency groups':'Saisonale Häufigkeitsstufen',cfg.regionMode==='seasonal')}${opt('recent',english?'Last 30 days':'Letzte 30 Tage',cfg.regionMode==='recent')}${opt('all',english?'All records':'Alle Nachweise',cfg.regionMode==='all')}</select></div></div><p id="region-status" role="status"></p>${forLookup?`<p class="muted">${english?'Shows species with eBird records in the selected area and period. All records may include historical rarities; records do not guarantee sightings.':'Zeigt Arten mit eBird-Nachweisen im gewählten Gebiet und Zeitraum. Alle Nachweise können historische Seltenheiten enthalten; Nachweise sind keine Sichtungsgarantie.'}</p>`:''}<details class="region-notes"><summary>${english?'About the species list':'Hinweise zur Artenliste'}</summary><p id="region-data-details" class="muted"></p><p class="muted">${english?'Regional lists filter the existing 313 species. Recent reports are not a frequency ranking or a promise of sightings. All-time lists can include historical rarities.':'Regionale Listen filtern die vorhandenen 313 Arten. Aktuelle Meldungen sind keine Häufigkeitsrangliste oder Sichtungsgarantie. Gesamtlisten können historische Seltenheiten enthalten.'}</p></details></fieldset>`;
}
function updateRegionStatus(cfg,forLookup=false){
 const el=$('#region-status');const list=regionalSelection(regionalData,cfg.region,cfg.regionMode==='seasonal'?'all':cfg.regionMode);
 $('#region-mode').disabled=!cfg.region;
 $('#parent-region-field').hidden=!cfg.region;$('#region-mode-field').hidden=!cfg.region||!forLookup;
 $('#region-data-details').textContent='';
 if(!cfg.region){setTextIfChanged(el,forLookup?(regionalData?(english?'All species are searchable. Choose a country and region to filter by eBird records.':'Alle Arten sind durchsuchbar. Wähle Land und Region, um nach eBird-Nachweisen zu filtern.'):(english?'Regional lists could not be loaded. You can still search all species.':'Regionale Listen konnten nicht geladen werden. Du kannst weiterhin alle Arten durchsuchen.')):regionalData?(english?'Choose a country and then a region to limit your quiz.':'Wähle ein Land und danach eine Region, um dein Quiz einzugrenzen.'):(english?'Regional lists could not be loaded. You can still study without a region.':'Regionale Listen konnten nicht geladen werden. Ohne Regionsfilter kannst du weiterhin lernen.'));return;}
 if(!list){setTextIfChanged(el,english?'This regional list is unavailable. Choose another list or region, or remove the regional filter.':'Diese regionale Liste ist nicht verfügbar. Wähle eine andere Liste oder Region oder entferne den Regionsfilter.');return;}
 const date=new Date(list.updatedAt).toLocaleDateString(english?'en-GB':'de-DE');
 const fullDate=new Date(list.updatedAt).toLocaleString(english?'en-GB':'de-DE');
 $('#region-data-details').textContent=english?`${list.ids.length} species available in our learning data · Updated: ${fullDate}. eBird reports ${list.reportedTaxa} taxa in this list; additional taxa are outside this app’s learning data.`:`${list.ids.length} Arten in unserem Lernbestand verfügbar · Datenstand: ${fullDate}. eBird meldet ${list.reportedTaxa} Taxa in dieser Liste; weitere Taxa sind nicht Teil unseres Lernbestands.`;
 let message=forLookup?(english?`${list.ids.length} species in the regional list · Updated: ${date}`:`${list.ids.length} Arten in der Regionsliste · Stand: ${date}`):(english?`${list.ids.length} study species · Updated: ${date}`:`${list.ids.length} Lernarten · Stand: ${date}`);
 if(regionalDataStale(list))message+=' '+(english?'Warning: this snapshot is more than three days old; the last successful list is being used.':'Achtung: Dieser Datenstand ist älter als drei Tage; verwendet wird die letzte erfolgreiche Liste.');
 setTextIfChanged(el,message);
}
function regionalFrequencyControls(){
 return `<fieldset id="frequency-options" hidden><legend>${english?'Combine frequency groups':'Häufigkeitsstufen kombinieren'}</legend><div class="frequency-options-grid">${FREQUENCY_GROUPS.map(g=>`<div class="frequency-option"><label class="check-row"><input type="checkbox" name="frequency-groups" value="${g}" aria-describedby="frequency-help-${g}"><span>${frequencyLabel(g,english)}</span><strong id="frequency-count-${g}"></strong></label><p class="form-note" id="frequency-help-${g}">${({frequent:english?'At least 10% of lists.':'Mindestens 10 % der Listen.',medium:english?'1% to less than 10% of lists.':'1 bis unter 10 % der Listen.',rare:english?'Above 0% but less than 1% of lists.':'Über 0 bis unter 1 % der Listen.'})[g]}</p><details class="preview-species"><summary>${english?'Preview':'Vorschau'}<span class="sr">: ${frequencyLabel(g,english)}</span></summary><p id="frequency-species-${g}" tabindex="0" role="region" aria-label="${english?'Matching species':'Passende Arten'}: ${frequencyLabel(g,english)}"></p></details></div>`).join('')}</div><details class="frequency-explanation"><summary>${english?'What do these groups mean?':'Was bedeuten die Stufen?'}</summary><p class="form-note">${english?'Experimental reporting rates on complete eBird checklists in this region and season (2021–2025). They describe reporting frequency, not population size or learning difficulty. Rarely reported species can also be hard to detect; missing or zero reports are not classified as rare. The numbers show species matching your other filters.':'Experimentelle Meldeanteile auf vollständigen eBird-Listen in dieser Region und Jahreszeit (2021–2025). Sie beschreiben Meldehäufigkeit, weder Bestandsgröße noch Lernschwierigkeit. Selten gemeldete Arten können auch schwer beobachtbar sein; fehlende Nachweise oder Nullwerte werden nicht als selten eingestuft. Die Zahlen zeigen passende Arten nach deinen weiteren Filtern.'}</p></details></fieldset>`;
}
function regionalPreviewControls(){
 return `<section id="regional-preview" class="regional-preview" aria-labelledby="regional-preview-title" hidden><h3 id="regional-preview-title">${english?'Compare regional selection':'Regionale Auswahl vergleichen'}</h3><p class="form-note">${english?'Choose one base selection. The seasonal selection offers three combinable frequency groups. Counts include your other species, name-language and progress filters.':'Wähle eine Grundauswahl. In der saisonalen Auswahl kannst du drei Häufigkeitsstufen kombinieren. Die Zahlen berücksichtigen deine übrigen Arten-, Namenssprachen- und Lernstandsfilter.'}</p><table class="filter-preview"><caption class="sr">${english?'Preview and choose regional filters':'Regionale Filter in der Vorschau vergleichen und auswählen'}</caption><thead><tr><th scope="col">${english?'Use selection':'Auswahl verwenden'}</th><th scope="col">${english?'Matching species':'Passende Arten'}</th></tr></thead><tbody>${[['all',english?'All regional records':'Alle regionalen Nachweise'],['seasonal',english?'Seasonal frequency groups':'Saisonale Häufigkeitsstufen'],['recent',english?'Reported in the last 30 days':'In den letzten 30 Tagen gemeldet']].map(([mode,label])=>`<tr id="preview-row-${mode}"><th scope="row"><label class="check-row"><input type="radio" name="regional-mode" value="${mode}" aria-describedby="preview-help-${mode}"><span>${label}${mode==='seasonal'?` <span class="experimental-badge">${english?'Experimental':'Experimentell'}</span>`:''}</span></label><p id="preview-help-${mode}" class="form-note"></p><details class="preview-species"><summary>${english?'Preview selected species':'Ausgewählte Arten ansehen'}</summary><p id="preview-species-${mode}" tabindex="0" role="region" aria-label="${english?'Matching species':'Passende Arten'}"></p></details></th><td id="preview-count-${mode}"></td></tr>${mode==='seasonal'?`<tr id="frequency-row" class="selected" hidden><td colspan="2">${regionalFrequencyControls()}</td></tr>`:''}`).join('')}</tbody></table><p id="preview-help-current" class="form-note"></p><p id="regional-preview-result" role="status" class="preview-result"></p></section>`;
}
function hybridSummary(h){
 if(h.seasonalReady)return (english?'Seasonal frequency groups (experimental): ':'Saisonale Häufigkeitsstufen (experimentell): ')+seasonLabel(h.season,english)+(h.selectedGroups? ' · '+(h.selectedGroups.length?h.selectedGroups.map(g=>frequencyLabel(g,english)).join(' + '):(english?'No frequency group selected':'Keine Häufigkeitsstufe gewählt')):'')+(english?' · historical data 2021–2025':' · historische Daten 2021–2025');
 if(h.seasonalRequested)return english?'Regional list · no sufficiently supported seasonal data':'Regionale Artenliste · keine ausreichend belegten Saisondaten';
 return english?'Regional list without seasonal restriction':'Regionale Artenliste ohne saisonale Eingrenzung';
}
function updateHybridStatus(cfg,h){
 $('#hybrid-settings').hidden=!cfg.region;$('#package-settings').hidden=!!cfg.region;$('#regional-package-help').hidden=!cfg.region;
 $('#region-status').hidden=!!cfg.region&&cfg.regionMode==='seasonal';
 if(!cfg.region)return;
 let message=hybridSummary(h);
 if(h.seasonalReady)message+=english?` · ${h.sample} lists; ${h.years} years with at least 100 lists each.`:` · ${h.sample} Listen; ${h.years} Jahre mit jeweils mindestens 100 Listen.`;
 message+=' '+(h.currentFresh?(english?`${h.additions.length} current ${h.additions.length===1?'addition':'additions'} before other filters. Updated: ${new Date(h.currentUpdatedAt).toLocaleString('en-GB')}.`:`${h.additions.length} ${h.additions.length===1?'aktuelle Ergänzung':'aktuelle Ergänzungen'} vor weiteren Filtern. Datenstand: ${new Date(h.currentUpdatedAt).toLocaleString('de-DE')}.`):(english?'Current reports unavailable or snapshot more than three days old; no current additions.':'Aktuelle Meldungen nicht verfügbar oder Datenstand älter als drei Tage; keine aktuellen Ergänzungen.'));
 setTextIfChanged($('#hybrid-status'),message);
 $('#hybrid-current-details').hidden=!h.additions.length;
 $('#hybrid-current-list').innerHTML=h.additions.map(r=>`<li>${nameMarkup(birds.find(s=>s.id===r.id),english?'en':'de')} · ${english?'reported':'gemeldet'} ${esc(r.observedOn)} · ${english?'valid until (exclusive)':'gültig bis (ausschließlich)'} ${esc(r.expiresOn)} (UTC)</li>`).join('');
}
function regionalQuestionNote(x,id){
 const h=x.regionalContext;if(!h)return '';
 const extra=h.additions.find(r=>r.id===id);
 return `<p class="regional-question-note"${extra?' role="note"':''}>${extra?`<strong>${english?'Current addition when the round started':'Aktuelle Ergänzung beim Start der Runde'}</strong> · ${english?'reported':'gemeldet'} ${esc(extra.observedOn)} · ${english?'valid until (exclusive)':'gültig bis (ausschließlich)'} ${esc(extra.expiresOn)} (UTC)`:esc(hybridSummary(h))}</p>`;
}

function lessonRegionLabel(x){const r=regionalData?.regions.find(r=>r.code===x.regionCode||r.nameDe===x.regionLabel||r.nameEn===x.regionLabel);return r?(english?r.nameEn:r.nameDe):x.regionLabel||'';}
function canResumeLesson(x){return !!x&&x.queue.slice(x.index).every(i=>{const s=birds.find(b=>b.id===i.id);return s&&hasLanguagePair(s,x.sourceLanguage,i.t);});}
function learn(preset) {
  app=activateView(main,'lernen');
  if (preset) {
    if(session)session.paused=true;
    ui.learn={...ui.learn,scope:preset.scope||'all',levels:preset.levels||[1,2,3],groups:groups(),ids:preset.ids||[],target:preset.target||'mixed'};
    saveUI();save();
  }
  if(session&&!session.paused){renderQuestion();return;}
  studyMode(false);
  const cfg=ui.learn;
  app.innerHTML=`<h1>Lerneinheit</h1>${storageNotice()}${session?`<section class="panel resume-panel" aria-labelledby="resume-title"><h2 id="resume-title">Pausierte Einheit</h2><p class="muted">${esc(languageLabel(session.sourceLanguage,english?'en':'de'))} → ${esc(session.queue.every(i=>i.t==='code')?'Quick Find Codes':languageLabel(session.nameLanguage,english?'en':'de'))}${lessonRegionLabel(session)?' · '+esc(lessonRegionLabel(session)):''}</p>${pendingLessons.length?`<p class="notice">${english?'Another earlier paused session is preserved and will be available after finishing this one.':'Eine weitere frühere Einheit ist gesichert und wird nach dem Abschließen dieser Einheit verfügbar.'}</p>`:''}<p>${lessonProgressMarkup(session)}</p><div class="toolbar"><button id="resume" class="primary" ${canResumeLesson(session)?'':'disabled'}>Einheit fortsetzen →</button><button id="finish-paused">Einheit abschließen</button></div>${!canResumeLesson(session)?`<p class="notice">${english?'Required name data is unavailable. The paused session is preserved; please reload before resuming.':'Benötigte Namensdaten sind nicht verfügbar. Die pausierte Einheit bleibt erhalten; bitte vor dem Fortsetzen erneut laden.'}</p>`:''}${progressHelp()}<p id="start-lesson-hint" class="muted">Deine bisherigen Antworten sind gespeichert. Schließe diese Einheit ab, bevor du eine neue beginnst.</p></section>`:''}${session?`<details class="new-session-options"><summary>${english?'Prepare a new session':'Neue Einheit vorbereiten'}</summary>`:''}<form id="setup" class="panel"><section class="setup-start" aria-label="${english?'Start session':'Einheit starten'}"><section class="learning-selection" aria-label="${english?'Choose region and species':'Region und Arten auswählen'}">${regionControls(cfg)}<h2>${english?'Which species would you like to practise?':'Welche Arten möchtest du üben?'}</h2>${regionalPreviewControls()}<div id="package-settings">${speciesPackageControls(birds,cfg.levels,english)}</div><p id="regional-package-help" class="form-note" hidden>${english?'With a region selected, the regional selection replaces the global species packages.':'Mit gewählter Region ersetzt die regionale Auswahl die globalen Artenpakete.'}</p><section id="hybrid-settings" aria-label="${english?'Regional learning selection':'Regionale Lernauswahl'}"><details><summary>${english?'Data sources and validity':'Datengrundlage und Gültigkeit'}</summary><p class="form-note" id="hybrid-help">${english?'Automatically adds species recently reported as notable by eBird, even outside the selected frequency groups. These are reports, not evidence of increased frequency. Valid for at most 14 days after observation; updates checked daily. Other species-group and progress filters still apply.':'Ergänzt automatisch von eBird als bemerkenswert gemeldete Arten, auch außerhalb der gewählten Häufigkeitsstufen. Das sind Nachweise, kein Beleg für erhöhte Häufigkeit. Höchstens 14 Tage ab Beobachtung gültig; Aktualisierung wird täglich geprüft. Artengruppen und Lernstand filtern weiterhin.'}</p><p id="hybrid-status" role="status"></p><details id="hybrid-current-details"><summary>${english?'Current additions and validity':'Aktuelle Ergänzungen und Gültigkeit'}</summary><ul id="hybrid-current-list"></ul></details><p class="form-note">${english?'Experimental seasonal selection: one-off eBird exports for all 16 German states and Garmisch-Partenkirchen, 2021–2025. Frequency groups: at least 10%, 1% to less than 10%, and above 0% but less than 1% of complete checklists. Frequent and medium are selected by default. The Saarland samples are insufficient in all seasons; Garmisch-Partenkirchen supports spring and summer. Elsewhere, or with insufficient data, the regional list is used and labelled in the preview.':'Experimentelle saisonale Auswahl: einmalige eBird-Exporte für alle 16 Bundesländer und Garmisch-Partenkirchen, 2021–2025. Häufigkeitsstufen: ab 10 %, 1 bis unter 10 % und über 0 bis unter 1 % der vollständigen Listen. Standardmäßig sind häufig und mittel ausgewählt. Im Saarland reichen die Stichproben in keiner Saison aus; Garmisch-Partenkirchen ist im Frühjahr und Sommer belegt. Andernorts oder bei zu wenig Daten gilt die regionale Artenliste, in der Vorschau benannt.'} <a href="seasonal-data.html" target="_blank" rel="noopener">${english?'Sources, method and terms':'Quellen, Methode und Nutzungsbedingungen'}</a></p></details></section></section><details id="lesson-options"><summary>${english?'Further filters':'Weitere Eingrenzungen'} <span id="extra-filter-summary" class="muted"></span></summary><div class="settings"><div class="field"><label for="scope">Nach Lernstand filtern</label><p class="form-note" id="scope-help">${english?'Due means the scheduled review time has arrived. Not yet mastered also includes learning targets you have not started.':'Fällig heißt: Der geplante Wiederholungszeitpunkt ist erreicht. Noch nicht beherrscht umfasst auch unbegonnene Lernziele.'}</p><select id="scope" aria-describedby="scope-help">${opt('all','Alle Arten',cfg.scope==='all')+opt('unmastered','Noch nicht beherrscht',cfg.scope==='unmastered')+opt('due','Nur fällige Wiederholungen',cfg.scope==='due')+opt('wrong','Zuletzt falsch beantwortet',cfg.scope==='wrong')}</select></div></div><details id="group-selection"><summary>Artengruppen <span id="group-summary"></span></summary><div class="group-picker"><label for="group-search">Gruppen suchen</label>${clearableField(`<input type="search" id="group-search" aria-controls="group-list" placeholder="Zum Beispiel Enten oder Spechte">`)}<div class="toolbar"><button type="button" id="all-groups">Alle Gruppen</button><button type="button" id="no-groups">Auswahl löschen</button></div><div id="selected-groups" class="active-filters"></div><fieldset><legend>Eine oder mehrere Gruppen</legend><div class="group-list" id="group-list">${groups().map(g=>`<label class="check-row" data-group-label="${esc(g)}"><input type="checkbox" name="groups" value="${esc(g)}" ${cfg.groups.includes(g)?'checked':''}>${esc(g)} <span class="muted">(${birds.filter(s=>s.group===g).length})</span></label>`).join('')}</div><p id="group-empty" hidden>Keine passende Gruppe.</p></fieldset></div></details>${cfg.ids.length?`<div class="notice" id="species-selection"><p>${cfg.ids.length} gezielt ${cfg.ids.length===1?'ausgewählte Art':'ausgewählte Arten'} aus der Statistik.</p><button type="button" id="clear-species">Artenauswahl aufheben</button></div>`:''}<label class="photo-option learn-photo-option"><input type="checkbox" id="learn-photos" ${cfg.photos?'checked':''}>Artenbilder nach der Antwort anzeigen</label><p class="form-note">${english?'Answers use the selected name, including documented accepted alternatives. Each name type and codes have separate progress. Errors add extra attempts within this round.':'Antworten werden anhand des gewählten Namens geprüft, einschließlich belegter akzeptierter Varianten. Jede Namensart und Codes haben eigene Lernstände. Fehler führen zu Zusatzversuchen in dieser Runde.'}</p></details><h2 class="round-heading">${english?'Your round':'Deine Runde'}</h2><details id="lesson-basics"><summary>${english?'Change learning target and session':'Lernziel und Ablauf ändern'}</summary><div class="settings primary-target"><div class="field"><label for="target">Lernziel</label><select id="target">${opt(nameTarget,english?'Bird names':'Vogelnamen',cfg.target===nameTarget)+opt('code','Quick Find Codes',cfg.target==='code')+opt('mixed','Namen und Codes, abwechselnd',cfg.target==='mixed')}</select></div></div>${nameLanguageControls(cfg)}<div class="settings primary-settings"><div class="field"><label for="method">Antwortmethode</label><select id="method">${opt('text','Texteingabe',cfg.method==='text')+opt('flash','Karteikarten',cfg.method==='flash')+opt('mc','Multiple Choice',cfg.method==='mc')}</select></div><div class="field"><label for="count">${english?'Round questions':'Rundenfragen'}</label><select id="count">${[10,15,25].map(n=>opt(n,n+' Fragen',cfg.count===String(n))).join('')+opt('all',english?'All':'Alle',cfg.count==='all')}</select></div></div>${progressHelp()}</details><p class="selection-count" id="selection-count" role="status"></p><div id="setup-summary" class="muted"></div><div id="selection-help" class="toolbar" aria-label="${english?'Adjust selection':'Auswahl anpassen'}"></div><div class="actions"><button id="start-lesson" class="primary" type="submit" aria-describedby="selection-count setup-summary"${session?' aria-details="start-lesson-hint"':''}>Lerneinheit starten →</button></div></section></form>${session?'</details>':''}`;
  document.querySelectorAll('[name=frequency-groups]').forEach(input=>input.checked=cfg.frequencyGroups.includes(input.value));
  document.querySelectorAll('[name=regional-mode]').forEach(input=>{input.checked=input.value===cfg.regionMode;input.onchange=()=>{$('#region-mode').value=input.value;};});
  const readSettings=()=>{
    nameTarget=$('#answer-language').value;
    Object.assign(cfg,{nameLanguage:nameTarget,sourceLanguage:$('#source-language').value});
    if(!['mixed','code'].includes($('#target').value))$('#target').options[0].value=nameTarget;
    Object.assign(cfg,{region:$('#local-region-field').hidden?$('#region').value:$('#local-region').value,regionMode:$('#region-mode').value,frequencyGroups:[...document.querySelectorAll('[name=frequency-groups]:checked')].map(x=>x.value),target:$('#target').value,method:$('#method').value,scope:$('#scope').value,count:$('#count').value,levels:[...document.querySelectorAll('[name=levels]:checked')].map(x=>+x.value),groups:[...document.querySelectorAll('[name=groups]:checked')].map(x=>x.value),photos:$('#learn-photos').checked});
    learnPhotos=cfg.photos;saveUI();
  };
  const selection=(settings=cfg,baseOnly=false)=>{
    const ts=settings.target==='mixed'?[settings.nameLanguage,'code']:[settings.target];
    const eligible=(s,t)=>hasLanguagePair(s,settings.sourceLanguage,t)&&(settings.scope==='all'||settings.scope==='unmastered'&&!mastered(progress(s,t))||settings.scope==='due'&&due(progress(s,t))||settings.scope==='wrong'&&progress(s,t)?.lastWrong);
    const hybrid=hybridSelection(regionalData,seasonalData,currentNotable,settings,new Set(birds.map(s=>s.id)),new Date(),!baseOnly);
    const pool=birds.filter(s=>hybrid.ids.includes(s.id)&&(settings.region||settings.levels.includes(s.level))&&settings.groups.includes(s.group)&&(!settings.ids.length||settings.ids.includes(s.id))&&ts.some(t=>eligible(s,t)));
    return {pool:settings.sourceLanguage===settings.nameLanguage&&settings.target!=='code'?[]:pool,eligible,target:settings.target,hybrid};
  };
  const update=()=>{
    readSettings();updateRegionStatus(cfg);const selected=selection(),hybrid=selected.hybrid,n=selected.pool.length;updateHybridStatus(cfg,hybrid);
    $('#regional-preview').hidden=!cfg.region;
    if(cfg.region){
      const previews=Object.fromEntries(['all','seasonal','recent'].map(mode=>[mode,selection({...cfg,regionMode:mode},true)]));
      const withCurrent=selected;
      const extras=withCurrent.pool.filter(s=>withCurrent.hybrid.additions.some(r=>r.id===s.id));
      $('#frequency-options').hidden=cfg.regionMode!=='seasonal'||!hybrid.frequencyGroups;
      $('#frequency-row').hidden=$('#frequency-options').hidden;
      for(const g of FREQUENCY_GROUPS){
        const preview=selection({...cfg,regionMode:'seasonal',frequencyGroups:[g]},true);
        setTextIfChanged($('#frequency-count-'+g),`${preview.pool.length} ${english?'species':preview.pool.length===1?'Art':'Arten'}`);
        setTextIfChanged($('#frequency-species-'+g),preview.pool.length?preview.pool.map(s=>primaryName(s,english?'en':'de')).join(' · '):(english?'No matching species.':'Keine passenden Arten.'));
      }
      const baseCount=n-selected.pool.filter(s=>hybrid.additions.some(r=>r.id===s.id)).length;
      const area=regionalData?.regions.find(r=>r.code===cfg.region)?.[english?'nameEn':'nameDe']||cfg.region;
      setTextIfChanged($('#regional-preview-title'),english?`Your selection for ${area}`:`Deine Auswahl für ${area}`);
      for(const mode of ['all','seasonal','recent']){
        const preview=previews[mode];
        setTextIfChanged($('#preview-count-'+mode),preview.hybrid.available?`${preview.pool.length}`:(english?'Unavailable':'Nicht verfügbar'));
        setTextIfChanged($('#preview-species-'+mode),preview.pool.length?preview.pool.map(s=>primaryName(s,english?'en':'de')).join(' · '):(english?'No matching species.':'Keine passenden Arten.'));
        $('#preview-row-'+mode).classList.toggle('selected',cfg.regionMode===mode);
        document.querySelector(`[name=regional-mode][value="${mode}"]`).checked=cfg.regionMode===mode;
        const help=mode==='all'?(english?'The broadest list, including historical rarities.':'Die breiteste Liste, einschließlich historischer Seltenheiten.'):mode==='recent'?(english?'Species reported here recently; not a frequency ranking.':'Arten mit jüngeren Meldungen aus der Region; keine Häufigkeitsrangliste.'):preview.hybrid.seasonalReady?(english?`${seasonLabel(hybrid.season,true)}: selection based on historical reports from 2021–2025. Provisional selection rules.`:`${seasonLabel(hybrid.season)}: Auswahl anhand historischer Meldungen 2021–2025. Vorläufige Auswahlregeln.`):(english?`Insufficient seasonal data${preview.hybrid.sample?` (${preview.hybrid.sample} lists; ${preview.hybrid.years} years with at least 100 lists)`:''}. Uses all regional records, so this currently adds no seasonal restriction.`:`Keine ausreichenden Saisondaten${preview.hybrid.sample?` (${preview.hybrid.sample} Listen; ${preview.hybrid.years} Jahre mit mindestens 100 Listen)`:''}. Verwendet alle regionalen Nachweise – derzeit also keine saisonale Eingrenzung.`);
        setTextIfChanged($('#preview-help-'+mode),help);
      }
      const examples=extras.slice(0,3).map(s=>primaryName(s,english?'en':'de')).join(', ');
      setTextIfChanged($('#preview-help-current'),!withCurrent.hybrid.currentFresh?(english?'No fresh data available; no species are added.':'Keine frischen Meldungsdaten verfügbar; es werden keine Arten ergänzt.'):extras.length?(english?`${extras.length} current ${extras.length===1?'addition is':'additions are'} automatically included, e.g. ${examples}. Expires at most 14 days after observation; historical frequency groups stay unchanged.`:`${extras.length} ${extras.length===1?'aktuelle Ergänzung wird':'aktuelle Ergänzungen werden'} automatisch einbezogen, z. B. ${examples}. Höchstens 14 Tage ab Beobachtung gültig; die historischen Häufigkeitsstufen bleiben unverändert.`):(english?'No additional matching species right now. The current reports are already in your base selection or excluded by other filters.':'Derzeit keine zusätzlichen passenden Arten. Die aktuellen Meldungen sind bereits in deiner Grundauswahl enthalten oder durch andere Filter ausgeschlossen.'));
      setTextIfChanged($('#regional-preview-result'),english?`${baseCount} base species + ${n-baseCount} current ${n-baseCount===1?'addition':'additions'} = ${n} species to draw your round from.`:`${baseCount} ${baseCount===1?'Art':'Arten'} in der Grundauswahl + ${n-baseCount} ${n-baseCount===1?'aktuelle Ergänzung':'aktuelle Ergänzungen'} = ${n} ${n===1?'Art':'Arten'}, aus denen deine Runde zusammengestellt wird.`);
    }
    const same=cfg.sourceLanguage===cfg.nameLanguage&&cfg.target!=='code';
    const coverage=birds.filter(s=>hasLanguagePair(s,cfg.sourceLanguage,cfg.target==='code'?'code':cfg.nameLanguage)).length;
    const codeOnly=cfg.target==='code';
    $('#answer-language').disabled=codeOnly;$('#answer-language-field').hidden=codeOnly;
    $('#swap-name-languages').disabled=codeOnly;$('#swap-name-languages').hidden=codeOnly;
    setTextIfChanged($('#name-language-status'),same?(english?'Choose different names for the question and answer.':'Wähle unterschiedliche Namen für Frage und Antwort.'):codeOnly?(english?`${coverage} species have a name in the question language and a Quick Find Code. Code progress is saved separately.`:`${coverage} Arten haben einen Namen in der Fragesprache und einen Quick Find Code. Der Code-Lernstand wird getrennt gespeichert.`):(english?`${coverage} of ${birds.length} species have both selected names.`:`${coverage} von ${birds.length} Arten haben beide gewählten Namen.`));
    $('#name-language-status').hidden=!same&&coverage===birds.length;
    $('#source-language').setAttribute('aria-invalid',String(same));$('#answer-language').setAttribute('aria-invalid',String(same));
    setTextIfChanged($('#selection-count'),selectionMessage({same,count:n,unavailable:!!cfg.region&&!hybrid.available,noLevels:!cfg.region&&!cfg.levels.length,noGroups:!cfg.groups.length,scope:cfg.scope},english));
    $('#start-lesson').disabled=!n||!!session;
    const selectedText=id=>$('#'+id).selectedOptions[0]?.textContent||'';
    const region=cfg.region?(regionalData?.regions.find(r=>r.code===cfg.region)?.[english?'nameEn':'nameDe']||cfg.region)+' · '+selectedText('region-mode'):'';
    const levelText=cfg.region?'':cfg.levels.length===3?(english?'All species packages':'Alle Artenpakete'):cfg.levels.length?(english?'Species packages: ':'Artenpakete: ')+cfg.levels.map(n=>t(levels[n-1])).join(', '):(english?'No species package selected':'Kein Artenpaket gewählt');
    const groupText=cfg.groups.length===groups().length?'':cfg.groups.length>0&&cfg.groups.length<=3?cfg.groups.map(g=>t(g)).join(', '):(english?`${cfg.groups.length} species ${cfg.groups.length===1?'group':'groups'}`:`${cfg.groups.length} ${cfg.groups.length===1?'Artengruppe':'Artengruppen'}`);
    const actualCount=Math.min(+cfg.count||n,n);
    const currentCount=selected.pool.filter(s=>hybrid.additions.some(r=>r.id===s.id)).length;
    const questionLabel=english?`${actualCount} round ${actualCount===1?'question':'questions'}`:`${actualCount} ${actualCount===1?'Rundenfrage':'Rundenfragen'}`;
    const lines=[`${languageLabel(cfg.sourceLanguage,english?'en':'de')} → ${codeOnly?'Quick Find Codes':languageLabel(cfg.nameLanguage,english?'en':'de')}${cfg.target==='mixed'?(english?' + codes':' + Codes'):''}`,
      [cfg.count==='all'?questionLabel+(english?' (all matching species)':' (alle passenden Arten)'):questionLabel,t(selectedText('method'))].join(' · '),region,
      [cfg.region?hybridSummary(hybrid):'',cfg.region?(hybrid.currentFresh?(english?`${currentCount} current ${currentCount===1?'addition':'additions'} automatically included`:`${currentCount} ${currentCount===1?'aktuelle Ergänzung':'aktuelle Ergänzungen'} automatisch einbezogen`):(english?'Current additions unavailable':'Aktuelle Ergänzungen derzeit nicht verfügbar')):'',cfg.scope==='all'?'':t(selectedText('scope')),levelText,groupText,cfg.ids.length?(english?`${cfg.ids.length} selected species`:`${cfg.ids.length} gezielt ${cfg.ids.length===1?'ausgewählte Art':'ausgewählte Arten'}`):''].filter(Boolean).join(' · '),
      cfg.photos?'':(english?'Without pictures':'Ohne Bilder'),
      english?'Errors add extra attempts to the round.':'Bei Fehlern kommen Zusatzversuche hinzu.'].filter(Boolean);
    $('#setup-summary').innerHTML=lines.map(line=>`<p>${esc(line)}</p>`).join('');
    const unrestricted={region:'',frequencyGroups:['frequent','medium'],scope:'all',levels:[1,2,3],groups:groups(),ids:[]};
    const restricted=cfg.region||cfg.scope!=='all'||(!cfg.region&&cfg.levels.length!==3)||cfg.groups.length!==groups().length||cfg.ids.length;
    const actions=[];
    if(!n&&!same){
      const fixes=[
        [cfg.regionMode==='seasonal'&&hybrid.frequencyGroups&&!cfg.frequencyGroups.length,{frequencyGroups:['frequent','medium']},english?'Select frequent and medium groups':'Häufig und mittel auswählen'],
        [cfg.region&&cfg.regionMode!=='all',{regionMode:'all'},english?'Use all records':'Alle Nachweise verwenden'],
        [cfg.region,{region:''},english?'Remove regional filter':'Regionsfilter entfernen'],
        [cfg.scope!=='all',{scope:'all'},english?'Include all progress':'Alle Lernstände einbeziehen'],
        [!cfg.region&&cfg.levels.length!==3,{levels:[1,2,3]},english?'Include all species packages':'Alle Artenpakete einbeziehen'],
        [cfg.groups.length!==groups().length,{groups:groups()},english?'Include all species groups':'Alle Artengruppen einbeziehen'],
        [cfg.ids.length,{ids:[]},english?'Remove selected species':'Gezielte Artenauswahl aufheben']
      ];
      for(const [active,patch,label] of fixes){
        if(!active)continue;
        const count=selection({...cfg,...patch}).pool.length;
        if(count)actions.push({patch,label:label+(english?` (${count} species)`:` (${count} Arten)`)});
      }
    }
    if(same)actions.push({basics:true,label:english?'Change name languages':'Namenssprachen ändern'});
    if(restricted)actions.push({patch:unrestricted,label:english?'Reset species filters':'Artenfilter zurücksetzen'});
    $('#selection-help').innerHTML=actions.map((action,i)=>`<button type="button" class="quiet" data-selection-action="${i}">${esc(action.label)}</button>`).join('');
    $('#selection-help').hidden=!actions.length;
    document.querySelectorAll('[data-selection-action]').forEach(button=>button.onclick=()=>{
      const action=actions[+button.dataset.selectionAction];
      if(action.basics){$('#lesson-basics').open=true;$('#source-language').focus();return;}
      const preparationOpen=$('.new-session-options')?.open;Object.assign(cfg,action.patch);saveUI();learn();if(preparationOpen&&$('.new-session-options'))$('.new-session-options').open=true;focusElement($('#start-lesson').disabled?$('#selection-count'):$('#start-lesson'));
    });
    const extraFilters=[cfg.scope!=='all'?t(selectedText('scope')):'',cfg.groups.length!==groups().length?groupText:'',cfg.ids.length?(english?`${cfg.ids.length} selected species`:`${cfg.ids.length} gezielte Arten`):''].filter(Boolean);
    setTextIfChanged($('#extra-filter-summary'),extraFilters.length?'· '+extraFilters.join(' · '):(english?'· none':'· keine'));
    $('#group-summary').textContent=cfg.groups.length===groups().length?'· alle':`· ${cfg.groups.length} ausgewählt`;
    $('#selected-groups').innerHTML=cfg.groups.length===groups().length?'<span class="muted">Alle Gruppen ausgewählt</span>':cfg.groups.length?cfg.groups.map(g=>`<button type="button" class="filter-chip" data-unselect="${esc(g)}">${esc(t(g))} ×<span class="sr">: Gruppe entfernen</span></button>`).join(''):'<span class="muted">Keine Gruppe ausgewählt</span>';
    document.querySelectorAll('[data-unselect]').forEach(b=>b.onclick=()=>{const field=[...document.querySelectorAll('[name=groups]')].find(x=>x.value===b.dataset.unselect);field.checked=false;update();focusElement($('#selected-groups [data-unselect]')||$('#group-selection > summary'));});
  };
  $('#setup').onchange=update;
  $('#swap-name-languages').onclick=()=>{if(cfg.target==='code')return;const source=$('#source-language').value;$('#source-language').value=$('#answer-language').value;$('#answer-language').value=source;update();};
  $('#region-country').onchange=e=>{e.stopPropagation();const country=e.target.value;$('#region').innerHTML=regionOptions(country,country);$('#region').disabled=!country;$('#region-label').textContent=country==='GB'?(english?'Constituent country':'Landesteil'):'Region';configureLocalRegions(country);update();};
  $('#region').onchange=e=>{e.stopPropagation();configureLocalRegions(e.target.value);update();};
  $('#group-search').oninput=()=>{const q=normalize($('#group-search').value);let visible=0;document.querySelectorAll('[data-group-label]').forEach(l=>{l.hidden=!normalize(t(l.dataset.groupLabel)).includes(q);visible+=+!l.hidden;});$('#group-empty').hidden=!!visible;announce(english?`${visible} matching species groups.`:`${visible} passende Artengruppen.`);};
  $('#all-groups').onclick=()=>{document.querySelectorAll('[name=groups]').forEach(x=>x.checked=true);update();};
  $('#no-groups').onclick=()=>{document.querySelectorAll('[name=groups]').forEach(x=>x.checked=false);update();};
  $('#clear-species')?.addEventListener('click',()=>{cfg.ids=[];$('#species-selection').remove();update();focusElement($('#lesson-options > summary'));});
  $('#resume')?.addEventListener('click',()=>{session.paused=false;save();renderQuestion();});
  $('#finish-paused')?.addEventListener('click',endLesson);
  update();
  $('#setup').onsubmit=e=>{
    e.preventDefault();readSettings();if(session)return;
    let {pool,eligible,target,hybrid}=selection();if(!pool.length)return;
    const rank=s=>{const ts=target==='mixed'?[nameTarget,'code']:[target];return Math.min(...ts.filter(t=>eligible(s,t)).map(t=>{const p=progress(s,t);return due(p)?0:!p?1:p.lastWrong?2:3;}));};
    const n=cfg.count==='all'?pool.length:Math.min(+cfg.count,pool.length);
    pool=hybridQueue(pool,n,new Set(hybrid.additions.map(r=>r.id)),rank);
    const queue=pool.slice(0,n).map((s,i)=>{let t=target==='mixed'?(i%2?'code':nameTarget):target;if(!eligible(s,t))t=t===nameTarget?'code':nameTarget;return {id:s.id,t,retry:0};});
    session={version:1,sourceLanguage:cfg.sourceLanguage,nameLanguage:cfg.nameLanguage,regionCode:cfg.region,regionIds:cfg.region?[...hybrid.ids]:null,regionalContext:cfg.region?{season:hybrid.season,seasonalReady:hybrid.seasonalReady,seasonalRequested:hybrid.seasonalRequested,selectedGroups:hybrid.frequencyGroups?hybrid.selectedGroups:null,additions:hybrid.additions}:null,regionLabel:cfg.region?(english?regionalData.regions.find(r=>r.code===cfg.region).nameEn:regionalData.regions.find(r=>r.code===cfg.region).nameDe):'',queue,index:0,correct:0,answered:0,firstAnswered:0,firstCorrect:0,method:cfg.method,photos:cfg.photos,paused:false,done:false,hint:false,result:null,draft:''};
    save();renderQuestion();
  };
}
function lessonProgressMarkup(x){
  const copy=lessonProgressText(lessonProgress(x),english);
  return `${esc(copy.primary)} <span class="repeat-count">${esc(copy.pending)}</span>`;
}
function progressHelp(roundOnly=false){
  return `<details class="progress-help"><summary>${english?'How progress is counted':'So wird dein Fortschritt gezählt'}</summary><dl class="progress-definitions">${progressDefinitions(english).slice(roundOnly?2:0).map(([term,description])=>`<dt>${esc(term)}</dt><dd>${esc(description)}</dd>`).join('')}</dl></details>`;
}
function endLesson() { const ended=session;session=pendingLessons.shift()||null;save();if(ended)showSummary(ended); }
function showSummary(x) {
  app=activateView(main,'lernen');
  studyMode(false);const p=lessonProgress(x),repeats=x.answered-x.firstAnswered;
  app.innerHTML=`<div class="session panel summary"><h1>Einheit abgeschlossen</h1><p class="summary-score">${english?`First attempts: ${x.firstCorrect} of ${x.firstAnswered} correct`:`Erste Versuche: ${x.firstCorrect} von ${x.firstAnswered} richtig`}</p><p>${esc(lessonProgressText(p,english).primary)}</p><p>${english?`Extra attempts after errors: ${repeats} completed · ${x.correct-x.firstCorrect} correct`:`Zusatzversuche nach Fehlern: ${repeats} bearbeitet · ${x.correct-x.firstCorrect} richtig`}</p>${p.completed<p.total||p.repeats?`<p class="muted">${english?'Finished early. '+lessonProgressText(p,true).pending+'. Graded answers remain saved.':'Vorzeitig beendet. '+lessonProgressText(p,false).pending+'. Bewertete Antworten bleiben gespeichert.'}</p>`:''}${progressHelp()}${storageNotice()}<div class="actions"><button id="restart" class="primary">${session?(english?'Continue to saved session':'Zur gespeicherten Einheit'):'Neue Einheit'}</button><a class="button-link" href="#statistik">Fortschritt ansehen</a></div></div>`;
  $('#restart').onclick=()=>{learn();focusHeading();};window.scrollTo(0,0);focusHeading();
}
function renderQuestion() {
  app=activateView(main,'lernen');
  const x=session;if(!x)return learn();if(x.index>=x.queue.length){endLesson();return;}
  if(!canResumeLesson(x)){x.paused=true;save();learn();return;}
  studyMode(true);window.scrollTo(0,0);warmStudyPhotos(x);
  const item=x.queue[x.index],s=birds.find(s=>s.id===item.id),p=lessonProgress(x),target=item.t==='code'?'Quick Find Code':languageLabel(item.t,english?'en':'de');
  app.innerHTML=`<div class="session"><div class="meta"><span id="lesson-progress">${lessonProgressMarkup(x)}</span><div class="lesson-controls"><button id="pause" class="quiet">Pausieren</button><button id="stop" class="quiet">Abschließen</button></div></div><progress value="${p.completed}" max="${p.total}" aria-label="${esc(lessonProgressText(p,english).barLabel)}" aria-valuetext="${esc(lessonProgressText(p,english).primary+'. '+lessonProgressText(p,english).pending)}"></progress><div class="panel question"><div id="question-context" class="eyebrow">${esc(languageLabel(x.sourceLanguage,english?'en':'de'))} → ${esc(target)}</div>${lessonRegionLabel(x)?`<p class="muted">Region: ${esc(lessonRegionLabel(x))}</p>`:''}${regionalQuestionNote(x,s.id)}<p id="question-attempt" class="question-attempt">${esc(attemptText(item.retry,english))}</p><h1 id="question-name" aria-describedby="question-context question-attempt">${nameMarkup(s,x.sourceLanguage)}</h1><div id="answer-area"></div><div id="feedback"></div></div>${storageNotice()}</div>`;
  $('#pause').onclick=()=>{x.paused=true;save();learn();window.scrollTo(0,0);focusHeading();};$('#stop').onclick=endLesson;
  if(x.done){renderFeedback(s,item);return;}
  const area=$('#answer-area');
  if(x.method==='text') {
    area.innerHTML=`<form id="answer-form"><label class="sr" for="answer">${english?'Your answer:':'Deine Antwort:'} ${target}</label>${clearableField(`<input id="answer" placeholder="${item.t==='code'?'Vier Buchstaben':item.t==='sci'?(english?'Enter the scientific name':'Wissenschaftlichen Namen eingeben'):english?'Enter the bird name':'Vogelnamen eingeben'}" value="${esc(x.draft||'')}" ${item.t==='code'?'maxlength="4" autocapitalize="characters"':'maxlength="300" autocapitalize="off"'} autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-describedby="question-context question-name question-attempt hint-text">`,x.draft)}<div class="actions study-actions"><button id="check-answer" type="submit" class="primary"${x.draft?.trim()?'':' disabled'}>Prüfen</button><button type="button" id="hint" class="quiet">Hinweis</button></div><p id="hint-text" class="muted">${x.hint?'Beginnt mit „'+esc(targetName(s,item.t)[0])+'“.':''}</p></form>`;
    $('#answer').oninput=()=>{x.draft=$('#answer').value;$('#check-answer').disabled=!x.draft.trim();save();};
    $('#answer-form').onsubmit=e=>{e.preventDefault();const answer=$('#answer').value.trim();if(answer)finish(accepts(s,item.t,answer),s,item,answer);};
    $('#hint').onclick=()=>{const input=$('#answer'),alreadyFocused=document.activeElement===input;const message=english?'Starts with “'+targetName(s,item.t)[0]+'”.':'Beginnt mit „'+targetName(s,item.t)[0]+'“.';x.hint=true;$('#hint-text').textContent=message;save();input.focus({preventScroll:true});if(alreadyFocused)announce(message);studyFocusPinned=true;ensureStudyFocusVisible();};
    queueFocus($('#answer'));
  }
  if(x.method==='flash') {
    const reveal=()=>{x.revealed=true;save();area.innerHTML=`<div id="revealed-answer" tabindex="-1" role="group" aria-describedby="revealed-answer-content" aria-label="${english?'Revealed answer':'Aufgedeckte Antwort'}"><div id="revealed-answer-content">${nameAnswerMarkup(s,item.t)}</div></div><div class="actions study-actions"><button id="no">Nicht gewusst</button><button id="yes" class="primary">Gewusst</button></div>${item.t!=='code'?`<p class="code">${esc(s.codes[0])}</p>`:''}${germanNames(s)}`;$('#no').onclick=()=>finish(false,s,item,'Nicht gewusst');$('#yes').onclick=()=>finish(true,s,item,'Gewusst');focusElement($('#revealed-answer'),{preventScroll:true});observeStudyActions();};
    if(x.revealed)reveal();else{area.innerHTML='<div class="study-actions"><button id="reveal" class="primary">Antwort aufdecken</button></div>';$('#reveal').onclick=reveal;queueFocus($('#reveal'));}
  }
  if(x.method==='mc') {
    const value=b=>targetName(b,item.t),correct=value(s);
    const pool=birds.filter(b=>(!x.regionIds||x.regionIds.includes(b.id))&&hasLanguagePair(b,x.sourceLanguage,item.t)&&b.id!==s.id&&!accepts(s,item.t,value(b))).map(b=>({b,r:Math.random()})).sort((a,b)=>+(b.b.group===s.group)-+(a.b.group===s.group)||a.r-b.r);
    let answers=[correct];for(const {b}of pool)if(!answers.includes(value(b))&&answers.length<4)answers.push(value(b));
    answers=answers.map(v=>({v,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.v);
    area.innerHTML='<div class="choices" role="group" aria-label="Antwort auswählen" aria-describedby="question-name question-context question-attempt">'+answers.map((v,i)=>`<button data-choice="${i}" data-name-content${item.t==='sci'?' lang="la" class="scientific-name"':` lang="${esc(item.t==='code'?'en':item.t)}"`}>${esc(v)}</button>`).join('')+'</div>';
    document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>finish(accepts(s,item.t,answers[+b.dataset.choice]),s,item,answers[+b.dataset.choice]));
    focusHeading();
  }
  observeStudyActions();
}
async function finish(correct,s,item,answer) {
  const x=session;if(!x||!recordLessonAnswer(x,correct,answer))return;
  const record=review(progress(s,item.t),correct,Date.now(),x.hint);
  record.lessonFirstAttempts=(record.lessonFirstAttempts||0)+ +!item.retry;
  record.lessonFirstCorrect=(record.lessonFirstCorrect||0)+ +(!item.retry&&correct);
  record.lessonRepeatAttempts=(record.lessonRepeatAttempts||0)+ +!!item.retry;
  records[key(s,item.t)]=record;
  document.activeElement?.blur();$('#answer-area').replaceChildren();window.scrollTo(0,0);
  renderFeedback(s,item);await save();if(!storageOK&&!$('#feedback .notice'))$('#feedback').insertAdjacentHTML('beforeend',storageNotice());
}
function renderFeedback(s,item) {
  const x=session,{correct,answer}=x.result,p=lessonProgress(x);
  $('#lesson-progress').innerHTML=lessonProgressMarkup(x);
  const bar=$('progress');bar.value=p.completed;bar.setAttribute('aria-valuetext',lessonProgressText(p,english).primary+'. '+lessonProgressText(p,english).pending);
  $('#feedback').innerHTML=`<div class="feedback"><div class="feedback-result"><h2 class="${correct?'good':'bad'}" tabindex="-1" aria-describedby="${x.method!=='flash'?'feedback-your-answer ':''}feedback-accepted feedback-learning lesson-progress">${correct?'✓ Richtig.':'Noch nicht richtig.'}</h2>${x.method!=='flash'?`<p class="your-answer" id="feedback-your-answer"><span class="muted">Deine Antwort:</span> <span data-name-content lang="${esc(contentLanguage(item.t))}">${esc(answer)}</span></p>`:''}</div><div class="feedback-answer" id="feedback-accepted"><p class="answer-label">${item.t==='code'?'Offizieller Quick Find Code':item.t==='sci'?(english?'Scientific name':'Wissenschaftlicher Name'):'Akzeptierte Namen'}</p> ${nameAnswerMarkup(s,item.t)}</div><div class="study-actions"><button id="next" class="primary">Weiter →</button></div><div class="feedback-details"><div class="answer-reference">${item.t!=='code'?`<p class="code">${esc(s.codes[0])}</p>`:''}${item.t==='sci'?'':`<p class="latin">${esc(s.sci)}</p>`}${s.codes.length>1?`<p class="other-codes">Weitere akzeptierte Codes: ${s.codes.slice(1).map(esc).join(', ')}</p>`:''}</div>${germanNames(s)}<p class="answer-species-link">${ebirdLink(s)}</p></div><div class="learning-feedback" id="feedback-learning"><p>${esc(masteryText(records[key(s,item.t)].streak,english))}</p> <p class="muted review-schedule">${esc(reviewMessage({correct,hint:x.hint,days:records[key(s,item.t)].interval,retry:item.retry}))}</p></div>${x.photos?photoMarkup(s,true):''}</div>`;
  if(x.photos){mountStudyPhoto(s);observeStudyPhotoLayout();}
  $('#next').onclick=()=>{if(!x.done||session!==x)return;x.index++;x.done=false;x.hint=false;x.result=null;x.draft='';x.revealed=false;if(x.index>=x.queue.length)endLesson();else{save();renderQuestion();}};
  observeStudyActions();focusHeading('#feedback h2');
}
function stats() {
  app=activateView(main,'statistik');
  if(session&&!session.paused){session.paused=true;save();}
  const ps=Object.entries(records).filter(([k])=>k.endsWith(':'+nameTarget)||k.endsWith(':code')).map(([,p])=>p),attempts=ps.reduce((a,p)=>a+p.attempts,0),correct=ps.reduce((a,p)=>a+p.correct,0),learned=birds.filter(s=>progress(s,nameTarget)||progress(s,'code')).length,counts=t=>birds.filter(s=>mastered(progress(s,t))).length;
  const dueNames=birds.filter(s=>due(progress(s,nameTarget))).length,dueCodes=birds.filter(s=>due(progress(s,'code'))).length;
  const hard=birds.map(s=>({s,n:[nameTarget,'code'].reduce((n,t)=>n+(progress(s,t)?.lapses||0),0)})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,10);
  const first=ps.reduce((a,p)=>a+(p.lessonFirstAttempts||0),0),firstCorrect=ps.reduce((a,p)=>a+(p.lessonFirstCorrect||0),0),repeats=ps.reduce((a,p)=>a+(p.lessonRepeatAttempts||0),0);
  app.innerHTML=`<h1>Lernstand</h1><div class="field stats-language"><label for="stats-language">${english?'Answer name':'Antwortname'}</label><select id="stats-language">${languageOptions(nameTarget)}</select></div>${storageNotice()}<div class="stats">${[[learned,'Arten begonnen'],[counts(nameTarget),nameTarget==='sci'?(english?'Scientific names mastered':'Wissenschaftliche Namen beherrscht'):languageLabel(nameTarget,english?'en':'de')+(english?' names mastered':' – Namen beherrscht')],[counts('code'),'Codes beherrscht'],[dueNames+dueCodes,english?'Scheduled reviews due':'Geplante Wiederholungen fällig']].map(([n,l])=>`<div class="panel"><div class="number">${n}</div><span class="muted">${l}</span></div>`).join('')}</div><div class="local-storage-note"><p>${!storageOK?(english?'The browser cannot save your progress right now. Download a backup before closing.':'Der Browser kann deinen Lernstand gerade nicht speichern. Lade vor dem Schließen eine Sicherung herunter.'):(english?'Your progress is stored in this browser on this device. There is no automatic sync.':'Dein Lernstand liegt in diesem Browser auf diesem Gerät. Es gibt keine automatische Synchronisierung.')}</p><button type="button" id="open-backup" class="quiet">${english?'Back up or restore progress':'Lernstand sichern oder wiederherstellen'}</button></div><dl class="progress-definitions stats-definitions">${progressDefinitions(english).slice(0,2).map(([term,description])=>`<dt>${esc(term)}</dt><dd>${esc(description)}</dd>`).join('')}</dl><p class="muted">${english?'These figures cover the selected answer language and codes across the whole catalogue; session species filters do not apply here.':'Die Zahlen gelten für die gewählte Antwortsprache und Codes im gesamten Artenbestand; Artenfilter der Lerneinheit gelten hier nicht.'}</p><section class="panel practice-panel"><h2>Jetzt weiterlernen</h2><p>${english?`${dueNames} names and ${dueCodes} codes are due for scheduled review.`:`${dueNames} Namen und ${dueCodes} Codes sind zur geplanten Wiederholung fällig.`}</p><div class="toolbar"><button id="practice-due" class="primary" ${dueNames+dueCodes?'':'disabled'}>Fällige wiederholen</button><button id="practice-new">Noch nicht beherrschte üben</button>${session?`<button id="stats-resume" ${canResumeLesson(session)?'':'disabled'}>Pausierte Einheit fortsetzen</button>`:''}</div>${!dueNames&&!dueCodes?'<p class="muted">Gerade ist keine Wiederholung fällig. Du kannst neue oder noch nicht beherrschte Arten üben.</p>':''}</section><p>${attempts?(english?`${Math.round(correct/attempts*100)}% correct across ${attempts} answers including extra attempts.`:`${Math.round(correct/attempts*100)} % richtig bei ${attempts} Antworten einschließlich Zusatzversuchen.`):'Noch keine Antworten. Starte eine erste Lerneinheit.'}</p>${first?`<p>${english?`${Math.round(firstCorrect/first*100)}% correct on the first attempt in each round (${firstCorrect} of ${first}). Extra attempts after errors: ${repeats}.`:`${Math.round(firstCorrect/first*100)} % beim ersten Versuch je Runde richtig (${firstCorrect} von ${first}). Zusatzversuche nach Fehlern: ${repeats}.`}<br><span class="muted">Getrennte Zählung seit dem 21.10.2026; ältere Antworten sind nur in der Gesamtquote enthalten.</span></p>`:''}${progressHelp(true)}<details class="panel group-details"><summary>Fortschritt nach Artengruppe</summary><p class="muted">Beherrschte Arten / Arten der Gruppe</p><div class="table-scroll"><table><thead><tr><th scope="col">Gruppe</th><th scope="col">Namen</th><th scope="col">Codes</th></tr></thead><tbody>${groups().map(g=>{const a=birds.filter(s=>s.group===g);return `<tr><th scope="row">${esc(g)}</th><td>${a.filter(s=>mastered(progress(s,nameTarget))).length} / ${a.length}</td><td>${a.filter(s=>mastered(progress(s,'code'))).length} / ${a.length}</td></tr>`;}).join('')}</tbody></table></div></details>${hard.length?`<section class="panel practice-panel"><h2>Häufig falsch beantwortet</h2>${hard.map(({s,n})=>`<div class="difficult-species"><span>${nameMarkup(s,'de')} <span class="muted">· ${esc(t(n+' Fehler insgesamt'))}</span></span><button data-practice="${esc(s.id)}">Art üben<span class="sr">: ${nameMarkup(s,'de')}</span></button></div>`).join('')}<button id="practice-hard">Diese ${hard.length} Arten üben</button></section>`:''}${backupPanel(english,storageOK)}`;
  $('#stats-language').onchange=()=>{nameTarget=$('#stats-language').value;ui.learn.nameLanguage=nameTarget;if(!['code','mixed'].includes(ui.learn.target))ui.learn.target=nameTarget;saveUI();stats();focusElement($('#stats-language'));const dueCount=birds.filter(s=>due(progress(s,nameTarget))).length+dueCodes;announce(english?`${counts(nameTarget)} names mastered, ${counts('code')} codes mastered. ${dueCount} scheduled reviews due.`:`${counts(nameTarget)} Namen beherrscht, ${counts('code')} Codes beherrscht. ${dueCount} geplante Wiederholungen fällig.`);};
  const launch=preset=>{learn(preset);if(location.hash!=='#lernen'){skipNextRoute=true;location.hash='lernen';}setActiveNav('lernen');window.scrollTo(0,0);focusHeading();};
  $('#practice-due').onclick=()=>launch({scope:'due'});$('#practice-new').onclick=()=>launch({scope:'unmastered'});
  $('#stats-resume')?.addEventListener('click',()=>{session.paused=false;save();setActiveNav('lernen');skipNextRoute=true;location.hash='lernen';renderQuestion();});
  document.querySelectorAll('[data-practice]').forEach(b=>b.onclick=()=>launch({ids:[b.dataset.practice]}));
  $('#practice-hard')?.addEventListener('click',()=>launch({ids:hard.map(x=>x.s.id)}));
  const openBackup=()=>{const panel=$('#backup-panel');panel.open=true;panel.querySelector('summary').focus({preventScroll:true});panel.scrollIntoView({block:'start'});};
  $('#open-backup').onclick=openBackup;
  const downloadBackup=()=>{
    const stamp=new Date().toISOString();
    const blob=new Blob([JSON.stringify({app:'BirdNames DE',version:1,taxonomy:meta.taxonomy,exported:stamp,records},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=backupFilename(stamp);link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('#export-status').textContent=english?'Download started. Keep the JSON file somewhere you can find it; your browser controls where it is saved.':'Download gestartet. Bewahre die JSON-Datei gut auffindbar auf; den Speicherort bestimmt dein Browser.';
  };
  $('#export').onclick=downloadBackup;
  const input=$('#import');let request=0;
  input.onchange=async()=>{
    const token=++request,file=input.files[0],preview=$('#import-preview'),status=$('#import-status');
    preview.replaceChildren();preview.hidden=true;status.textContent='';if(!file)return;
    try{
      if(file.size>5000000)throw Error('Datei ist zu groß (maximal 5 MB).');
      const value=JSON.parse(await file.text());
      if(token!==request||!input.isConnected)return;
      const candidate=inspectBackup(value,new Set(birds.map(s=>s.id)));
      preview.innerHTML=backupPreview({candidate,current:records,filename:file.name,hasSession:!!session||!!pendingLessons.length,english});preview.hidden=false;
      status.textContent=english?'Backup checked. Your current progress has not been changed.':'Sicherung geprüft. Dein bisheriger Lernstand wurde noch nicht geändert.';
      $('#import-preview-title').focus({preventScroll:true});preview.scrollIntoView({block:'start'});
      $('#export-before-import').onclick=()=>{downloadBackup();status.textContent=english?'Download of your current progress started. The selected backup has not been imported.':'Download deines bisherigen Lernstands gestartet. Die ausgewählte Sicherung wurde noch nicht importiert.';};
      $('#cancel-import').onclick=()=>{request++;input.value='';preview.replaceChildren();preview.hidden=true;status.textContent=english?'Restore cancelled. Your progress is unchanged.':'Wiederherstellen abgebrochen. Dein Lernstand bleibt unverändert.';input.focus();};
      $('#confirm-import').onclick=async()=>{
        input.disabled=true;preview.querySelectorAll('button').forEach(button=>button.disabled=true);
        const ok=await save({records:candidate.records,session:null,pending:[]});
        if(!ok){
          input.disabled=false;preview.querySelectorAll('button').forEach(button=>button.disabled=false);
          const warning=english?'The browser cannot save changes right now. Keep a backup of your current progress.':'Der Browser kann Änderungen gerade nicht speichern. Bewahre eine Sicherung deines bisherigen Lernstands auf.';
          $('.local-storage-note p').textContent=warning;$('#backup-storage-description').textContent=warning;
          status.tabIndex=-1;status.focus();
          status.textContent=english?'Restore failed: the browser could not save the backup. Your previous progress and paused sessions have been kept. Keep the backup and try again.':'Wiederherstellen fehlgeschlagen: Der Browser konnte die Sicherung nicht speichern. Dein bisheriger Lernstand und pausierte Einheiten bleiben erhalten. Behalte die Datei und versuche es erneut.';return;
        }
        records=candidate.records;session=null;pendingLessons=[];stats();openBackup();
        $('#import-status').textContent=english?`Restored: ${backupSummary(records,true)}. Previous progress was replaced and paused sessions were ended.`:`Wiederhergestellt: ${backupSummary(records)}. Der bisherige Lernstand wurde ersetzt und pausierte Einheiten wurden beendet.`;
        $('#import-status').tabIndex=-1;$('#import-status').focus();
      };
    }catch(error){if(token!==request||!input.isConnected)return;status.textContent=importErrorMessage(error)+(english?' Your existing progress is unchanged.':' Dein bisheriger Lernstand bleibt unverändert.');input.value='';}
  };
  $('#reset').onclick=async()=>{if(confirm(t('Alle Lernwerte und die laufende Einheit in diesem Browser löschen?'))){records={};session=null;pendingLessons=[];await save();stats();focusHeading();}};
}
function info(){app=activateView(main,'info');app.innerHTML=renderInformation({english,birds,meta,germanNamesMeta,photos,regions:regionalData});}

function setActiveNav(page){document.querySelectorAll('nav a').forEach(a=>{const active=a.hash==='#'+page;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
function route(){
 if(skipNextRoute){skipNextRoute=false;return;}
 announce.clear();const initial=!hasRouted;hasRouted=true;
 $('#photo-dialog')?.close();rememberLookup();const page=location.hash.slice(1)||'nachschlagen';setActiveNav(page);
 if(page!=='lernen'&&session&&!session.paused){session.paused=true;save();}
 studyMode(false);({nachschlagen:lookup,lernen:learn,statistik:stats,info}[page]||lookup)();
 if(page!=='nachschlagen')window.scrollTo(0,0);
 if(!initial&&(page!=='lernen'||!session||session.paused)){if(page==='nachschlagen')queueFocus($('#search'),{preventScroll:false});else focusHeading();}
}
try{let data=await(await fetch('species.json')).json();birds=data.species.sort((a,b)=>a.de.localeCompare(b.de,'de'));meta=data.meta;
try{const names=await(await fetch('german-names.json')).json();germanNamesMeta=names.meta;for(const s of birds)s.germanNames=names.species[s.id]?.names||[];}catch(err){console.warn('Deutsche Alternativnamen nicht geladen',err)}
availableNameLanguages=await loadNameData(birds);
ui.learn.nameLanguage=isNameLanguage(ui.learn.nameLanguage)?ui.learn.nameLanguage:isNameLanguage(ui.learn.target)?ui.learn.target:defaultNameTarget;
nameTarget=ui.learn.nameLanguage;
ui.learn.sourceLanguage=isNameLanguage(ui.learn.sourceLanguage)?ui.learn.sourceLanguage:english?'en':'de';
if(!['code','mixed'].includes(ui.learn.target))ui.learn.target=nameTarget;
const allGroups=groups(),ids=new Set(birds.map(s=>s.id));
ui.lookup.query=typeof ui.lookup.query==='string'?ui.lookup.query:'';ui.lookup.group=allGroups.includes(ui.lookup.group)?ui.lookup.group:'';delete ui.lookup.level;ui.lookup.region=typeof ui.lookup.region==='string'&&/^[A-Z]{2}(?:-[A-Z0-9]{1,4}){0,2}$/.test(ui.lookup.region)?ui.lookup.region:'';ui.lookup.regionMode=['all','recent'].includes(ui.lookup.regionMode)?ui.lookup.regionMode:'all';ui.lookup.scroll=Number.isFinite(ui.lookup.scroll)?Math.max(0,ui.lookup.scroll):0;
ui.learn.groups=Array.isArray(ui.learn.groups)?ui.learn.groups.filter(g=>allGroups.includes(g)):allGroups;
ui.learn.ids=Array.isArray(ui.learn.ids)?ui.learn.ids.filter(id=>ids.has(id)):[];
ui.learn.region=typeof ui.learn.region==='string'&&/^[A-Z]{2}(?:-[A-Z0-9]{1,4}){0,2}$/.test(ui.learn.region)?ui.learn.region:'';
if(!ui.learn.hybridVersion){ui.learn.regionMode='seasonal';ui.learn.hybridVersion=1;}ui.learn.regionMode=['all','recent','seasonal'].includes(ui.learn.regionMode)?ui.learn.regionMode:'seasonal';ui.learn.frequencyGroups=frequencyGroups(ui.learn.frequencyGroups);delete ui.learn.includeCurrent;
ui.learn.levels=Array.isArray(ui.learn.levels)?ui.learn.levels.filter(n=>[1,2,3].includes(n)):[1];
for(const [field,options]of Object.entries({target:[nameTarget,'code','mixed'],method:['text','flash','mc'],scope:['all','unmastered','due','wrong'],count:['10','15','25','all']}))if(!options.includes(ui.learn[field]))ui.learn[field]=defaults.learn[field];
try{const response=await fetch('regions.json?format=hierarchy',{cache:'no-cache'});if(response.ok)regionalData=validateRegions(await response.json(),ids);}catch{console.warn('Regional lists unavailable');}
try{seasonalData=validateSeasonal(await(await fetch('seasonal-species.json?v=20261102-frequency1')).json(),ids);}catch{console.warn('Seasonal data unavailable');}
try{const data=await(await fetch('current-notable.json',{cache:'no-cache'})).json();if(data?.version===1&&Array.isArray(data.regions))currentNotable=data;}catch{console.warn('Current reports unavailable');}
try{photos=(await(await fetch('photos.json')).json()).photos}catch(err){console.warn('Artenbilder nicht geladen',err)}saveUI();try{await initDB();await save()}catch{storageOK=false}window.addEventListener('hashchange',route);route();}catch(err){app.innerHTML='<h1>Daten konnten nicht geladen werden.</h1><p>Bitte Seite erneut laden.</p>';console.error(err)}
