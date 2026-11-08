# Qualitätskontrolle BirdNames DE · 8. November 2026

## Nachtrag: Behebung B1–B3 am 8. November 2026

Die folgenden ursprünglichen Befunde beschreiben die Erstprüfung. B1, B2 und B3
sind im Änderungspaket `20261108-quality1` behoben. Grundlage war `36d030b`.
Die zwischenzeitlich separat vorgenommenen CSS-/Cache-Änderungen `f1ba681`
und `ebf0371` wurden im Checkout beibehalten; die Abschlussprüfung erfolgt
zusammen mit diesem Stand.

| Befund | Änderung | Nachweis |
| --- | --- | --- |
| B1 / P2 | `loadSeasonal()` übernimmt Daten erst nach erfolgreichem HTTP-, Struktur- und Fingerabdrucktest. Bei Ablehnung bleibt `seasonalData` null. | Produktiven Initialisierungszweig mit falschem/fehlendem Fingerabdruck, fehlenden Metadaten, HTTP-, JSON- und Netzwerkfehlern ausgeführt. Auswahl und Quellen-Snapshot fallen auf regionale Daten zurück. Im Browser mit falschem Fingerabdruck: 595 passende Arten und sichtbarer Hinweis auf unzureichende Saisondaten statt der abgelehnten saisonalen Auswahl. |
| B2 / P2 | Gemeinsamer Dateicodec für JSON und Gzip, automatische Komprimierung ab 1 MiB kompaktem JSON, gemeinsames Limit von 128 MiB vor und nach dem Entpacken sowie beim regulären Export. | 939 Lernziele mit 75.120 Antworten: bisheriges formatiertes JSON 6.020.541 Bytes; neuer Gzip-Export 242.394 Bytes. Import, weitere Antwort und erneuter Export erfolgreich. Alte große JSON-Datei ebenfalls lesbar. |
| B3 / P3 | Elf anhand gleicher Taxonkonzepte geprüfte wissenschaftliche Namensvarianten in Suche und Filterhilfe. Exakte Treffer mit Quelle, DE/EN-Erklärung derselben Art und des weiterhin geltenden Lernnamens von 2025. | Alle elf Varianten einschließlich Rohrammer jetzt exakte Treffer, unabhängig von Groß-/Kleinschreibung. Winterzaunkönig wird nicht zum Zaunkönig umgedeutet; Filter bleiben wirksam. Geänderte Artkonzepte erzeugen keine automatischen Synonyme. |

Datei-/Schemafehler bleiben vor dem ausdrücklichen Ersetzen ohne Schreibwirkung.
Gzip-Kennung, Trunkierung, falsche Prüfsumme, fehlende Browserunterstützung,
Größenüberschreitung und expandierende Archive sind abgedeckt. Die Kontrolle der
entpackten Größe erfolgt im Stream; das kleine expandierende Testarchiv wurde
mit einem reduzierten Testbudget abgebrochen, ohne dafür 128 MiB anzulegen.
Das 128-MiB-Limit ist eine Ressourcenbegrenzung, keine Änderung des Backupformats.
Für darüber hinausgehende Zustände verweigert der reguläre Export den Download
mit Hinweis; er entfernt oder kürzt keine Lernwerte. Rettungsdateien behalten
ihren getrennten Zweck und bleiben unverändertes, nicht importierbares JSON.

Browserprüfung auf getrennten lokalen Ursprüngen, keine persönlichen Live-Daten:
Gzip-Dateiauswahl → Vorschau → Ersetzen per Tastatur → Download einer neuen
`.json.gz` → beschädigtes Archiv ablehnen → Reload mit erhaltenen 939 Zielen.
Wiederherstellungsansicht → Rettungsdownload mit unverändertem `attempts: -1`
→ Gzip-Vorschau → kontrolliert fehlgeschlagener Schreibvorgang → Originalwert
weiter `-1` und Sperre nach Reload → erfolgreiches Ersetzen mit anschließend
gespeicherten 80 Antworten je Testziel. Der kontrollierte Fehler wurde in einer
eindeutig versionierten lokalen Testantwort am Speicheradapter erzeugt; die
Checkout-Dateien enthalten keine Fehleradapter. Beim Wiederholungstest wurde
die Datei durch einen temporären lokalen Fixture-Knopf dem regulären
Datei-Ereignishandler übergeben; die native Dateiauswahl war zuvor separat
erfolgreich geprüft worden.

