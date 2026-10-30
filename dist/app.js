import {renderInformation} from './info-page.js?v=20261030-info1';
import {loadSharedUI,restoreLessonState,selectionMessage} from './learning-settings.js?v=20261030-density1';
import {NAME_LANGUAGES,isNameLanguage,languageLabel,primaryName,acceptedNames,loadNameData,hasLanguagePair,targetName} from './name-languages.js';
import {validateRegions,regionalSelection,regionAllows,regionalDataStale,regionChildren,topRegion} from './regions.js?v=20261029-uklocal1';
import {english,localize,t,reviewMessage,importErrorMessage} from './i18n.js?v=20261030-density1';
const defaultNameTarget=english?'de':'en';
let nameTarget=defaultNameTarget,availableNameLanguages=['de','en'];
import {validateLesson,lessonProgress,recordLessonAnswer} from './study-state.js?v=20261029-nl2';
import {createPhotoCache} from './photo-cache.js';
import {normalize,matches,accepts,review,mastered,due,validProgress} from './logic.js?v=20261029-nl2';
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let birds=[],meta={},records={},db,storageOK=true,session=null,pendingLessons=[],theme='system';
// Loaded separately from the taxonomy so media updates cannot overwrite species data.
let photos={};
let germanNamesMeta={};
let regionalData=null;
const defaults={lookup:{query:'',group:'',level:'',photos:false,scroll:0},learn:{target:nameTarget,nameLanguage:nameTarget,sourceLanguage:english?'en':'de',method:'mc',scope:'all',count:'10',levels:[1],groups:null,ids:[],photos:true,region:'',regionMode:'recent'}};
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
  const img=study?`<span class="study-photo-slot" data-photo-index="${index}" role="status" aria-label="Artenbild wird geladen"></span>`:`<img class="species-photo" src="${esc(p.local)}" alt="${esc(s.de)}${p.label?' – '+esc(t(p.label)):''} (${esc(s.sci)})" width="${p.width}" height="${p.height}" loading="${expanded?'eager':'lazy'}" decoding="async">`;
  return `<figure class="bird-photo${p.mediaType==='illustration'?' bird-illustration':''}">${p.mediaType==='illustration'?'<div class="media-badge">Historische Illustration</div>':''}${p.label?`<div class="photo-label">${esc(t(p.label))}</div>`:''}${expanded?`<div class="photo-visual">${img}</div>`:`<button type="button" class="photo-visual photo-zoom" data-photo-species="${esc(s.id)}" aria-label="${esc(s.de)}${p.label?' – '+esc(t(p.label)):''}: Bilder vergrößern">${img}<span class="zoom-hint" aria-hidden="true">⤢ Vergrößern</span></button>`}<div class="photo-error" hidden>${photoFallback(s)}</div><figcaption>${p.comparisonDescription?`<p class="comparison-description">${esc(t(p.comparisonDescription))}</p>`:''}${p.mediaType==='illustration'?'Illustration':'Foto'}: ${esc(p.attribution||p.credit)} · <a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer" title="${esc(p.title)}">Wikimedia Commons ↗</a> · <a href="${esc(p.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.license)}</a><details class="photo-credit"><summary>Bildnachweis</summary><p>${esc(p.title)} · ${esc(t(p.transformation||'für die Anzeige verkleinert, Inhalt unverändert'))}${p.verificationUrl?` · <a href="${esc(p.verificationUrl)}" target="_blank" rel="noopener noreferrer">Originallegende ↗</a>`:''}${p.attribution&&p.attribution!==p.credit?' · Urheber: '+esc(p.credit):''}.</p></details></figcaption></figure>`;
 }).join('')}</div>${photos[s.id].comparisonMissing?`<p class="photo-fallback">Geschlechtervergleich noch unvollständig. <a href="${gallery(s)}" target="_blank" rel="noopener noreferrer">Weitere Fotos auf eBird ↗</a></p>`:''}`;
}
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-photo-species]');if(!button)return;
 const s=birds.find(s=>s.id===button.dataset.photoSpecies);if(!s)return;
 let dialog=$('#photo-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='photo-dialog';dialog.setAttribute('aria-labelledby','photo-dialog-title');document.body.append(dialog);dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
 dialog.innerHTML=`<div class="dialog-header"><h2 id="photo-dialog-title">${esc(s.de)}</h2><button id="close-photo">Schließen ×</button></div>${photoMarkup(s,false,true)}<p class="muted">Fotos und Illustrationen sind nicht maßstabsgetreu. Bei historischen Abbildungen kann die Farbwiedergabe vom heutigen Foto abweichen.</p>`;
 $('#close-photo').onclick=()=>dialog.close();dialog.showModal();
});
document.addEventListener('error',event=>{const img=event.target;if(img instanceof HTMLImageElement&&img.classList.contains('species-photo')){const figure=img.closest('.bird-photo');img.parentElement.hidden=true;figure.querySelector('.photo-error').hidden=false;}},true);
const levels=['Grundwortschatz','Erweitert','Spezialwortschatz'];
function studyMode(active){document.body.classList.toggle('studying',active);updateStudyViewport();}
function updateStudyViewport(){const v=window.visualViewport;const inset=v?Math.max(0,window.innerHeight-v.height-v.offsetTop):0;document.documentElement.style.setProperty('--study-keyboard-inset',inset+'px');}
window.visualViewport?.addEventListener('resize',updateStudyViewport);
window.visualViewport?.addEventListener('scroll',updateStudyViewport);
window.addEventListener('resize',updateStudyViewport);

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
async function save(){if(!db){storageOK=false;return false;}return new Promise(resolve=>{
 const tx=db.transaction('state','readwrite'),store=tx.objectStore('state');store.put(records,'records');store.put({version:1,session,pending:pendingLessons},'lesson-state-v2');
 tx.oncomplete=()=>{storageOK=true;resolve(true);};tx.onerror=tx.onabort=()=>{storageOK=false;resolve(false);};
});}
function storageNotice(){return storageOK?'':'<p class="notice" role="alert">Der Browser kann den Lernstand gerade nicht dauerhaft speichern. Bitte exportiere ihn vor dem Schließen.</p>';}
const opt=(v,l=v,selected=false)=>`<option value="${esc(v)}"${selected?' selected':''}>${esc(l)}</option>`;
const groups=()=>[...new Set(birds.map(s=>s.group))].sort((a,b)=>a.localeCompare(b,'de'));
function nameMarkup(s,code){return `<span data-name-content lang="${esc(code)}">${esc(primaryName(s,code))}</span>`;}
function nameAnswerMarkup(s,target){
 if(target==='code')return `<p class="answer-main code">${esc(s.codes[0])}</p>`;
 const aliases=acceptedNames(s,target).filter(n=>n!==primaryName(s,target));
 return `<p class="answer-main">${nameMarkup(s,target)}</p>${aliases.length?`<p class="answer-aliases"><span class="muted">${english?'Also accepted:':'Ebenfalls akzeptiert:'}</span> <span data-name-content lang="${esc(target)}">${aliases.map(esc).join(' · ')}</span></p>`:''}`;
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
 return `<dl class="lookup-name-list">${rows}<div><dt>${english?'Scientific name':'Wissenschaftlicher Name'}</dt><dd class="latin" data-name-content>${esc(s.sci)}</dd></div></dl>`;
}
function card(s){return `<article class="card"><h2><span class="card-language-label">${esc(languageLabel('de',english?'en':'de'))}</span>${nameMarkup(s,'de')}</h2>${lookupNameList(s)}${germanNames(s)}<p><span class="code">${esc(s.codes[0])}</span><a href="https://ebird.org/species/${s.id}" target="_blank" rel="noopener">eBird ↗<span class="sr">: ${esc(s.de)}</span></a></p>${lookupPhotos?photoMarkup(s):''}<div class="tags">${esc(s.group)} · ${levels[s.level-1]}</div><details><summary>Status & Varianten</summary><p>${s.status.map(v=>esc(t(v))).join(' · ')}</p><p>${[...s.aliases.de.filter(name=>!(s.germanNames||[]).some(n=>n.name===name)),...otherEnglishNames(s)].length?`<span data-name-content>${esc([...s.aliases.de.filter(name=>!(s.germanNames||[]).some(n=>n.name===name)),...otherEnglishNames(s)].join(' · '))}</span>`:t('Keine weiteren Namensvarianten hinterlegt.')}</p>${s.codes.length>1?`<p>Weitere offizielle Quick Codes: ${s.codes.slice(1).map(esc).join(', ')}</p>`:''}${s.codeSource==='banding_code'?'<p>Codequelle: Banding-Code-Spalte der offiziellen eBird-Tabelle; kein separater common-name Quick Code eingetragen.</p>':'<p>Codequelle: com_quick_codes der offiziellen eBird-Tabelle.</p>'}${s.note?`<p>${esc(t(s.note))}</p>`:''}</details></article>`}
function rememberLookup() {
  if ($('#search')) ui.lookup.scroll = window.scrollY;
  saveUI();
}
function focusHeading(selector='main h1') { requestAnimationFrame(()=>{const h=$(selector);if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}); }
function lookup() {
  const state=ui.lookup;
  app.innerHTML=`<h1 class="sr">Arten nachschlagen</h1><div class="lookup-tools"><label class="search-label" for="search">Art suchen</label><input type="search" id="search" class="search" placeholder="${english?'German, English, Dutch, scientific name or code':'Deutsch, Englisch, Niederländisch, wissenschaftlich oder Code'}" autocomplete="off" value="${esc(state.query)}"><div class="lookup-options"><details id="lookup-filter-options"><summary><span>${english?'Filters':'Filter'}</span><span id="filter-count"></span></summary><div class="lookup-filters"><div class="field"><label for="group">Artengruppe</label><select id="group">${opt('','Alle Artengruppen')+groups().map(g=>opt(g,g,g===state.group)).join('')}</select></div><div class="field"><label for="level">Lernstufe</label><select id="level">${opt('','Alle Lernstufen')+levels.map((l,i)=>opt(i+1,l,String(i+1)===state.level)).join('')}</select></div></div></details><label class="photo-option"><input type="checkbox" id="lookup-photos" ${lookupPhotos?'checked':''}>Artenbilder</label></div><div id="active-filters" class="active-filters" aria-label="Aktive Filter"></div></div><div id="results-meta" class="meta" role="status" aria-live="polite"></div><div id="results" class="grid"></div><button class="back-top quiet" id="back-top" hidden>↑ Zur Suche</button>`;
  const update=()=>{
    Object.assign(state,{query:$('#search').value,group:$('#group').value,level:$('#level').value});
    const result=birds.filter(s=>(!state.group||s.group===state.group)&&(!state.level||s.level===+state.level)&&matches(s,state.query));
    $('#results-meta').innerHTML=`<span>${result.length} von ${birds.length} Arten</span><span class="lookup-sort">Nach deutschem Namen sortiert</span><button class="quiet" id="clear-lookup"${state.group||state.level||state.query?'':' hidden'}>Alles zurücksetzen</button>`;
    $('#active-filters').innerHTML=(state.group?`<button class="filter-chip" data-clear="group">${esc(state.group)} <span aria-hidden="true">×</span><span class="sr">: Filter entfernen</span></button>`:'')+(state.level?`<button class="filter-chip" data-clear="level">${levels[+state.level-1]} <span aria-hidden="true">×</span><span class="sr">: Filter entfernen</span></button>`:'');
    $('#results').innerHTML=result.length?result.map(card).join(''):`<div class="panel empty-state"><h2>Keine passende Art</h2><p>${state.group||state.level?'Aktive Filter schränken die Suche ein. Entferne einen Filter oder setze die Suche zurück.':'Versuche einen kürzeren Namen oder einen anderen Code.'}</p><button id="empty-reset">Suche und Filter zurücksetzen</button></div>`;
    const clear=()=>{state.scroll=0;$('#search').value='';$('#group').value='';$('#level').value='';update();$('#search').focus();};
    $('#clear-lookup')?.addEventListener('click',clear);$('#empty-reset')?.addEventListener('click',clear);
    document.querySelectorAll('[data-clear]').forEach(b=>b.onclick=()=>{$('#'+b.dataset.clear).value='';state.scroll=0;update();($('#lookup-filter-options').open?$('#'+b.dataset.clear):$('#lookup-filter-options > summary')).focus();});
    $('#filter-count').textContent=[state.group,state.level].filter(Boolean).length?' · '+[state.group,state.level].filter(Boolean).length:'';
    saveUI();
  };
  $('#lookup-filter-options').open=!!state.filtersOpen;
  $('#lookup-filter-options').ontoggle=()=>{state.filtersOpen=$('#lookup-filter-options').open;saveUI();};
  ['search','group','level'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',()=>{state.scroll=0;update();}));
  $('#lookup-photos').onchange=e=>{lookupPhotos=e.target.checked;state.photos=lookupPhotos;update();};
  $('#back-top').onclick=()=>{window.scrollTo(0,0);$('#search').focus({preventScroll:true});};
  update();requestAnimationFrame(()=>window.scrollTo(0,state.scroll||0));
}
function languageOptions(selected){return NAME_LANGUAGES.map(l=>`<option value="${l.code}"${selected===l.code?' selected':''}${availableNameLanguages.includes(l.code)?'':' disabled'}>${esc(languageLabel(l.code,english?'en':'de'))}${availableNameLanguages.includes(l.code)?'':english?' (unavailable)':' (nicht verfügbar)'}</option>`).join('');}
function nameLanguageControls(cfg){return `<fieldset class="name-language-settings"><legend>${english?'Bird name languages':'Sprachen der Vogelnamen'}</legend><div class="settings"><div class="field"><label for="source-language">${english?'Question':'Frage'}</label><select id="source-language">${languageOptions(cfg.sourceLanguage)}</select></div><div class="field" id="answer-language-field"><label for="answer-language">${english?'Answer':'Antwort'}</label><select id="answer-language">${languageOptions(cfg.nameLanguage)}</select></div></div><button type="button" id="swap-name-languages" class="quiet">${english?'⇄ Swap languages':'⇄ Sprachen tauschen'}</button><p id="name-language-status" role="status"></p></fieldset>`;}
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
function regionControls(cfg){
 const country=cfg.region.split('-')[0],parent=topRegion(cfg.region);const countries=regionalData?.countries||[];
 const missing=country&&!countries.some(c=>c.code===country)?opt(country,english?'Saved country (unavailable)':'Gespeichertes Land (nicht verfügbar)',true):'';
 const hasLocal=parent.includes('-')&&(regionChildren(regionalData,parent).length>0||cfg.region!==parent);
 return `<fieldset class="region-settings"><legend>${english?'Learn for a region':'Für eine Region lernen'}</legend><div class="settings"><div class="field"><label for="region-country">${english?'Country':'Land'}</label><select id="region-country">${opt('',english?'No regional filter':'Kein Regionsfilter',!country)}${missing}${countries.map(c=>opt(c.code,english?c.nameEn:c.nameDe,c.code===country)).join('')}</select></div><div class="field" id="parent-region-field"><label id="region-label" for="region">${country==='GB'?(english?'Constituent country':'Landesteil'):'Region'}</label><select id="region"${country?'':' disabled'}>${regionOptions(country,parent)}</select></div><div class="field" id="local-region-field"${hasLocal?'':' hidden'}><label for="local-region">${english?'Local region':'Lokale Region'}</label><select id="local-region"${hasLocal?'':' disabled'}>${localRegionOptions(parent,cfg.region)}</select></div><div class="field" id="region-mode-field"><label for="region-mode">${english?'Species records':'Artennachweise'}</label><select id="region-mode">${opt('recent',english?'Last 30 days':'Letzte 30 Tage',cfg.regionMode==='recent')}${opt('all',english?'All records':'Alle Nachweise',cfg.regionMode==='all')}</select></div></div><p id="region-status" role="status"></p><details class="region-notes"><summary>${english?'About the species list':'Hinweise zur Artenliste'}</summary><p id="region-data-details" class="muted"></p><p class="muted">${english?'Regional lists filter the existing 313 species. Recent reports are not a frequency ranking or a promise of sightings. All-time lists can include historical rarities.':'Regionale Listen filtern die vorhandenen 313 Arten. Aktuelle Meldungen sind keine Häufigkeitsrangliste oder Sichtungsgarantie. Gesamtlisten können historische Seltenheiten enthalten.'}</p></details></fieldset>`;
}
function updateRegionStatus(cfg){
 const el=$('#region-status');const list=regionalSelection(regionalData,cfg.region,cfg.regionMode);
 $('#region-mode').disabled=!cfg.region;
 $('#parent-region-field').hidden=!cfg.region;$('#region-mode-field').hidden=!cfg.region;
 $('#region-data-details').textContent='';
 if(!cfg.region){el.textContent=regionalData?(english?'Choose a country and then a region to limit your quiz.':'Wähle ein Land und danach eine Region, um dein Quiz einzugrenzen.'):(english?'Regional lists could not be loaded. You can still study without a region.':'Regionale Listen konnten nicht geladen werden. Ohne Regionsfilter kannst du weiterhin lernen.');return;}
 if(!list){el.textContent=english?'This regional list is unavailable. Choose another list or region, or remove the regional filter.':'Diese regionale Liste ist nicht verfügbar. Wähle eine andere Liste oder Region oder entferne den Regionsfilter.';return;}
 const date=new Date(list.updatedAt).toLocaleDateString(english?'en-GB':'de-DE');
 const fullDate=new Date(list.updatedAt).toLocaleString(english?'en-GB':'de-DE');
 $('#region-data-details').textContent=english?`${list.ids.length} species available in our learning data · Updated: ${fullDate}. eBird reports ${list.reportedTaxa} taxa in this list; additional taxa are outside this app’s learning data.`:`${list.ids.length} Arten in unserem Lernbestand verfügbar · Datenstand: ${fullDate}. eBird meldet ${list.reportedTaxa} Taxa in dieser Liste; weitere Taxa sind nicht Teil unseres Lernbestands.`;
 el.textContent=english?`${list.ids.length} study species · Updated: ${date}`:`${list.ids.length} Lernarten · Stand: ${date}`;
 if(regionalDataStale(list))el.textContent+=' '+(english?'Warning: this snapshot is more than three days old; the last successful list is being used.':'Achtung: Dieser Datenstand ist älter als drei Tage; verwendet wird die letzte erfolgreiche Liste.');
}
function lessonRegionLabel(x){const r=regionalData?.regions.find(r=>r.code===x.regionCode||r.nameDe===x.regionLabel||r.nameEn===x.regionLabel);return r?(english?r.nameEn:r.nameDe):x.regionLabel||'';}
function canResumeLesson(x){return !!x&&x.queue.slice(x.index).every(i=>{const s=birds.find(b=>b.id===i.id);return s&&hasLanguagePair(s,x.sourceLanguage,i.t);});}
function learn(preset) {
  if (preset) {
    if(session)session.paused=true;
    ui.learn={...ui.learn,scope:preset.scope||'all',levels:preset.levels||[1,2,3],groups:groups(),ids:preset.ids||[],target:preset.target||'mixed'};
    saveUI();save();
  }
  if(session&&!session.paused){renderQuestion();return;}
  studyMode(false);
  const cfg=ui.learn;
  app.innerHTML=`<h1>Lerneinheit</h1>${storageNotice()}${session?`<section class="panel resume-panel" aria-labelledby="resume-title"><h2 id="resume-title">Pausierte Einheit</h2><p class="muted">${esc(languageLabel(session.sourceLanguage,english?'en':'de'))} → ${esc(session.queue.every(i=>i.t==='code')?'Quick Find Codes':languageLabel(session.nameLanguage,english?'en':'de'))}${lessonRegionLabel(session)?' · '+esc(lessonRegionLabel(session)):''}</p>${pendingLessons.length?`<p class="notice">${english?'Another earlier paused session is preserved and will be available after finishing this one.':'Eine weitere frühere Einheit ist gesichert und wird nach dem Abschließen dieser Einheit verfügbar.'}</p>`:''}<p>${lessonProgress(session).completed} von ${lessonProgress(session).total} ${lessonProgress(session).total===1?'Frage':'Fragen'} beantwortet · ${lessonProgress(session).repeats} ${lessonProgress(session).repeats===1?'Wiederholung':'Wiederholungen'} offen</p><div class="toolbar"><button id="resume" class="primary" ${canResumeLesson(session)?'':'disabled'}>Einheit fortsetzen →</button><button id="finish-paused">Einheit abschließen</button></div>${!canResumeLesson(session)?`<p class="notice">${english?'Required name data is unavailable. The paused session is preserved; please reload before resuming.':'Benötigte Namensdaten sind nicht verfügbar. Die pausierte Einheit bleibt erhalten; bitte vor dem Fortsetzen erneut laden.'}</p>`:''}<p id="start-lesson-hint" class="muted">Deine bisherigen Antworten sind gespeichert. Schließe diese Einheit ab, bevor du eine neue beginnst.</p></section>`:''}${session?`<details class="new-session-options"><summary>${english?'Prepare a new session':'Neue Einheit vorbereiten'}</summary>`:''}<form id="setup" class="panel"><div class="settings primary-target"><div class="field"><label for="target">Lernziel</label><select id="target">${opt(nameTarget,english?'Bird names':'Vogelnamen',cfg.target===nameTarget)+opt('code','Quick Find Codes',cfg.target==='code')+opt('mixed','Namen und Codes, abwechselnd',cfg.target==='mixed')}</select></div></div>${nameLanguageControls(cfg)}<div class="settings primary-settings"><div class="field"><label for="method">Antwortmethode</label><select id="method">${opt('text','Texteingabe',cfg.method==='text')+opt('flash','Karteikarten',cfg.method==='flash')+opt('mc','Multiple Choice',cfg.method==='mc')}</select></div><div class="field"><label for="count">${english?'Questions':'Fragen'}</label><select id="count">${[10,15,25].map(n=>opt(n,n+' Fragen',cfg.count===String(n))).join('')+opt('all',english?'All':'Alle',cfg.count==='all')}</select></div></div><section class="setup-start" aria-label="${english?'Start session':'Einheit starten'}"><p class="selection-count" id="selection-count" role="status"></p><div id="setup-summary" class="muted"></div><div class="actions"><button id="start-lesson" class="primary" type="submit"${session?' aria-describedby="start-lesson-hint"':''}>Lerneinheit starten →</button></div></section><details id="lesson-options"><summary>${english?'Change bird species and settings':'Vogelarten und Einstellungen ändern'}</summary>${regionControls(cfg)}<div class="settings"><div class="field"><label for="scope">Nach Lernstand filtern</label><select id="scope">${opt('all','Alle Arten',cfg.scope==='all')+opt('unmastered','Noch nicht beherrscht',cfg.scope==='unmastered')+opt('due','Nur fällige Wiederholungen',cfg.scope==='due')+opt('wrong','Zuletzt falsch beantwortet',cfg.scope==='wrong')}</select></div></div><fieldset><legend>Lernstufe</legend>${levels.map((l,i)=>`<label class="check-row"><input name="levels" type="checkbox" value="${i+1}" ${cfg.levels.includes(i+1)?'checked':''}>${l}</label>`).join('')}</fieldset><details id="group-selection"><summary>Artengruppen <span id="group-summary"></span></summary><div class="group-picker"><label for="group-search">Gruppen suchen</label><input type="search" id="group-search" placeholder="Zum Beispiel Enten oder Spechte"><div class="toolbar"><button type="button" id="all-groups">Alle Gruppen</button><button type="button" id="no-groups">Auswahl löschen</button></div><div id="selected-groups" class="active-filters"></div><fieldset><legend>Eine oder mehrere Gruppen</legend><div class="group-list">${groups().map(g=>`<label class="check-row" data-group-label="${esc(g)}"><input type="checkbox" name="groups" value="${esc(g)}" ${cfg.groups.includes(g)?'checked':''}>${esc(g)} <span class="muted">(${birds.filter(s=>s.group===g).length})</span></label>`).join('')}</div><p id="group-empty" hidden>Keine passende Gruppe.</p></fieldset></div></details>${cfg.ids.length?`<div class="notice" id="species-selection"><p>${cfg.ids.length} gezielt ${cfg.ids.length===1?'ausgewählte Art':'ausgewählte Arten'} aus der Statistik.</p><button type="button" id="clear-species">Artenauswahl aufheben</button></div>`:''}<label class="photo-option learn-photo-option"><input type="checkbox" id="learn-photos" ${cfg.photos?'checked':''}>Artenbilder nach der Antwort anzeigen</label><p class="form-note">${english?'Answers use the selected name language, including documented accepted alternatives. Names in each language and codes have separate progress. Incorrect answers are repeated.':'Antworten werden in der gewählten Sprache geprüft, einschließlich belegter akzeptierter Varianten. Jede Namenssprache und Codes haben eigene Lernstände. Fehler werden zusätzlich wiederholt.'}</p></details></form>${session?'</details>':''}`;
  const readSettings=()=>{
    nameTarget=$('#answer-language').value;
    Object.assign(cfg,{nameLanguage:nameTarget,sourceLanguage:$('#source-language').value});
    if(!['mixed','code'].includes($('#target').value))$('#target').options[0].value=nameTarget;
    Object.assign(cfg,{region:$('#local-region-field').hidden?$('#region').value:$('#local-region').value,regionMode:$('#region-mode').value,target:$('#target').value,method:$('#method').value,scope:$('#scope').value,count:$('#count').value,levels:[...document.querySelectorAll('[name=levels]:checked')].map(x=>+x.value),groups:[...document.querySelectorAll('[name=groups]:checked')].map(x=>x.value),photos:$('#learn-photos').checked});
    learnPhotos=cfg.photos;saveUI();
  };
  const selection=()=>{
    const ts=cfg.target==='mixed'?[nameTarget,'code']:[cfg.target];
    const eligible=(s,t)=>hasLanguagePair(s,cfg.sourceLanguage,t)&&(cfg.scope==='all'||cfg.scope==='unmastered'&&!mastered(progress(s,t))||cfg.scope==='due'&&due(progress(s,t))||cfg.scope==='wrong'&&progress(s,t)?.lastWrong);
    const pool=birds.filter(s=>regionAllows(regionalData,cfg.region,cfg.regionMode,s.id)&&cfg.levels.includes(s.level)&&cfg.groups.includes(s.group)&&(!cfg.ids.length||cfg.ids.includes(s.id))&&ts.some(t=>eligible(s,t)));
    return {pool:cfg.sourceLanguage===cfg.nameLanguage&&cfg.target!=='code'?[]:pool,eligible,target:cfg.target};
  };
  const update=()=>{
    readSettings();updateRegionStatus(cfg);const n=selection().pool.length;
    const same=cfg.sourceLanguage===cfg.nameLanguage&&cfg.target!=='code';
    const coverage=birds.filter(s=>hasLanguagePair(s,cfg.sourceLanguage,cfg.target==='code'?'code':cfg.nameLanguage)).length;
    const codeOnly=cfg.target==='code';
    $('#answer-language').disabled=codeOnly;$('#answer-language-field').hidden=codeOnly;
    $('#swap-name-languages').disabled=codeOnly;$('#swap-name-languages').hidden=codeOnly;
    $('#name-language-status').textContent=same?(english?'Choose different question and answer languages.':'Wähle unterschiedliche Sprachen für Frage und Antwort.'):codeOnly?(english?`${coverage} species have a name in the question language and a Quick Find Code. Code progress is saved separately.`:`${coverage} Arten haben einen Namen in der Fragesprache und einen Quick Find Code. Der Code-Lernstand wird getrennt gespeichert.`):(english?`${coverage} of ${birds.length} species have names in both languages.`:`${coverage} von ${birds.length} Arten haben Namen in beiden Sprachen.`);
    $('#name-language-status').hidden=!same&&coverage===birds.length;
    $('#source-language').setAttribute('aria-invalid',String(same));$('#answer-language').setAttribute('aria-invalid',String(same));
    $('#selection-count').textContent=selectionMessage({same,count:n,unavailable:!!cfg.region&&!regionalSelection(regionalData,cfg.region,cfg.regionMode)},english);
    $('#start-lesson').disabled=!n||!!session;
    const selectedText=id=>$('#'+id).selectedOptions[0]?.textContent||'';
    const region=cfg.region?(regionalData?.regions.find(r=>r.code===cfg.region)?.[english?'nameEn':'nameDe']||cfg.region)+' · '+selectedText('region-mode'):'';
    const levelText=cfg.levels.length===3?'':cfg.levels.map(n=>t(levels[n-1])).join(', ')||(english?'No vocabulary level selected':'Keine Lernstufe gewählt');
    const groupText=cfg.groups.length===groups().length?'':(english?`${cfg.groups.length} species ${cfg.groups.length===1?'group':'groups'}`:`${cfg.groups.length} ${cfg.groups.length===1?'Artengruppe':'Artengruppen'}`);
    const actualCount=Math.min(+cfg.count||n,n);
    const questionLabel=english?`${actualCount} ${actualCount===1?'question':'questions'}`:`${actualCount} ${actualCount===1?'Frage':'Fragen'}`;
    const lines=[`${languageLabel(cfg.sourceLanguage,english?'en':'de')} → ${codeOnly?'Quick Find Codes':languageLabel(cfg.nameLanguage,english?'en':'de')}${cfg.target==='mixed'?(english?' + codes':' + Codes'):''}`,
      [cfg.count==='all'?questionLabel+(english?' (all matching species)':' (alle passenden Arten)'):questionLabel,t(selectedText('method'))].join(' · '),region,
      [cfg.scope==='all'?'':t(selectedText('scope')),levelText,groupText,cfg.ids.length?(english?`${cfg.ids.length} selected species`:`${cfg.ids.length} gezielt ausgewählte Arten`):''].filter(Boolean).join(' · '),
      cfg.photos?'':(english?'Without pictures':'Ohne Bilder')].filter(Boolean);
    $('#setup-summary').innerHTML=lines.map(line=>`<p>${esc(line)}</p>`).join('');
    $('#group-summary').textContent=cfg.groups.length===groups().length?'· alle':`· ${cfg.groups.length} ausgewählt`;
    $('#selected-groups').innerHTML=cfg.groups.length===groups().length?'<span class="muted">Alle Gruppen ausgewählt</span>':cfg.groups.length?cfg.groups.map(g=>`<button type="button" class="filter-chip" data-unselect="${esc(g)}">${esc(t(g))} ×<span class="sr">: Gruppe entfernen</span></button>`).join(''):'<span class="muted">Keine Gruppe ausgewählt</span>';
    document.querySelectorAll('[data-unselect]').forEach(b=>b.onclick=()=>{const field=[...document.querySelectorAll('[name=groups]')].find(x=>x.value===b.dataset.unselect);field.checked=false;update();});
  };
  $('#setup').onchange=update;
  $('#swap-name-languages').onclick=()=>{if(cfg.target==='code')return;const source=$('#source-language').value;$('#source-language').value=$('#answer-language').value;$('#answer-language').value=source;update();};
  $('#region-country').onchange=e=>{e.stopPropagation();const country=e.target.value;$('#region').innerHTML=regionOptions(country,country);$('#region').disabled=!country;$('#region-label').textContent=country==='GB'?(english?'Constituent country':'Landesteil'):'Region';configureLocalRegions(country);update();};
  $('#region').onchange=e=>{e.stopPropagation();configureLocalRegions(e.target.value);update();};
  $('#group-search').oninput=()=>{const q=normalize($('#group-search').value);let visible=0;document.querySelectorAll('[data-group-label]').forEach(l=>{l.hidden=!normalize(t(l.dataset.groupLabel)).includes(q);visible+=+!l.hidden;});$('#group-empty').hidden=!!visible;};
  $('#all-groups').onclick=()=>{document.querySelectorAll('[name=groups]').forEach(x=>x.checked=true);update();};
  $('#no-groups').onclick=()=>{document.querySelectorAll('[name=groups]').forEach(x=>x.checked=false);update();};
  $('#clear-species')?.addEventListener('click',()=>{cfg.ids=[];$('#species-selection').remove();update();});
  $('#resume')?.addEventListener('click',()=>{session.paused=false;save();renderQuestion();});
  $('#finish-paused')?.addEventListener('click',endLesson);
  update();
  $('#setup').onsubmit=e=>{
    e.preventDefault();readSettings();if(session)return;
    let {pool,eligible,target}=selection();if(!pool.length)return;
    const rank=s=>{const ts=target==='mixed'?[nameTarget,'code']:[target];return Math.min(...ts.filter(t=>eligible(s,t)).map(t=>{const p=progress(s,t);return due(p)?0:!p?1:p.lastWrong?2:3;}));};
    pool=pool.map(s=>({s,r:Math.random()})).sort((a,b)=>rank(a.s)-rank(b.s)||a.r-b.r).map(x=>x.s);
    const n=cfg.count==='all'?pool.length:Math.min(+cfg.count,pool.length);
    const queue=pool.slice(0,n).map((s,i)=>{let t=target==='mixed'?(i%2?'code':nameTarget):target;if(!eligible(s,t))t=t===nameTarget?'code':nameTarget;return {id:s.id,t,retry:0};});
    session={version:1,sourceLanguage:cfg.sourceLanguage,nameLanguage:cfg.nameLanguage,regionCode:cfg.region,regionIds:cfg.region?[...regionalSelection(regionalData,cfg.region,cfg.regionMode).ids]:null,regionLabel:cfg.region?(english?regionalData.regions.find(r=>r.code===cfg.region).nameEn:regionalData.regions.find(r=>r.code===cfg.region).nameDe):'',queue,index:0,correct:0,answered:0,firstAnswered:0,firstCorrect:0,method:cfg.method,photos:cfg.photos,paused:false,done:false,hint:false,result:null,draft:''};
    save();renderQuestion();
  };
}
function endLesson() { const ended=session;session=pendingLessons.shift()||null;save();if(ended)showSummary(ended); }
function showSummary(x) {
  studyMode(false);const p=lessonProgress(x),repeats=x.answered-x.firstAnswered;
  app.innerHTML=`<div class="session panel summary"><h1>Einheit abgeschlossen</h1><p class="summary-score">${x.firstCorrect} von ${x.firstAnswered} ${x.firstAnswered===1?'Erstantwort':'Erstantworten'} richtig</p><p>${p.completed} von ${p.total} ursprünglichen ${p.total===1?'Frage':'Fragen'} bearbeitet.</p><p>${repeats} zusätzliche ${repeats===1?'Wiederholung':'Wiederholungen'} · ${x.correct-x.firstCorrect} davon richtig.</p>${p.completed<p.total||p.repeats?'<p class="muted">Die Einheit wurde vorzeitig abgeschlossen. Bewertete Antworten bleiben im Lernstand gespeichert.</p>':''}${storageNotice()}<div class="actions"><button id="restart" class="primary">${session?(english?'Continue to saved session':'Zur gespeicherten Einheit'):'Neue Einheit'}</button><a class="button-link" href="#statistik">Fortschritt ansehen</a></div></div>`;
  $('#restart').onclick=()=>{learn();focusHeading();};window.scrollTo(0,0);focusHeading();
}
function renderQuestion() {
  const x=session;if(!x)return learn();if(x.index>=x.queue.length){endLesson();return;}
  if(!canResumeLesson(x)){x.paused=true;save();learn();return;}
  studyMode(true);window.scrollTo(0,0);warmStudyPhotos(x);
  const item=x.queue[x.index],s=birds.find(s=>s.id===item.id),p=lessonProgress(x),target=item.t==='code'?'Quick Find Code':languageLabel(item.t,english?'en':'de');
  app.innerHTML=`<div class="session"><div class="meta"><span id="lesson-progress">${p.completed} von ${p.total} ${p.total===1?'Frage':'Fragen'} beantwortet${item.retry?' · Wiederholung':''}<span class="repeat-count">${p.repeats} ${p.repeats===1?'Wiederholung':'Wiederholungen'} offen</span></span><div class="lesson-controls"><button id="pause" class="quiet">Pausieren</button><button id="stop" class="quiet">Abschließen</button></div></div><progress value="${p.completed}" max="${p.total}" aria-label="Ursprüngliche Fragen beantwortet"></progress><div class="panel question"><div class="eyebrow">${esc(languageLabel(x.sourceLanguage,english?'en':'de'))} → ${esc(target)}</div>${lessonRegionLabel(x)?`<p class="muted">Region: ${esc(lessonRegionLabel(x))}</p>`:''}<h1>${nameMarkup(s,x.sourceLanguage)}</h1><div id="answer-area"></div><div id="feedback" aria-live="polite" aria-atomic="false"></div></div>${storageNotice()}</div>`;
  $('#pause').onclick=()=>{x.paused=true;save();learn();window.scrollTo(0,0);focusHeading();};$('#stop').onclick=endLesson;
  if(x.done){renderFeedback(s,item);return;}
  const area=$('#answer-area');
  if(x.method==='text') {
    area.innerHTML=`<form id="answer-form"><label class="sr" for="answer">${target}</label><input id="answer" placeholder="${item.t==='code'?'Vier Buchstaben':english?'Enter the bird name':'Vogelnamen eingeben'}" value="${esc(x.draft||'')}" ${item.t==='code'?'maxlength="4" autocapitalize="characters"':'maxlength="300" autocapitalize="off"'} autocomplete="off" autocorrect="off" spellcheck="false"><div class="actions study-actions"><button type="submit" class="primary">Prüfen</button><button type="button" id="hint" class="quiet">Hinweis</button></div><p id="hint-text" class="muted" role="status">${x.hint?'Beginnt mit „'+esc(targetName(s,item.t)[0])+'“.':''}</p></form>`;
    $('#answer').oninput=()=>{x.draft=$('#answer').value;save();};
    $('#answer-form').onsubmit=e=>{e.preventDefault();const answer=$('#answer').value.trim();if(answer)finish(accepts(s,item.t,answer),s,item,answer);};
    $('#hint').onclick=()=>{x.hint=true;$('#hint-text').textContent='Beginnt mit „'+targetName(s,item.t)[0]+'“.';save();$('#answer').focus();};
    requestAnimationFrame(()=>$('#answer')?.focus({preventScroll:true}));
  }
  if(x.method==='flash') {
    const reveal=()=>{x.revealed=true;save();area.innerHTML=`${nameAnswerMarkup(s,item.t)}${item.t!=='code'?`<p class="code">${esc(s.codes[0])}</p>`:''}${germanNames(s)}<div class="actions study-actions"><button id="no">Nicht gewusst</button><button id="yes" class="primary">Gewusst</button></div>`;$('#no').onclick=()=>finish(false,s,item,'Nicht gewusst');$('#yes').onclick=()=>finish(true,s,item,'Gewusst');$('#yes').focus({preventScroll:true});};
    if(x.revealed)reveal();else{area.innerHTML='<div class="study-actions"><button id="reveal" class="primary">Antwort aufdecken</button></div>';$('#reveal').onclick=reveal;requestAnimationFrame(()=>$('#reveal')?.focus({preventScroll:true}));}
  }
  if(x.method==='mc') {
    const value=b=>targetName(b,item.t),correct=value(s);
    const pool=birds.filter(b=>(!x.regionIds||x.regionIds.includes(b.id))&&hasLanguagePair(b,x.sourceLanguage,item.t)&&b.id!==s.id&&!accepts(s,item.t,value(b))).map(b=>({b,r:Math.random()})).sort((a,b)=>+(b.b.group===s.group)-+(a.b.group===s.group)||a.r-b.r);
    let answers=[correct];for(const {b}of pool)if(!answers.includes(value(b))&&answers.length<4)answers.push(value(b));
    answers=answers.map(v=>({v,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.v);
    area.innerHTML='<div class="choices" role="group" aria-label="Antwort auswählen">'+answers.map((v,i)=>`<button data-choice="${i}" data-name-content lang="${esc(item.t==='code'?'en':item.t)}">${esc(v)}</button>`).join('')+'</div>';
    document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>finish(accepts(s,item.t,answers[+b.dataset.choice]),s,item,answers[+b.dataset.choice]));
    focusHeading();
  }
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
  $('#lesson-progress').innerHTML=`${p.completed} von ${p.total} ${p.total===1?'Frage':'Fragen'} beantwortet<span class="repeat-count">${p.repeats} ${p.repeats===1?'Wiederholung':'Wiederholungen'} offen</span>`;
  const bar=$('progress');bar.value=p.completed;
  $('#feedback').innerHTML=`<div class="feedback"><h2 class="${correct?'good':'bad'}" tabindex="-1">${correct?'✓ Richtig.':'Noch nicht richtig.'}</h2>${x.method!=='flash'?`<p class="your-answer"><span class="muted">Deine Antwort:</span> <span data-name-content>${esc(answer)}</span></p>`:''}<p class="answer-label">${item.t==='code'?'Offizieller Quick Find Code':'Akzeptierte Namen'}</p>${nameAnswerMarkup(s,item.t)}${item.t!=='code'?`<p class="code">${esc(s.codes[0])}</p>`:''}<p class="latin">${esc(s.sci)}</p>${s.codes.length>1?`<p>Weitere akzeptierte Codes: ${s.codes.slice(1).map(esc).join(', ')}</p>`:''}${germanNames(s)}<p class="answer-species-link">${ebirdLink(s)}</p>${x.photos?photoMarkup(s,true):''}<p class="muted">${esc(reviewMessage({correct,hint:x.hint,days:records[key(s,item.t)].interval,retry:item.retry}))}</p><div class="study-actions"><button id="next" class="primary">Weiter →</button></div></div>`;
  if(x.photos)mountStudyPhoto(s);
  $('#next').onclick=()=>{if(!x.done||session!==x)return;x.index++;x.done=false;x.hint=false;x.result=null;x.draft='';x.revealed=false;if(x.index>=x.queue.length)endLesson();else{save();renderQuestion();}};
  focusHeading('#feedback h2');
}
function stats() {
  if(session&&!session.paused){session.paused=true;save();}
  const ps=Object.entries(records).filter(([k])=>k.endsWith(':'+nameTarget)||k.endsWith(':code')).map(([,p])=>p),attempts=ps.reduce((a,p)=>a+p.attempts,0),correct=ps.reduce((a,p)=>a+p.correct,0),learned=birds.filter(s=>progress(s,nameTarget)||progress(s,'code')).length,counts=t=>birds.filter(s=>mastered(progress(s,t))).length;
  const dueNames=birds.filter(s=>due(progress(s,nameTarget))).length,dueCodes=birds.filter(s=>due(progress(s,'code'))).length;
  const hard=birds.map(s=>({s,n:[nameTarget,'code'].reduce((n,t)=>n+(progress(s,t)?.lapses||0),0)})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,10);
  const first=ps.reduce((a,p)=>a+(p.lessonFirstAttempts||0),0),firstCorrect=ps.reduce((a,p)=>a+(p.lessonFirstCorrect||0),0),repeats=ps.reduce((a,p)=>a+(p.lessonRepeatAttempts||0),0);
  app.innerHTML=`<h1>Lernstand</h1><div class="field stats-language"><label for="stats-language">${english?'Name language':'Sprache der Vogelnamen'}</label><select id="stats-language">${languageOptions(nameTarget)}</select></div>${storageNotice()}<div class="stats">${[[learned,'Arten begonnen'],[counts(nameTarget),languageLabel(nameTarget,english?'en':'de')+(english?' names mastered':' – Namen beherrscht')],[counts('code'),'Codes beherrscht'],[dueNames+dueCodes,'Lernziele jetzt fällig']].map(([n,l])=>`<div class="panel"><div class="number">${n}</div><span class="muted">${l}</span></div>`).join('')}</div><p class="muted">„Beherrscht“ bedeutet: dreimal hintereinander ohne Hinweis richtig beantwortet. Namen und Codes zählen getrennt.</p><section class="panel practice-panel"><h2>Jetzt weiterlernen</h2><p>${dueNames} Namen und ${dueCodes} Codes sind fällig.</p><div class="toolbar"><button id="practice-due" class="primary" ${dueNames+dueCodes?'':'disabled'}>Fällige wiederholen</button><button id="practice-new">Noch nicht beherrschte üben</button>${session?`<button id="stats-resume" ${canResumeLesson(session)?'':'disabled'}>Pausierte Einheit fortsetzen</button>`:''}</div>${!dueNames&&!dueCodes?'<p class="muted">Gerade ist keine Wiederholung fällig. Du kannst neue oder noch nicht beherrschte Arten üben.</p>':''}</section><p>${attempts?Math.round(correct/attempts*100)+' % richtig bei '+attempts+' Antworten einschließlich Wiederholungen.':'Noch keine Antworten. Starte eine erste Lerneinheit.'}</p>${first?`<p>${Math.round(firstCorrect/first*100)} % richtige Erstantworten (${firstCorrect} von ${first}) · ${repeats} zusätzliche ${repeats===1?'Wiederholung':'Wiederholungen'}.<br><span class="muted">Getrennte Zählung seit dem 21.10.2026; ältere Antworten sind nur in der Gesamtquote enthalten.</span></p>`:''}<details class="panel group-details"><summary>Fortschritt nach Artengruppe</summary><p class="muted">Beherrschte Arten / Arten der Gruppe</p><div class="table-scroll"><table><thead><tr><th scope="col">Gruppe</th><th scope="col">Namen</th><th scope="col">Codes</th></tr></thead><tbody>${groups().map(g=>{const a=birds.filter(s=>s.group===g);return `<tr><th scope="row">${esc(g)}</th><td>${a.filter(s=>mastered(progress(s,nameTarget))).length} / ${a.length}</td><td>${a.filter(s=>mastered(progress(s,'code'))).length} / ${a.length}</td></tr>`;}).join('')}</tbody></table></div></details>${hard.length?`<section class="panel practice-panel"><h2>Häufig falsch beantwortet</h2>${hard.map(({s,n})=>`<div class="difficult-species"><span>${nameMarkup(s,'de')} <span class="muted">· ${esc(t(n+' Fehler insgesamt'))}</span></span><button data-practice="${esc(s.id)}">Art üben<span class="sr">: ${nameMarkup(s,'de')}</span></button></div>`).join('')}<button id="practice-hard">Diese ${hard.length} Arten üben</button></section>`:''}<details class="panel group-details"><summary>Lernstand sichern und verwalten</summary><p>Ein Import ersetzt nach Bestätigung den aktuellen Lernstand. Lade eine Sicherung herunter, bevor du ihn ersetzt oder zurücksetzt.</p><div class="backup-actions"><button id="export">Lernstand als JSON sichern</button><label for="import">Sicherung importieren<input type="file" id="import" accept=".json,application/json"></label></div><details class="reset-area"><summary>Lernstand zurücksetzen</summary><p>Entfernt alle Lernwerte und die laufende Einheit aus diesem Browser.</p><button id="reset" class="danger">Fortschritt zurücksetzen</button></details><p id="import-status" role="status"></p></details>`;
  $('#stats-language').onchange=()=>{nameTarget=$('#stats-language').value;ui.learn.nameLanguage=nameTarget;if(!['code','mixed'].includes(ui.learn.target))ui.learn.target=nameTarget;saveUI();stats();};
  const launch=preset=>{learn(preset);if(location.hash!=='#lernen'){skipNextRoute=true;location.hash='lernen';}setActiveNav('lernen');window.scrollTo(0,0);focusHeading();};
  $('#practice-due').onclick=()=>launch({scope:'due'});$('#practice-new').onclick=()=>launch({scope:'unmastered'});
  $('#stats-resume')?.addEventListener('click',()=>{session.paused=false;save();setActiveNav('lernen');skipNextRoute=true;location.hash='lernen';renderQuestion();});
  document.querySelectorAll('[data-practice]').forEach(b=>b.onclick=()=>launch({ids:[b.dataset.practice]}));
  $('#practice-hard')?.addEventListener('click',()=>launch({ids:hard.map(x=>x.s.id)}));
  $('#export').onclick=()=>{const blob=new Blob([JSON.stringify({app:'BirdNames DE',version:1,taxonomy:meta.taxonomy,exported:new Date().toISOString(),records},null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='birdnames-de-lernstand.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
  $('#import').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>5000000)throw Error('Datei ist zu groß (maximal 5 MB).');const r=validProgress(JSON.parse(await f.text()),new Set(birds.map(s=>s.id)));if(!confirm(t(Object.keys(r).length+' Lernwerte importieren und den aktuellen Stand ersetzen?')))return;records=r;session=null;pendingLessons=[];const ok=await save();stats();$('#import-status').textContent=ok?'Lernstand importiert.':'Import in dieser Ansicht geladen, aber nicht dauerhaft gespeichert. Bitte Sicherung behalten.';}catch(err){$('#import-status').textContent=importErrorMessage(err);}};
  $('#reset').onclick=async()=>{if(confirm(t('Alle Lernwerte und die laufende Einheit in diesem Browser löschen?'))){records={};session=null;pendingLessons=[];await save();stats();}};
}
function info(){app.innerHTML=renderInformation({english,birds,meta,germanNamesMeta,photos,regions:regionalData});}

function setActiveNav(page){document.querySelectorAll('nav a').forEach(a=>{const active=a.hash==='#'+page;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
function route(){
 if(skipNextRoute){skipNextRoute=false;return;}
 $('#photo-dialog')?.close();rememberLookup();const page=location.hash.slice(1)||'nachschlagen';setActiveNav(page);
 if(page!=='lernen'&&session&&!session.paused){session.paused=true;save();}
 studyMode(false);({nachschlagen:lookup,lernen:learn,statistik:stats,info}[page]||lookup)();
 if(page!=='nachschlagen')window.scrollTo(0,0);
 if(page!=='lernen'||!session||session.paused)focusHeading();
}
try{let data=await(await fetch('species.json')).json();birds=data.species.sort((a,b)=>a.de.localeCompare(b.de,'de'));meta=data.meta;
try{const names=await(await fetch('german-names.json')).json();germanNamesMeta=names.meta;for(const s of birds)s.germanNames=names.species[s.id]?.names||[];}catch(err){console.warn('Deutsche Alternativnamen nicht geladen',err)}
availableNameLanguages=await loadNameData(birds);
ui.learn.nameLanguage=isNameLanguage(ui.learn.nameLanguage)?ui.learn.nameLanguage:isNameLanguage(ui.learn.target)?ui.learn.target:defaultNameTarget;
nameTarget=ui.learn.nameLanguage;
ui.learn.sourceLanguage=isNameLanguage(ui.learn.sourceLanguage)?ui.learn.sourceLanguage:english?'en':'de';
if(!['code','mixed'].includes(ui.learn.target))ui.learn.target=nameTarget;
const allGroups=groups(),ids=new Set(birds.map(s=>s.id));
ui.lookup.query=typeof ui.lookup.query==='string'?ui.lookup.query:'';ui.lookup.group=allGroups.includes(ui.lookup.group)?ui.lookup.group:'';ui.lookup.level=['1','2','3'].includes(ui.lookup.level)?ui.lookup.level:'';ui.lookup.scroll=Number.isFinite(ui.lookup.scroll)?Math.max(0,ui.lookup.scroll):0;
ui.learn.groups=Array.isArray(ui.learn.groups)?ui.learn.groups.filter(g=>allGroups.includes(g)):allGroups;
ui.learn.ids=Array.isArray(ui.learn.ids)?ui.learn.ids.filter(id=>ids.has(id)):[];
ui.learn.region=typeof ui.learn.region==='string'&&/^[A-Z]{2}(?:-[A-Z0-9]{1,4}){0,2}$/.test(ui.learn.region)?ui.learn.region:'';
ui.learn.regionMode=['all','recent'].includes(ui.learn.regionMode)?ui.learn.regionMode:'recent';
ui.learn.levels=Array.isArray(ui.learn.levels)?ui.learn.levels.filter(n=>[1,2,3].includes(n)):[1];
for(const [field,options]of Object.entries({target:[nameTarget,'code','mixed'],method:['text','flash','mc'],scope:['all','unmastered','due','wrong'],count:['10','15','25','all']}))if(!options.includes(ui.learn[field]))ui.learn[field]=defaults.learn[field];
try{const response=await fetch('regions.json?format=hierarchy',{cache:'no-cache'});if(response.ok)regionalData=validateRegions(await response.json(),ids);}catch{console.warn('Regional lists unavailable');}
try{photos=(await(await fetch('photos.json')).json()).photos}catch(err){console.warn('Artenbilder nicht geladen',err)}saveUI();try{await initDB();await save()}catch{storageOK=false}window.addEventListener('hashchange',route);route();}catch(err){app.innerHTML='<h1>Daten konnten nicht geladen werden.</h1><p>Bitte Seite erneut laden.</p>';console.error(err)}
