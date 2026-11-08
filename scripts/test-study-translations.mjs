import assert from 'node:assert/strict';
globalThis.localStorage={getItem:()=> 'en'};
const {t,reviewMessage,importErrorMessage}=await import('../dist/i18n.js');
const cases=new Map([
 ['So funktioniert das Lernen','How learning works'],
 ['Namen kennenlernen, selbst erinnern, Rückmeldung bekommen und mit Abstand wiederholen. Die Erläuterung und wissenschaftlichen Quellen erscheinen nach dem Laden der App.','Get to know names, recall them yourself, get feedback and review them at spaced intervals. The explanation and scientific sources appear once the app has loaded.'],
 ['Deutsche, englische und wissenschaftliche Vogelnamen und offizielle eBird Quick Find Codes nachschlagen und lernen.','Look up and learn German, English and scientific bird names and official eBird Quick Find Codes.'],
 ['· 1 ausgewählt','· 1 selected'],
 ['1 von 1 Frage beantwortet','1 of 1 question answered'],
 ['1 von 1 Fragen beantwortet','1 of 1 question answered'],
 ['1 von 2 Fragen beantwortet','1 of 2 questions answered'],
 ['1 Wiederholung offen','1 repeat remaining'],
 ['0 von 1 Erstantwort richtig','0 of 1 first answer correct'],
 ['0 von 2 Erstantworten richtig','0 of 2 first answers correct'],
 ['1 von 1 ursprünglichen Frage bearbeitet.','1 of 1 original question completed.'],
 ['1 zusätzliche Wiederholung · 0 davon richtig.','1 extra repeat · 0 correct.'],
 ['1 Namen und 0 Codes sind fällig.','1 names and 0 codes are due.'],
 ['100 % richtig bei 1 Antworten einschließlich Wiederholungen.','100% correct across 1 answer including repeats.'],
 ['50 % richtig bei 2 Antworten einschließlich Wiederholungen.','50% correct across 2 answers including repeats.'],
 ['1 Fehler insgesamt','1 error in total'],
 ['2 Fehler insgesamt','2 errors in total'],
 ['Diese 1 Arten üben','Practise this species'],
 ['Diese 2 Arten üben','Practise these 2 species'],
 ['Beherrschte Arten / Arten der Gruppe','Mastered species / species in group'],
 ['Lernstand sichern und verwalten','Back up and manage progress'],
 ['Entfernt alle Lernwerte und die laufende Runde aus diesem Browser.','Removes all progress and the current round from this browser.']
]);
for(const [de,en] of cases)assert.equal(t(de),en);
for(const days of [1,3,7,14,30,60])assert.equal(reviewMessage({correct:true,hint:false,days,retry:0}),`Next scheduled review in ${days} ${days===1?'day':'days'}.`);
for(const hint of [false,true])for(const retry of [0,1,2]){
 const message=reviewMessage({correct:false,hint,days:0,retry});
 assert.equal(message,'Next scheduled review in ten minutes.'+(retry<2?' An extra attempt follows in this round.':'')+(hint?' Answered with a hint.':''));
}
assert.equal(reviewMessage({correct:true,hint:true,days:0,retry:0}),'Next scheduled review in ten minutes. Answered with a hint.');
for(const error of ['Keine gültige BirdNames-DE-Sicherung.','Ungültiger Lerneintrag.','Ungültige Lernwerte.','Ungültige getrennte Antwortzähler.','Widersprüchliche Antwortzähler.','Widersprüchliche Lernwerte.','Datei ist zu groß (maximal 5 MB).'])assert.equal(importErrorMessage(Error(error)),'Import failed: '+t(error));
assert.equal(importErrorMessage(new SyntaxError('engine-specific message')),'Import failed: The file does not contain valid JSON.');
for(const message of ['Die Sicherung ist zu groß (entpackt maximal 128 MiB).','Die Gzip-Sicherung ist beschädigt oder kein gültiges Gzip.','Dieser Browser kann Gzip nicht öffnen. Bitte die Datei zuerst entpacken und die JSON-Datei wählen.'])assert.equal(importErrorMessage(Error(message)),'Import failed: '+t(message));
assert.equal(importErrorMessage(Error('unbekannter Fehler')),'Import failed: The backup could not be read. Please check the file and try again.');
globalThis.localStorage={getItem:()=>null};
const de=await import('../dist/i18n.js?study-test-de');
assert.equal(de.reviewMessage({correct:false,hint:true,retry:0}),'Planmäßig wieder fällig in zehn Minuten. Ein Zusatzversuch folgt in dieser Runde. Mit Hinweis beantwortet.');
assert.equal(de.importErrorMessage(Error('Keine gültige BirdNames-DE-Sicherung.')),'Import fehlgeschlagen: Keine gültige BirdNames-DE-Sicherung.');
for(const text of cases.keys())assert.equal(de.t(text),text);
console.log('PASS: English study/progress counters, singular/plural, all review/hint/retry states, backup errors and unchanged German messages.');