DE/EN, heller/dunkler Modus, Desktop und 390 × 844 CSS-Pixel wurden für die
betroffenen Ansichten geprüft; kein horizontaler Überlauf beim neuen
Namenshinweis. Tastaturbetätigung von Ergebnisdisclosure und Ersetzen geprüft.
Physische Mobilgeräte und echte Screenreader-Ausgabe bleiben ungeprüft.

Automatisierte Abnahme: `npm test`, alle 27 `scripts/test-*.mjs`, 47 Python-Tests,
Datenvalidierung, wissenschaftliche Namensprüfung, EBD-Reproduzierbarkeit,
Prüfung auf private EBD-Dateien, Medienvalidierung und Syntax aller JS-Module
bestanden (Node 26.8.1 / Python 3.14.7). Die vollständigen neuen Regressionen
liegen in `scripts/test-backup-file.mjs`, `scripts/test-hybrid-learning.mjs`
und `scripts/test-lookup-search.mjs`; bestehende Speichertransaktionstests
sichern weiterhin den atomaren Austausch ab.

Die Taxonomie bleibt 2025. Eine vollständige Umstellung auf 2026 ist ein
separates Datenupdate mit ausdrücklicher Entscheidung zu Grauschnäpper,
Rotkehlchen und Virginiauhu sowie Prüfung regionaler Daten, Medien, Links und
Fortschrittsmigration. Die Untersuchung und Quellen stehen in
`docs/catalog-identity-review-20261108.md`. Die vorhandene unversionierte
Sicherheitsprüfung blieb unverändert und ist nicht Teil des Commits.

## Ergebnis und geprüfter Stand

**Drei bestätigte Befunde: zwei P2-Funktionslücken und eine P3-Suchlücke. Kein neuer P1-Fehler in den ausgeführten Prüfungen nachgewiesen.** Die vollständige vorhandene Testsuite besteht trotzdem. Die normalen geprüften Such- und Lernabläufe funktionieren; die wesentlichen offenen Punkte betreffen abgelehnte Saisondaten und die Wiederherstellbarkeit großer eigener Sicherungen.

Geprüft im kanonischen Checkout `/Users/thumax/git/birdnamesde`. Ausgangspunkt war `cc4d663`; während der Prüfung kamen drei reine Beschriftungsänderungen hinzu. Abschließender Quelltext-/Teststand ist **`1d91a50b9688095e3dfaaaa2baf88b74c57314c0`**, insgesamt 28 Commits nach dem Abschluss der letzten Qualitätsrunde (`02ba49e`). Die abschließende Node-Suite lief bei unverändertem HEAD vollständig durch. Die zwischenzeitlichen Beschriftungsänderungen berühren die nachgewiesenen Fehlerpfade nicht.

Die Prüfung umfasst Änderungen an Suche, Codes, wissenschaftlichen Namen, Karten und Darstellung sowie Regressionen der bisherigen Lern-/Speicherfunktionen. Es wurden **keine App-Dateien oder Daten verändert, keine Fehler behoben und keine Veröffentlichung ausgelöst**. Dieser Bericht bleibt lokal. Die bereits vorhandene unversionierte Sicherheitsprüfung blieb unverändert. Es wurden ausschließlich separate lokale Browser-Testdaten verwendet, keine persönlichen Lernwerte der veröffentlichten Website.

Prioritäten: P1 = gravierender Verlust bzw. Blockade im regulären Kernablauf; P2 = relevante Funktions-/Datenintegritätslücke unter den genannten Voraussetzungen; P3 = begrenzte Funktions- oder Darstellungsinkonsistenz. Die Nachweise unterscheiden Browserbeobachtungen, synthetische gültige Daten und Quelltextbefunde.

## Bestätigte Befunde

### B1 · P2 · Saisondatei mit falschem Katalogfingerabdruck wird weiterverwendet

**Ort:** `dist/app.js:885`, Initialisierung von `seasonalData`.

**Voraussetzung:** Die geladene Saisondatei ist strukturell gültig und enthält weiterhin bekannte Arten-IDs, gehört laut `dataset.catalogFingerprint` aber zu einem anderen Katalogstand. Ein solcher Fall kann beispielsweise beim Zusammenspiel unterschiedlich alter statischer Dateien auftreten. Die aktuell veröffentlichte Datei ist konsistent; kein solcher Live-Mischstand wurde nachgewiesen.

