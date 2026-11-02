import {migrateRecords} from './learning-model.js?v=20261102-learning2';
import {validProgress} from './logic.js?v=20261102-learning2';

export function inspectBackup(value,ids){
 const records=validProgress(value,ids);
 const count=Object.keys(records).length,original=Object.keys(value.records).length;
 if(original&&!count)throw Error('Keine unterstützten Lernwerte in dieser Sicherung.');
 const exported=typeof value.exported==='string'&&Number.isFinite(Date.parse(value.exported))?value.exported:null;
 return {records:migrateRecords(records),daily:validateDaily(value.daily),count,skipped:original-count,species:new Set(Object.keys(records).map(key=>key.split(':')[0])).size,exported};
}
export function backupSummary(records,english=false){
 const targets=Object.keys(records).length,species=new Set(Object.keys(records).map(key=>key.split(':')[0])).size;
 return english?`${targets} learning ${targets===1?'target':'targets'} for ${species} species`:`${targets} ${targets===1?'Lernziel':'Lernziele'} für ${species} ${species===1?'Art':'Arten'}`;
}
export function backupFilename(stamp){return 'birdnames-de-lernstand-'+new Date(stamp).toISOString().replace(/:/g,'-').replace(/\.\d{3}Z$/,'Z')+'.json';}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function backupPanel(english=false,storageOK=true){
 const choose=(de,en)=>english?en:de;
 return `<details id="backup-panel" class="panel group-details"><summary>${choose('Lernstand sichern und wiederherstellen','Back up and restore progress')}</summary>
 <p id="backup-storage-description">${storageOK?choose('Dein Lernstand wird automatisch in diesem Browser auf diesem Gerät für diese Website gespeichert. Er wird nicht mit einem Konto oder anderen Geräten synchronisiert. Beim Löschen von Websitedaten oder im privaten Modus kann er verloren gehen.','Your progress is saved automatically in this browser on this device for this website. It does not sync to an account or other devices. Clearing site data or using private browsing can cause it to be lost.'):choose('Der Browser kann deinen Lernstand gerade nicht speichern. Er ist nur in der geöffneten Ansicht verfügbar. Lade vor dem Schließen eine Sicherung herunter.','The browser cannot save your progress right now. It is only available in the open view. Download a backup before closing.')}</p>
 <section class="backup-step"><h3>${choose('1. Sicherung herunterladen','1. Download a backup')}</h3>
 <p>${choose('Die JSON-Datei enthält den Lernstand aller Antwortsprachen und Codes, einschließlich Methoden, Lernrichtungen und Tagesbudget, unabhängig von den aktuellen Filtern. Pausierte Einheiten, Antwortentwürfe und Einstellungen sind nicht enthalten.','The JSON file contains progress for all answer languages and codes, including methods, learning directions and daily budget, regardless of the current filters. Paused sessions, draft answers and preferences are not included.')}</p>
 <button id="export" type="button">${choose('Sicherung herunterladen (JSON)','Download backup (JSON)')}</button>
 <p id="export-status" class="muted" role="status"></p></section>
 <section class="backup-step"><h3>${choose('2. Sicherung prüfen und wiederherstellen','2. Review and restore a backup')}</h3>
 <p id="import-help">${choose('Wähle eine JSON-Sicherung. Zuerst wird eine Vorschau angezeigt; die Dateiauswahl ändert deinen Lernstand noch nicht. Die Datei wird nur in deinem Browser gelesen und nicht hochgeladen.','Choose a JSON backup. You will see a preview first; selecting a file does not change your progress. The file is read only in your browser and is not uploaded.')}</p>
 <label for="import">${choose('Sicherungsdatei auswählen','Choose backup file')}<input type="file" id="import" accept=".json,application/json" aria-describedby="import-help"></label>
 <div id="import-preview" hidden></div><p id="import-status" role="status"></p></section>
 <details class="reset-area"><summary>${choose('Lernstand zurücksetzen','Reset progress')}</summary><p>${choose('Entfernt alle Lernwerte und pausierten Einheiten aus diesem Browser. Einstellungen bleiben erhalten. Lade vorher eine Sicherung herunter, wenn du die Lernwerte behalten möchtest.','Removes all progress and paused sessions from this browser. Preferences are retained. Download a backup first if you want to keep your progress.')}</p><button id="reset" class="danger">${choose('Fortschritt zurücksetzen','Reset progress')}</button></details></details>`;
}
export function backupPreview({candidate,current,filename,hasSession,english=false}){
 const choose=(de,en)=>english?en:de;
 const date=candidate.exported?new Date(candidate.exported).toLocaleString(english?'en-GB':'de-DE'):choose('Nicht in der Datei angegeben','Not specified in the file');
 return `<h4 tabindex="-1" id="import-preview-title">${choose('Sicherung vor dem Ersetzen prüfen','Review backup before replacing progress')}</h4>
 <dl class="backup-comparison"><dt>${choose('Datei','File')}</dt><dd>${esc(filename)}</dd><dt>${choose('Sicherungsdatum','Backup date')}</dt><dd>${esc(date)}</dd><dt>${choose('In dieser Sicherung','In this backup')}</dt><dd>${esc(backupSummary(candidate.records,english))}</dd><dt>${choose('Bisher in diesem Browser','Currently in this browser')}</dt><dd>${esc(backupSummary(current,english))}</dd></dl>
 <p>${choose('Ein Lernziel ist ein Antwortname oder Code einer Art.','A learning target is an answer name or code for one species.')}</p>
 <p class="notice">${choose('Beim Ersetzen werden ALLE bisherigen Lernwerte durch diese Sicherung ersetzt, auch für andere Antwortsprachen. Die Daten werden nicht zusammengeführt. Einstellungen bleiben erhalten.','Replacing will overwrite ALL existing progress with this backup, including other answer languages. The data will not be merged. Preferences are retained.')}${hasSession?' '+choose('Auch deine pausierten Einheiten werden beendet; sie können aus dieser Sicherung nicht wiederhergestellt werden.','Your paused sessions will also be ended; they cannot be restored from this backup.'):''}</p>
 ${candidate.skipped?`<p class="notice">${esc(choose(`${candidate.skipped} nicht unterstützte Einträge werden nicht übernommen.`,`${candidate.skipped} unsupported records will not be restored.`))}</p>`:''}
 ${!candidate.count?`<p class="notice">${choose('Diese Sicherung ist leer. Das Ersetzen entfernt sämtliche bisherigen Lernwerte.','This backup is empty. Replacing will remove all existing progress.')}</p>`:''}
 <p>${choose('Sichere den bisherigen Stand vor dem Ersetzen. Ein Import kann nur mit einer passenden Sicherung rückgängig gemacht werden.','Back up your current progress before replacing it. An import can only be undone using a suitable backup.')}</p>
 <div class="toolbar"><button type="button" id="export-before-import">${choose('Bisherigen Stand herunterladen','Download current progress')}</button><button type="button" id="confirm-import" class="primary">${candidate.count?choose('Lernstand durch diese Sicherung ersetzen','Replace progress with this backup'):choose('Lernstand durch leere Sicherung ersetzen','Replace progress with empty backup')}</button><button type="button" id="cancel-import">${choose('Abbrechen','Cancel')}</button></div>`;
}

export function validateDaily(value){
 if(value==null)return null;
 if(!value||!/^\d{4}-\d{2}-\d{2}$/.test(value.date)||!Array.isArray(value.introduced)||value.introduced.length>10000||!value.introduced.every(k=>typeof k==='string'&&k.length<200))throw Error('Ungültige Lernwerte.');
 return {date:value.date,introduced:[...new Set(value.introduced)]};
}