**Reproduktion und Nachweis:** Ein separater lokaler Server lieferte die reguläre Saisondatei aus, ersetzte aber ausschließlich ihren Fingerabdruck durch `obsolete-catalogue`. Die App protokollierte `Seasonal data unavailable`. Die Lernvorbereitung verwendete trotzdem weiterhin die saisonale Deutschland-Auswahl mit 145 Arten und bot die Tagesrunde an, statt die abgelehnten Saisondaten zu verwerfen und den regionalen Rückfall anzuwenden. Zusätzlich wurde der unveränderte Initialisierungszweig aus dem aktuellen App-Quelltext mit einem Fetch-Adapter ausgeführt: Trotz Warnung blieb `seasonalData.dataset.catalogFingerprint === 'obsolete-catalogue'`.

**Ursache:** `seasonalData` wird bereits vor dem Fingerabdruckvergleich gesetzt. Der nachfolgende Fehler erreicht zwar den `catch`, dort wird die Variable jedoch nicht geleert. Der Vergleich verhindert damit die spätere Verwendung nicht.

**Auswirkung:** Eine ausdrücklich als nicht verfügbar bzw. nicht passend erkannte Datenquelle kann dennoch die Artenauswahl und die in der Runde gespeicherten Quellenangaben bestimmen. Die bestehende Prüfung gegen falsche Katalogzuordnung wirkt hier nur als Konsolenmeldung.

**Behebungsvorschlag:** In eine lokale Kandidatenvariable laden, Struktur und Fingerabdruck vollständig prüfen und erst danach `seasonalData` zuweisen. Im Fehlerfall muss der veröffentlichte Zustand sicher `null` bleiben. Die Oberfläche soll dann den bestehenden regionalen Rückfall oder die Nichtverfügbarkeit anzeigen.

**Fehlende Regression:** Den tatsächlichen Initialisierungsweg mit gültiger Struktur, bekannten IDs und falschem/fehlendem Fingerabdruck testen; anschließend die sichtbare Auswahl und den Quellen-Snapshot einer gestarteten Runde prüfen. Die vorhandenen Funktionstests für `validateSeasonal()` und regionale Rückfälle decken diesen Zuweisungsfehler nicht ab.

### B2 · P2 · Große gültige Exporte überschreiten das eigene Importlimit

**Ort:** Export in `dist/app.js:802–807`, Importgrenze in `dist/app.js:819`.

**Voraussetzung:** Umfangreicher Lernstand mit mehreren Methoden bzw. Lernrichtungen. Der Fall wurde synthetisch erzeugt und nicht im persönlichen Lernstand beobachtet. Er ist keine unmittelbare Störung bei kleinen Sicherungen.

**Reproduktion und Nachweis:** Mit `gradeRecord()` wurden für 939 unterstützte Englisch-Ziele jeweils vier Methodenkontexte mit 20 richtigen Antworten aufgebaut: Deutsch/Text, Deutsch/Karteikarten, Deutsch/Erkennung und Niederländisch/Text. Das sind 75.120 Antworten insgesamt. `inspectBackup()` akzeptiert alle 939 Einträge. Mit derselben formatierten JSON-Serialisierung wie im Export ergibt die minimale v2-Sicherung bereits **6.239.282 Bytes**. Der echte Export enthält zusätzlich Taxonomie-/Datums-/Tagesbudgetangaben und ist entsprechend nicht kleiner. Der Import lehnt jede Datei über **5.000.000 Bytes** bereits vor dem Einlesen ab.

**Auswirkung:** Ein gültiger eigener Export kann nicht über die reguläre Wiederherstellung importiert werden. Der Export signalisiert nur den Downloadstart und warnt nicht davor. Die lokal vorhandenen Lernwerte werden dabei nicht verändert; die portable Sicherung erfüllt für solche großen Stände aber ihre Wiederherstellungsfunktion nicht. Die Rettungsdatei ist ausdrücklich kein Ersatz für eine importierbare Fortschrittssicherung.

**Behebungsvorschlag:** Exportformat, zulässigen Zustandsumfang und Importbegrenzung aufeinander abstimmen. Eine regulär erzeugte Sicherung muss wieder importierbar sein, ohne historische Antworten oder Nachweise still zu kürzen. Die reine Anhebung eines beliebigen Limits sollte durch einen definierten zulässigen Datenumfang und sinnvolle Ressourcenbegrenzungen abgesichert werden.

**Fehlende Regression:** Export → echte Dateigröße → Dateiannahme → Import → weitere Bewertung für einen großen gültigen Mehrmethoden-/Mehrsprachenstand. Vorhandene Rundreisetests prüfen die Datenschemata mit kleinen Objekten; die vorgelagerte Dateigrößenprüfung wird dabei nicht erreicht.

### B3 · P3 · Angezeigte wissenschaftliche Codenamen fehlen im Suchindex

**Ort:** `dist/lookup-search.js:9–13`, `dist/logic.js` (`matches()`), Darstellung über `codeGroups()`.

**Browsernachweis:** In der Karte des Zaunkönigs steht unter dem wissenschaftlichen Code NATR der Hinweis **„Wissenschaftlicher Kurzcode für Nannus troglodytes“**. Die Suche nach genau `Nannus troglodytes` liefert keine Art. `Zaunkönig`, der Katalogname `Troglodytes troglodytes` und der Code selbst bleiben suchbar.

**Umfang:** Elf Arten haben eine von `sci` abweichende `scientificCodeName`-Angabe. Bei zehn davon findet die vollständige angezeigte Codebezeichnung die eigene Art nicht; der verbleibende Fall trifft über bereits vorhandene Namensbestandteile. Ein gezielter Aufruf der produktiven Suche über den vollständigen Katalog bestätigt den Umfang. Die Länderfilter sind nicht die Ursache.

**Ursache/Auswirkung:** Der neue Suchindex enthält akzeptierte Namen, deutsche redaktionelle Namen und Codes, aber nicht `scientificCodeName`. Der bisherige Suchhelfer `matches()`, der auch Filterhilfen bestimmt, berücksichtigt das Feld ebenfalls nicht. Damit ist eine auf der Karte sichtbare wissenschaftliche Bezeichnung nicht zuverlässig zur Wiederauffindung nutzbar. Es handelt sich nicht um einen Nachweis falscher Taxonomie oder falscher Codezuordnung.

**Behebungsvorschlag:** Den angezeigten Codenamen als zusätzliche, entsprechend bezeichnete Suchinformation berücksichtigen und auch die Filterhilfen konsistent behandeln. Die gepinnte Katalogbezeichnung und die akzeptierten Lernantworten müssen dadurch nicht geändert werden.

**Fehlende Regression:** Alle elf Abweichungen einschließlich Trefferursache, Groß-/Kleinschreibung und Länderfilter prüfen. Bestehende Tests vergleichen die neue Suche hauptsächlich mit `matches()`; weil beide das Feld auslassen, bleibt die gemeinsame Lücke grün.

## Ausgeführte Prüfungen

### Automatisierte Grundlage und Daten

Lokal **Node 26.8.1 / Python 3.14.7**. Die Veröffentlichung prüft zusätzlich unter der dokumentierten Python-3.15-Linie. `npm test` führt weiterhin nur den Basistest aus; deshalb wurden die weiteren Skripte ausdrücklich separat ausgeführt.

| Prüfung | Ergebnis |
| --- | --- |
| `npm test` und alle 26 `scripts/test-*.mjs` | Bestanden; abschließend auf `1d91a50` wiederholt. |
| Python-Unittests `test_*.py` | 47 Tests bestanden. |
| `validate-data.py` | 940 Arten gegen gepinnte Taxonomie, Namen, offizielle Codes und ursprünglichen Bestand validiert. |
| `build-scientific-names.py --check` | Reproduktion der 940 Erklärungen in DE/EN/NL bestanden. |
| `build-ebd-seasonal.py --check` | 144 exakt zugeordnete EBD-Regionen; ein Rückfall ohne historische Stichprobe. |
| `check-private-ebd.py` | Keine privaten Archive oder rohen EBD-Exporte im geprüften Index bzw. in `dist/`. |
| `validate-photos.mjs` | 940 Arten; 1.352 Fotos und acht historische Illustrationen einschließlich Metadaten/Hashprüfung bestanden. |
| Code-Audit | Die Funktion aus `audit-codes.py` wurde ohne den schreibenden CLI-Einstieg ausgeführt. Ergebnis stimmt exakt mit `docs/quick-code-audit.json` überein: 1.966 unterschiedliche Codes, 197 mehrdeutige Codes. |
| Modul-URLs und Syntax | Ein Versions-URL je lokalem Modul über 25 produktive Module/HTML-Einstieg; sämtliche `dist/*.js` syntaktisch gültig. |
| Unverändertheit | `git diff --exit-code -- dist data` und `git diff --check` bestanden. |

Die früheren Regressionen für große Runden, beschädigte Speicherstände, Kontextzähler/Termine und Abschlussmeldungen bestehen weiterhin. Die damaligen vollständigen Browser-/Dateidialogprüfungen wurden nicht sämtlich wiederholt; insbesondere bleibt B2 eine zusätzlich entdeckte Grenze außerhalb der bisherigen Schema-Rundreisetests.

### Browser und Integration

In-App-Browser auf separaten lokalen Origins an Port 48768 und 48769. Mobile Stichproben bei **390 × 844**, dunkle und helle Darstellung; außerdem normale Desktopansicht. Kein horizontaler Überlauf in den gemessenen Ansichten. Die bewusste Warnung des Saison-Fehlerprüfstands ist von normalen Browsermeldungen getrennt zu betrachten.

| Ablauf | Status und Nachweis |
| --- | --- |
| EUBL-Suche und Codekollisionen | Bestanden: Amsel/Mönchsgrasmücke gleichberechtigt; Treffer mit Eingabetaste geöffnet, vollständige Karten und Herkunftsgruppen sichtbar. |
| Niederländische Suche | Bestanden: `Merel` führt zur Amsel mit erkennbarer niederländischer Trefferursache. |
| Herkunftserklärung | Bestanden in Stichprobe: Gattung/Artzusatz, Sprache und Quellenangaben bei Amsel; mobil lesbar. Keine vollständige fachliche Neubegutachtung aller Glossare. |
| Nachladen | Bestanden: 60 → 120 Suchtreffer; Fokus auf dem ersten neu hinzugekommenen Treffer (`data-hit-index=60`). |
| Suchbereich und Anzeige | Bestanden in Stichprobe: Länderfilter auf alle unterstützten Länder, Titel/Sortierung auf Niederländisch, Suche bleibt unabhängig von der Anzeigesprache. |
| CATE-Kollision | Bestanden: vier exakte Code-Treffer im Gesamtkatalog, zusätzlich zwei schwächere Namens-Treffer; wissenschaftliche, Beringungs- und namensbasierte Herkunft erkennbar. |
| Wissenschaftlicher Code im Lernen | Bestanden: niederländische Fragen → Codes, Texteingabe, drei Einführungen; alle akzeptierten Codes erscheinen in getrennten Herkunftsfarben. |
| Falsche Antwort | Bestanden: `TUME` bei Oeverpieper wird als falsch bewertet; „Deine Antwort wäre: Merel“ zeigt die Bedeutung in der Fragesprache. |
| Pause / Sprachwechsel / Wiederaufnahme | Bestanden: DE → EN erhält die bewertete Frage, 1/3 beantwortete Rundenfragen und einen Zusatzversuch; keine Doppelbewertung. Die Herkunftserklärung bleibt entsprechend der niederländischen Frage auf Niederländisch. |
| Vorzeitiger Abschluss und Statistik | Bestanden: 2 offene Rundenfragen plus 1 Zusatzversuch korrekt genannt, keine widersprüchliche Erledigt-Meldung. Statistik zählt eine falsche Antwort, drei eingeführte Codeziele und zwei sofort fällige eingeführte Ziele. |
| Saisondatei mit fremdem Fingerabdruck | Befund B1: Warnung und tatsächliche Auswahl widersprechen sich. |
| Fehlende optionale Herkunftsdatei | Bestanden: gezieltes 404 für `scientific-names.json`; normale Namenssuche funktioniert, Herkunftsbereiche fehlen, App bleibt nutzbar. |
| Große Backup-Rundreise | Befund B2 durch Produktfunktionen und echte Exportserialisierung plus Prüfung des Datei-Annahmepfads nachgewiesen. Keine große Datei über den Browserdialog importiert. |

Die neue Mehrdeutigkeitsdarstellung wurde auf Struktur, Herkunftszuordnung und sichere Ausgabe geprüft. Farbkontraste wurden visuell betrachtet, aber nicht vollständig numerisch gegen alle Zustände/Gradienten vermessen. Physische Smartphone-Tastaturen und tatsächliche Screenreader-Ausgabe bleiben offen.

### Veröffentlichung und Sicherheit

- Während der Prüfung liefen weitere Veröffentlichungen der Beschriftungsänderungen. Der anfänglich abweichende HTML-/App-Stand war deshalb keine bestätigte Bereitstellungsstörung.
- Abschließend war [Pages-Lauf 42472793717](https://github.com/dg1tal/birdnamesde/actions/runs/42472793717) für `1d91a50` erfolgreich. Öffentlich ausgelieferte `index.html` und `app.js` stimmen per SHA-256 mit dem abschließenden Checkout überein. Zusätzlich wurden `style.css`, `logic.js`, `lookup-search.js`, `scientific-names.js`, `species.json`, `scientific-names.json` und `photos.json` geprüft und stimmen überein.
- Öffentliche Regions- und Meldungsdateien enthalten jeweils 145 Regionen. Die Schemaprüfung/Fingerabdrücke passen zum Katalog; 791 aktuelle Meldungseinträge wurden mit den produktiven Datums-/Gültigkeitsregeln geprüft. Snapshot-Zeitstände: Regionslisten 7. November 2026, 11:10:57 UTC; Meldungen 11:13:25 UTC. Keine API-Aktualisierung wurde durch diese Prüfung ausgelöst.
- Das verlängerte Pages-Deployment-Limit beträgt 15 Minuten innerhalb des 20-Minuten-Jobs. Die letzten geprüften Veröffentlichungen waren erfolgreich; kein aktueller Fehler nachgewiesen.
- Bestehende CSP, lokale Daten-/Bildpfade und SHA-gepinnte Actions bleiben erhalten. Neue Suchtreffer, Codehinweise, falsche Antworten und Herkunftstexte werden escaped ausgegeben; Quell-URLs der Herkunftsdaten werden auf HTTPS geprüft. Die vorhandenen Tests mit schädlichen Zeichenfolgen bestehen. Kein neuer ausführbarer Injektionspfad in diesem begrenzten Review nachgewiesen.
- Kein erneuter vollständiger Secret-Scan der Git-Historie, Penetrationstest, Rechtsgutachten oder vollständige unabhängige Prüfung aller etymologischen Aussagen. Die damalige Sicherheitsprüfung wurde nicht als aktuelle erneute Vollprüfung ausgegeben.

## Empfohlene Reihenfolge

1. **B1:** Abgelehnte Saisondaten dürfen nicht veröffentlicht werden; den realen Lade-/Fallbackpfad absichern.
2. **B2:** Eigene gültige Sicherungen müssen in der tatsächlich erzeugten Dateigröße wieder importierbar sein; Export und Import gemeinsam testen.
3. **B3:** Sichtbare Codenamen als Suchinformation ergänzen, ohne die gepinnte Taxonomie oder Lernantworten umzudefinieren.
4. Integrationstests um die beiden Lade-/Dateigrenzen ergänzen. Quellen- und Renderingtests bleiben nützlich, ersetzen aber weder Dateiannahme noch Zustandsveröffentlichung.

## Reproduktionsauszüge

### B2: Gültige Sicherung größer als das Importlimit

Im kanonischen Checkout ausführen; schreibt keine App-Dateien und keinen Browser-Lernstand:

```sh
node --input-type=module <<'JS'
import fs from 'node:fs';
import {gradeRecord} from './dist/learning-model.js';
import {inspectBackup} from './dist/backup.js';
const birds=JSON.parse(fs.readFileSync('dist/species.json')).species
  .filter(b=>b.de&&b.en);
let record;
for(const [source,method] of [
  ['de','text'],['de','flash'],['de','think'],['nl','text']
]) for(let n=0;n<20;n++) record=gradeRecord(record,source,method,{
  correct:true, now:1794130000000+n*1000,
  gradeId:'00000000-0000-4000-8000-000000000000:'+n
});
const records=Object.fromEntries(birds.map(b=>[b.id+':en',record]));
const backup={app:'BirdNames DE',version:2,records};
console.log(Buffer.byteLength(JSON.stringify(backup,null,2))); // 6239282
console.log(inspectBackup(backup,new Set(birds.map(b=>b.id))).count); // 939
JS
```

### B3: Auf Karten sichtbare Codebezeichnungen suchen

```sh
node --input-type=module <<'JS'
import fs from 'node:fs';
import {searchLookup} from './dist/lookup-search.js';
const birds=JSON.parse(fs.readFileSync('dist/species.json')).species;
for(const bird of birds.filter(b=>b.scientificCodeName!==b.sci)) {
  const found=searchLookup(birds,bird.scientificCodeName)
    .some(hit=>hit.species.id===bird.id);
  console.log(bird.id,bird.scientificCodeName,found);
}
// Elf Fälle, davon zehn false.
JS
```
