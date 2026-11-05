# Qualitätskontrolle BirdNames DE · 5. November 2026

## Nachtrag: Behebung F1–F3

Die nachfolgende Bestandsaufnahme beschreibt weiterhin den ursprünglichen Commit
`8fd1c9d`. F1–F3 wurden anschließend behoben; F4, W1 und W2 bleiben außerhalb dieses
Änderungspakets offen.

- **F1:** Gemeinsame, aus Kataloggröße und `RULES.maxRetries` abgeleitete Rundengrenzen
  ersetzen 1.878. Eine feste Regression erzeugt 1.750 Ausgangsfragen, erweitert sie
  auf 1.879 Einträge und stellt sowohl v1 als auch v2 einschließlich Feedback und
  weiterer Bewertung wieder her. Maximale 5.640 Einträge und Überschreitungen sind
  zusätzlich geprüft.
- **F2:** Das Laden validiert vor Migration/Schreiben und endet kontrolliert bei
  Fehlern oder nach zehn Sekunden. Späte Rückrufe bleiben wirkungslos. Beschädigte
  Lernwerte, unbekannte lokale Einträge und nicht wiederherstellbare Sitzungen
  führen in eine geschützte DE/EN-Ansicht. Originaldaten werden nicht überschrieben;
  Nachschlagen bleibt nutzbar. Eine Rettungsdatei ist separat gekennzeichnet und vom
  normalen Backup-Import ausgeschlossen. Nur erfolgreiches explizites Ersetzen
  hebt die Sperre auf.
- **F3:** Gemeinsame Validierung prüft sichere ganzzahlige Zähler, ihre Beziehungen
  und darstellbare Termine in aktuellen, methodenspezifischen und historischen
  Lernwerten. Optionale Altfelder und das Importverhalten für unbekannte Ziele
  bleiben kompatibel; Datenbank- und Backupversion ändern sich nicht.

**Nachweise:** Neue Suite `scripts/test-learning-recovery.mjs`, vollständige
bestehende Node-Suite, 46 Python-Tests, Daten-/Medienvalidierung,
EBD-Reproduzierbarkeit und JavaScript-Syntaxprüfung bestanden. Lokal Node 26.8.1
und Python 3.14.7; Python 3.15 wird zusätzlich durch den Pages-Workflow geprüft.

**Browser:** Isolierter Prüfstand auf Port 48765, keine persönlichen Lernwerte.
Beschädigter Originaleintrag blieb beim Start, Sprachwechsel, Vorschau und einem
absichtlich abgebrochenen Ersetzen erhalten. Echte Rettungsdatei heruntergeladen
und Dateimarker/Originaleintrag auf dem Dateisystem geprüft. Erfolgreiches Ersetzen
aus einer v1-Sicherung blieb nach Reload erhalten. Eine Runde mit 1.879 Einträgen
und 257 Bewertungen wurde einschließlich Feedback geladen; Pause → Reload →
Fortsetzen bewahrte die Zähler, eine weitere richtige Codeantwort erhöhte die
beantworteten Rundenfragen von 129 auf 130. Englische Wiederherstellungsansicht und
Fehlermeldung bei 390 × 844 ohne horizontalen Überlauf; Fokus auf dem Importstatus.
Die Wiederherstellungsansicht wurde auch auf Deutsch geprüft. Nachschlagen nach
Code EUBB funktionierte trotz beschädigter Lernwerte, keine erfassten
Console-Warnungen/-Fehler. Blockiertes Öffnen und Timeout/späte Rückrufe sind durch
Ereignisadapter geprüft, nicht durch einen künstlich blockierten realen Browser.
Physische Mobilgeräte und tatsächliche Screenreader-Ausgabe bleiben ungeprüft.

## Ergebnis und Prüfstand

Geprüfter Checkout: `8fd1c9dc39fa5d528af8e4da05e60f3f31b8215c` in `/Users/thumax/git/birdnamesde`.

Die vorhandenen automatisierten Prüfungen bestehen vollständig. Auch die geprüften zentralen Browserabläufe funktionieren. Die gezielte Untersuchung der Übergänge zwischen Katalogerweiterung, gespeicherten Runden und Lernmodell ergibt dennoch **einen P1-, zwei P2- und einen P3-Funktionsbefund**. Dazu kommen **zwei P3-Wartungsbefunde**. Die wichtigsten Lücken betreffen die Wiederherstellung großer Runden, Fehler beim Laden beschädigter Speicherstände und die Validierung importierter Kontextdaten.

Diese Prüfung verändert keine App-Dateien oder Datensätze und veröffentlicht nichts. Die bereits vorhandene unversionierte `docs/security-review-20261029.md` wurde gelesen und unverändert belassen. Bestehender persönlicher Lernstand auf der veröffentlichten Website wurde nicht verwendet oder verändert. Browserprüfungen liefen mit gesonderten Testdaten auf lokalen Origins an Port 48763 und 48764. Temporäre Prüfserver verwendeten ausschließlich den kanonischen Checkout; der historische Checkout wurde nicht verwendet. Ein zusätzlich angelegter Tab an Port 8765 zeigte eine andere Anwendung und wurde für diese Prüfung nicht verwendet.

Prioritäten: P1 = Verlust von Rundenzustand oder blockierte Kernfunktion bei gültiger Verwendung; P2 = relevante Funktions-/Robustheitslücke unter den jeweils genannten Voraussetzungen; P3 = begrenzte Darstellungs- oder Wartungsprobleme. Die Reihenfolge innerhalb einer Priorität richtet sich nach Auswirkung und Eintrittsvoraussetzungen.

## Bestätigte Funktionsbefunde

### F1 · P1 · Große gültige Runden werden beim Wiederherstellen verworfen

**Ort:** `dist/study-state.js:7`, `dist/learning-settings.js:42`, Startinitialisierung am Ende von `dist/app.js`.

**Ablauf:** Eigene Runde mit vielen Arten, Namen und Codes → zusätzliche Fehlerwiederholungen → Pause/Neuladen.

**Nachweis:** `validateLesson()` lehnt jede Warteschlange über 1.878 Einträge ab. Die Grenze ist unabhängig vom aktuellen Katalog und von den bis zu zwei Zusatzversuchen je Rundenfrage. Der aktuelle GB-Gesamtkatalog erlaubt 875 Arten bzw. 1.750 Fragen für wissenschaftlicher Name → Englisch und Code. Bei 129 falschen Erstversuchen und jeweils richtigen Zusatzversuchen wächst die Warteschlange nach 257 bewerteten Antworten auf 1.879 Einträge. Die unveränderten Produktfunktionen erzeugen diesen Zustand selbst; `validateLesson()` liefert dann `null`, und `restoreLessonState()` liefert keine Sitzung mehr. Reproduktion steht unten.

**Auswirkung:** Eine zulässige laufende Runde kann nach Neuladen nicht fortgesetzt werden. Bereits bewertete Antworten bleiben in den Lernwerten erhalten; verloren geht der Rundenzustand einschließlich offener Fragen. Der anschließende bedingungslose Start-Speichervorgang kann die verworfene Sitzung zusätzlich durch `null` ersetzen. Das ist kein Nachweis eines Verlusts sämtlicher Lernwerte.

**Behebung:** Eine gemeinsame, vom zulässigen Fragenbestand und Zusatzversuchslimit abgeleitete Größenregel für Erzeugung und Wiederherstellung verwenden. Alte gültige große Runden berücksichtigen. Ungültige Sitzungen beim Start nicht still überschreiben; Wiederherstellungsprobleme sichtbar und diagnostizierbar machen.

**Fehlende Regression:** Größte unterstützte gemischte Runde mit allen erlaubten Zusatzversuchen; Serialisierung/Wiederherstellung vor und nach dem Überschreiten von 1.878; anschließend regulär weiter beantworten. Zusätzlich prüfen, dass eine abgelehnte Sitzung nicht beim Start unwiederbringlich überschrieben wird.

### F2 · P2 · Beschädigte Lernwerte können den App-Start dauerhaft anhalten

**Ort:** `dist/app.js:193–199`, `dist/learning-model.js:6`.

**Voraussetzung:** Beschädigter oder unerwartet geformter IndexedDB-Wert, beispielsweise `records = {"eurbla:en": null}`. Dieser Zustand wurde als Fehlerfall simuliert; er wurde nicht im persönlichen Datenbestand beobachtet und wird durch den geprüften normalen Backup-Import abgewiesen.

**Nachweis:** Der unveränderte `initDB()`-Funktionskörper wurde aus dem Quelltext in einem isolierten Node-VM-Kontext ausgeführt. Ein kleiner IndexedDB-Ereignisadapter liefert den obigen Wert und ruft die originalen Erfolgsrückrufe auf. Im `tx.oncomplete` wirft `migrateRecords()` den Fehler `Cannot read properties of null (reading 'contexts')`. Die zurückgegebene Initialisierungs-Promise bleibt offen, anstatt aufzulösen oder abzulehnen. Der äußere `try/catch` um `await initDB()` fängt einen späteren Ereignisfehler nicht auf.

**Auswirkung:** Die anschließende Routeninitialisierung wird nicht erreicht. Statt eines erklärten Speicherfehlers mit Wiederherstellungsmöglichkeit bleibt die Anwendung im Startzustand hängen. Das Verhalten ist durch den Ereignisadapter nachgewiesen, nicht durch absichtliche Beschädigung eines echten Browser-Datenbestands.

**Behebung:** Gespeicherte Lernwerte vor der Migration validieren; Fehler innerhalb sämtlicher IndexedDB-Rückrufe an die Initialisierungs-Promise weiterreichen. Einen ausdrücklich behandelten Wiederherstellungszustand anbieten, der die Originaldaten erhält. Auch fehlgeschlagene/abgebrochene Lesetransaktionen und blockiertes Öffnen behandeln.

**Fehlende Regression:** Null-/Array-/Skalarwerte, ungültige Einträge, Transaktionsabbruch und blockiertes Öffnen. Jede Initialisierung muss kontrolliert abschließen oder einen sichtbaren Wiederherstellungszustand erreichen. Keine automatische Leerüberschreibung beschädigter Originaldaten.

### F3 · P2 · Backup-Prüfung lässt beschädigte Kontextzähler und nicht darstellbare Termine zu

**Ort:** `dist/logic.js:9`, `dist/backup.js:4`, `dist/learning-model.js:15–20` und `scheduleText()`.

**Nachweis:** Ein mit `gradeRecord()` erzeugter gültiger v2-Datensatz wird nur innerhalb von `contexts['de:recall']` verändert: `lessonFirstAttempts = 'oops'`. `inspectBackup()` akzeptiert die Datei. Bei der nächsten Bewertung wird daraus durch Addition die Zeichenfolge `oops1`. Die strenge Prüfung der entsprechenden äußeren Antwortzähler wird auf die Kontextzähler nicht angewendet. Ebenso wird `due = 1e308` als endliche positive Zahl akzeptiert, obwohl daraus kein gültiges JavaScript-Datum entsteht; `scheduleText()` gab im lokalen Node-Lauf `Nächste planmäßige Wiederholung: Invalid Date.` aus.

**Auswirkung:** Eine als geprüft bezeichnete Sicherung kann beschädigte methodenspezifische Lernwerte enthalten und weiterführen. Ein nicht darstellbarer Termin kann ein Ziel faktisch dauerhaft von fälligen Wiederholungen ausschließen. Kein Nachweis von HTML-/Skriptausführung und kein Nachweis, dass reguläre Exporte solche Werte erzeugen.

**Behebung:** Die tatsächlich verwendeten Kontextfelder und ihre Zählerbeziehungen ebenso prüfen wie die äußeren Felder. Zeitwerte auf darstellbare Datumswerte beschränken. Optionale ältere Felder weiterhin kompatibel behandeln; bei vorhandenen ungültigen Feldern den Import vor jeder Speicherung mit verständlicher Meldung ablehnen.

**Fehlende Regression:** Zeichenfolgen, Objekte, negative und widersprüchliche Kontextzähler; gültige und ungültige Datumsgrenzen; Export → Import → weitere Bewertung → erneuter Export. Vorhandener Stand und pausierte Sitzungen müssen bei Ablehnung erhalten bleiben.

### F4 · P3 · Vorzeitig beendete Tagesrunde wird zugleich als erledigt bezeichnet

**Ort:** `dist/app.js`, `showSummary()` (`dayDone` und Abschlussmeldung).

**Browsernachweis:** Eine Tagesrunde im Karteikartenmodus mit drei Fragen starten; eine beantworten; über „Finish“ beenden. Die englische Zusammenfassung zeigt gleichzeitig `Finished early. Remaining: 2 round questions · 0 extra attempts.` und `Daily round complete.`. Entsprechend erneut im Erkennungsmodus beobachtet. Nach Rückkehr zu den Einstellungen werden die noch fehlenden Erstabfragen weiterhin angeboten.

**Ursache/Auswirkung:** `dayDone` berücksichtigt fällige bzw. nächste terminierte Wiederholungen, aber nicht die offenen Rundenfragen oder noch ausstehenden Erstabfragen mit der Methode. Die Abschlussmeldung ist dadurch widersprüchlich und kann den Eindruck erwecken, alle Tagesaufgaben seien erledigt. Die offenen Lernmöglichkeiten selbst verschwinden nicht.

**Behebung:** Die positive Erledigt-Meldung nur anzeigen, wenn die für sie maßgeblichen Aufgaben tatsächlich abgeschlossen sind; vorzeitigen Abschluss ausdrücklich davon unterscheiden.

**Fehlende Regression:** Vorzeitiger Abschluss vor der ersten, nach einer und nach allen Fragen, einschließlich noch ausstehender Methoden-Erstabfragen und Zusatzversuche; DE/EN.

## Bestätigte Wartungsbefunde

### W1 · P3 · Nicht verwendete Warteschlangenlogik wird weiterhin importiert und getestet

**Ort:** `dist/hybrid-learning.js:60–69`, Import in `dist/app.js:6`, `scripts/test-hybrid-learning.mjs:24–28`.

`hybridQueue()` implementiert einen eigenen Anteil aktueller Ergänzungen an einer Runde, wird aber im App-Code ausschließlich importiert und nicht aufgerufen. Die aktuelle Auswahl läuft über `dailyQueue()` bzw. `practiceQueue()`. Die Tests des alten Fünftel-Anteils können deshalb grün bleiben, ohne eine entsprechende Produkteigenschaft abzusichern. Die README beschreibt bereits korrekt, dass die Tagesrunde keinen festen Anteil reserviert.

**Behebung:** Nach Bestätigung der beabsichtigten aktuellen Auswahl die ungenutzte Funktion, den Import und die nicht mehr produktrelevanten Anteiltests entfernen. Tests für die tatsächlichen Wege ergänzen: Auswahl → Warteschlange → aktuelles Ziel wird eingeführt. Keine historische Histogramm-Aufbereitung allein wegen ihres Alters entfernen; sie ist als Reproduktionswerkzeug dokumentiert.

### W2 · P3 · Dasselbe Modul wird unter zwei Versionskennungen geladen

**Ort:** `dist/app.js:6`, `dist/study-state.js:3`.

`hybrid-learning.js` wird einmal mit `?v=20261105-requiredregion1` und einmal mit `?v=20261105-ebd1` importiert. Unterschiedliche Modul-URLs erzeugen getrennte Moduleinträge und können getrennt im Browsercache liegen. Ein inkonsistenter Live-Datenstand wurde in dieser Prüfung nicht nachgewiesen; das aktuelle Modul enthält überwiegend reine Funktionen. Die Abweichung ist dennoch ein konkretes Risiko bei künftigen Änderungen und zeigt, dass Versionskennungen nicht einheitlich gepflegt werden.

**Behebung:** Alle Referenzen eines Moduls pro Veröffentlichung konsistent halten und einen einfachen Prüfmechanismus für widersprüchliche lokale Modul-URLs ergänzen. Ein größerer Build-Umbau ist dafür nicht Voraussetzung.

## Ausgeführte Prüfungen und Ergebnisse

### Automatisierte Grundlage

Lokal: Node.js **26.8.1**, Python **3.14.7**. Die dokumentierte CI-Linie ist Node 26 / Python 3.15. Python 3.15 ist lokal nicht installiert; die lokale Prüfung ersetzt deshalb keine erneute CI-Ausführung unter 3.15. Der aktuelle bestehende Pages-Lauf auf dem geprüften Commit war erfolgreich; es wurde kein neuer Lauf ausgelöst. Im Protokoll des vorangegangenen Laufs ist Python 3.15.2 sichtbar.

| Prüfung | Ergebnis / Grenze |
| --- | --- |
| `npm test` | Bestanden; führt nur `scripts/test.mjs` aus. |
| Alle 21 `scripts/test-*.mjs` | Bestanden, zusätzlich zum Basistest. |
| `python3 -m unittest discover -s scripts -p 'test_*.py'` | 46 Tests bestanden unter Python 3.14.7. |
| `python3 scripts/validate-data.py` | 940 Arten gegen gepinnte Taxonomie, offizielle Namen/Codes und ursprünglichen Bestand validiert. |
| `python3 scripts/build-ebd-seasonal.py --check` | 144 exakt zugeordnete EBD-Regionen; ein regionaler Rückfall ohne historische Stichprobe. |
| `python3 scripts/check-private-ebd.py` | Keine privaten Archive oder rohen EBD-Exporte im Git-Index bzw. in `dist/`. |
| `node scripts/validate-photos.mjs` | 940 Arten mit Medien; 1.352 Fotos und acht historische Illustrationen; lokale Hashes, Metadaten und Quellenprüfung bestanden. |
| `node --check` für sämtliche `dist/*.js` | Bestanden. |
| `git diff --exit-code -- dist data` und `git diff --check` | Bestanden; App und Daten unverändert. |
| Zusätzliche gezielte Reproduktionen | F1–F3 nachgewiesen, obwohl bestehende Tests grün sind. |

Die Datenprüfung belegt strukturelle und dokumentierte Quellenkonsistenz, keine unabhängige fachliche Neubewertung aller 940 Taxa. 939 Arten haben einen deutschen Hauptnamen, alle 940 einen englischen und wissenschaftlichen Namen sowie mindestens einen offiziellen Code. Fehlende Namen sind ein unterstützter Zustand; die Sprachpaarprüfung schließt sie vom jeweiligen Lernpaar aus.

### Browser- und Integrationsprüfung

Verwendet wurde der In-App-Browser. DE und EN, heller und dunkler Modus, visuelle Stichproben bei 390 × 844 und 1280 × 900; zusätzlich Messung einer Lernansicht bei 360 × 800. Keine pauschale Aussage über jede Kombination dieser Größen und Modi. Bei den gemessenen Ansichten kein horizontaler Seitenüberlauf. Auf dem regulären Prüfstand keine erfassten Console-Warnungen oder -Fehler.

| Prüfbereich | Status | Konkreter Nachweis / Grenze |
| --- | --- | --- |
| Nachschlagen, Namen, Codes, Bilder | Bestanden in Stichprobe | Suche „Amsel“ findet auch Pirol über Goldamsel und Wasseramsel; Hauptcode EUBB und akzeptierte Alternativen sichtbar. Bilddialog öffnet, Escape schließt und Fokus kehrt zum auslösenden Bildbutton zurück. Vollständige Katalogkarten zusätzlich durch vorhandene Tests geprüft. |
| Tagesrunde mit Texteingabe | Bestanden | Drei Einführungen; Hinweis und Entwurf; Pause → Reload → DE/EN-Wechsel → Fortsetzen erhält Frage, Entwurf und Hinweis. Zwei richtige Erstversuche von drei, zwei Zusatzversuche, ein unterstützter Erfolg in Zusammenfassung korrekt. |
| Karteikarten | Befund vorhanden | Aufdecken, Fokus auf Antwort, Selbsteinschätzung und Bewertung funktionieren; vorzeitige Abschlussmeldung siehe F4. |
| Erst überlegen / direktes Multiple Choice | Befund vorhanden | Optionen sind zunächst verborgen bzw. sofort sichtbar; Fokus auf erster Option; richtige Auswahl wird bewertet; beide teilen methodengemäß Erkennungsnachweise. Vorzeitiger Abschluss siehe F4. |
| Eigene Runde / Weiterlernen | Bestanden in Stichprobe | Eigene Runde Deutsch → Niederländisch für NL startet mit zehn Fragen; Pause und vorzeitiger Abschluss funktionieren. Direktes Weiterlernen startet eine weitere Runde trotz ausgeschöpftem Tagesbudget. |
| Leere Auswahl / Länderwechsel | Bestanden in Stichprobe | DE → NL, Antwortsprache Niederländisch; alle Häufigkeitsgruppen abgewählt: null Arten, Start gesperrt, Wiederherstellungsaktion angeboten. Häufig + Mittel wiederhergestellt: 150 Arten. Fällig-Filter ohne passende Ziele erklärt und verhindert leeren Start. |
| Statistik | Bestanden in Stichprobe | Nach acht Testantworten 88 % insgesamt; 5/6 richtige Erstversuche und zwei Zusatzversuche. Sichere/fällige Nachweise nutzen die gewählte Methode. Gesamtquoten schließen laut UI historische Antworten und andere Methoden ein. Keine vollständige Browserprüfung aller Sprachrichtungen. |
| Backup-Rundreise | Bestanden regulär; F3 für fehlerhafte Daten | Echter Download mit datiertem Dateinamen; Datei erneut ausgewählt; Vorschau zeigt drei Ziele für drei Arten, ohne den Stand zu ändern. Explizites Ersetzen erfolgreich, Zähler erhalten. Export zusätzlich mit `inspectBackup()` geprüft. Keine persönlichen Daten verwendet. |
| Fehlerhafte Backups | Befund vorhanden | Bestehende Tests prüfen ungültiges JSON-Schema, Fremdformat und unbekannte/teilweise unterstützte bzw. leere Daten; eigene Node-Proben ergänzen F3. Das 5-MB-Dateilimit und die Behandlung syntaktisch ungültigen JSONs wurden zusätzlich im Quelltext geprüft. Nicht jede Ablehnung wurde über den Browser-Dateidialog wiederholt. |
| Ausgefallene Bilder | Bestanden | Separater lokaler Server liefert gezielt 404 für Bilddateien; sichtbarer „Bild derzeit nicht verfügbar“-Text und eBird-Galerielink bei Amsel, Pirol und Wasseramsel. |
| Fehlende Regionsliste | Bestanden | Gezieltes 404 für `regions.json`: verfügbare saisonale Deutschland-Auswahl mit 145 Arten bleibt nutzbar. Fehlende/ungenügende Saison und abgelaufene Meldungen zusätzlich in den bestehenden Funktionstests abgedeckt. |
| Fehlende niederländische Sprachdatei | Bestanden | Gezieltes 404 für `languages/nl.json`: Niederländisch wird in den Lernoptionen als nicht verfügbar markiert und deaktiviert; übrige App startet. |
| Fehlende Kerndaten | Bestanden als Fehleranzeige | Gezieltes 404 für `species.json`: verständliche Ladefehlermeldung mit Aufforderung zum Neuladen. |
| Alte Einstellungen/Runden | Bestanden in vorhandenen Tests; F1 beachten | Tests für v1/v2-Runden, beide alten Oberflächenspeicherstände, Migrationshinweis, beibehaltene Regionen, gelöschte Sitzungen, keine Doppelbewertung. Große Runden waren dabei nicht abgedeckt. |
| Fehlende/defekte Speicherung | Teilweise geprüft; F2 | Schreibfehler, fehlende/geschlossene Datenbank, Quota und synchroner Fehler durch vorhandenen Transaktionsadapter geprüft. Leseinitialisierung mit beschädigtem Eintrag zusätzlich simuliert. Kein echter Browser-Quota-/Privatmodusversuch. |
| Zugänglichkeit | Teilweise geprüft | Sichtbarer Fokus bei Eingabe, Feedback, Aufdecken und Optionen; Dialog-Escape/Fokusrückkehr; vorhandene Tests für Ankündigungen und aktive Ansichten. Keine vollständige Tastaturbegehung aller Steuerelemente, keine gemessene Vollprüfung aller Kontraste, keine tatsächliche Screenreader-Ausgabe. |

### Veröffentlichung, Sicherheit und Dokumentation

- [Pages-Lauf 42099308390](https://github.com/dg1tal/birdnamesde/actions/runs/42099308390) ist erfolgreich und gehört zum geprüften Commit. Öffentlich ausgelieferte `index.html`, `app.js` und `species.json` stimmen im SHA-256-Vergleich exakt mit dem Checkout überein. Das beweist diese Dateien, nicht automatisch jeden ausgelieferten Assetinhalt.
- Der [vorangegangene Lauf 42099020266](https://github.com/dg1tal/birdnamesde/actions/runs/42099020266) scheiterte nach bestandenen Prüfungen beim Pages-Deployment: wiederholt `updating_pages`, anschließend Timeout. Der nachfolgende Erfolg und Dateivergleich zeigen keinen aktuell offenen Veröffentlichungsfehler. Keine erneute Veröffentlichung ausgelöst.
- Öffentlich abrufbare Regions- und Meldungsdateien enthalten jeweils 145 Regionen. Zeitstände: Regionslisten 5. November 2026, 14:22:05 UTC; aktuelle Meldungsdatei 14:24:34 UTC. Beide tragen den aktuellen Katalogfingerabdruck; Schema und Datengültigkeit wurden zusätzlich mit den Produktvalidatoren geprüft. Der lokale getrackte leere Meldungs-Bootstrap ist erwartetes Verhalten, kein fehlender Live-Datensatz.
- Pages veröffentlicht ausschließlich `dist/`. Die beiden Workflows referenzieren Actions mit vollständigen Commit-SHAs. Secrets werden nur in den Python-Abrufen verwendet; der Browser lädt lokale statische Dateien und externe eBird-Seiten nur als Links. Quelltextprüfung der Ausgabe-Escapes, Importvorschau, CSP und erlaubten Foto-URLs ergab keinen demonstrierten Skriptinjektionspfad.
- Alle 1.360 Mediennachweise verwenden für `source` und `licenseUrl` HTTPS. Die Sicherheitsprüfung vom 29. Oktober nennt noch HTTP-Lizenzlinks, fehlende CSP und ungepinnte Actions. Diese Punkte sind inzwischen durch HTTPS, eine CSP im HTML und SHA-Pinning überholt; der datierte Altbericht bleibt historisch korrekt und wurde nicht umgeschrieben. Die gleiche-Origin-Grenze von GitHub-Projektseiten besteht weiterhin als dokumentierte Hosting-Eigenschaft.
- README und aktuelle Hilfetexte unterscheiden Gesamtkatalog, nationale Statusangaben, regionale Meldehäufigkeit, historische Saisonstichprobe und aktuelle Meldungen. Die Histogramm-Aufbereitung und frühere Datenimporte sind als historische Reproduktionswege dokumentiert. Keine pauschale Entfernung alter Dateien empfohlen.
- Kein neuer vollständiger Secret-Scan der gesamten Git-Historie, Penetrationstest oder Rechts-/Lizenzgutachten. Die damaligen Scannergebnisse wurden nicht als aktuelle erneute Prüfung ausgegeben.

## Testlücken und empfohlene Reihenfolge

1. **F1 zuerst:** Die App muss ihre eigenen gültigen großen Runden nach Serialisierung wiederherstellen können. Den realen GB-Gesamtkatalog und Zusatzversuche in eine Regression einbeziehen.
2. **F2 anschließend:** Datenbanklesen und Migration müssen Fehler kontrolliert beenden und Originaldaten schützen. Die bisherigen guten Tests für atomare Schreibvorgänge decken diese Startphase nicht ab.
3. **F3 danach:** Einheitliche Validierung der gespeicherten und importierten Lernwerte; Rundreise mit weiterer Bewertung testen. Dabei bestehende v1/v2-Kompatibilität sichern.
4. **F4 sowie W1/W2:** Abschlussaussagen berichtigen, überholte Warteschlangenlogik bereinigen und Modulversionen konsistent halten.
5. **Browserregressionen automatisieren:** Wenige durchgehende Abläufe für Erststart, Pause/Reload/Sprachwechsel, Feedback ohne Doppelbewertung, Abschluss und Export/Import. Vorhandene Funktions- und Quellenprüfungen behalten, aber nicht als Ersatz für diese Abläufe werten. Insbesondere `test-lookup-settings.mjs` extrahiert Renderingfunktionen anhand von Quelltextgrenzen; mehrere andere Tests prüfen HTML-/Quelltextfragmente. Das prüft weder alle Event-Verbindungen noch das Zusammenspiel mit echtem IndexedDB.
6. **Offene Prüflimits schließen:** Physische iOS-/Android-Tastatur, echte Screenreader-Ausgabe und gemessene Kontraste der geladenen App. Für größere Datenmengen zusätzlich eine Performance-Messung auf schwächerem Mobilgerät. Keine dieser Eigenschaften wird aufgrund der hier bestandenen Geometrie- oder Stringtests als vollständig geprüft bezeichnet.

## Reproduktionsauszüge ohne Änderung der App

Diese historischen Auszüge beziehen sich ausschließlich auf den ursprünglich geprüften Commit `8fd1c9d` im kanonischen Checkout. Sie dokumentieren den damaligen Fehlerzustand und dürfen nach der Behebung nicht unverändert als Tests ausgeführt werden. Für den aktuellen Stand stattdessen `node scripts/test-learning-recovery.mjs` verwenden.

### F1: Produktfunktionen erzeugen eine später abgelehnte Runde

```sh
node --input-type=module <<'JS'
import fs from 'node:fs';
import {validateLesson, recordLessonAnswer} from './dist/study-state.js';
import {restoreLessonState} from './dist/learning-settings.js';
const birds = JSON.parse(fs.readFileSync('dist/species.json')).species;
const ids = new Set(birds.map(s => s.id));
const gb = new Set(JSON.parse(fs.readFileSync('dist/regions.json'))
  .regions.find(r => r.code === 'GB').all.ids);
const queue = birds.filter(s => gb.has(s.id)).flatMap(s =>
  [{id:s.id,t:'en',retry:0}, {id:s.id,t:'code',retry:0}]);
const x = {version:2,queue,index:0,method:'text',sourceLanguage:'sci',
  nameLanguage:'en',answered:0,correct:0,firstAnswered:0,firstCorrect:0,
  done:false,paused:true,hint:false};
console.log('Startfragen', queue.length);
let wrong = 0;
while (validateLesson(x, ids)) {
  const correct = x.queue[x.index].retry > 0;
  recordLessonAnswer(x, correct);
  if (!correct) wrong++;
  if (!validateLesson(x, ids)) break;
  x.index++; x.done = false;
}
console.log({wrong,answers:x.answered,queue:x.queue.length,
  restored:!!restoreLessonState({version:1,session:x,pending:[]},
    null,null,false,ids).session});
// Startfragen 1750; wrong 129; answers 257; queue 1879; restored false.
JS
```

`dist/regions.json` ist eine lokal vorhandene, nicht getrackte öffentliche Momentaufnahme. Für eine spätere Regression die GB-Mitgliedschaft aus einer festen geprüften Testquelle beziehen, damit tägliche Datenänderungen die erwarteten Zahlen nicht verändern.

### F2: Ausnahme im Original-Rückruf lässt Initialisierung offen

```sh
node --input-type=module <<'JS'
import fs from 'node:fs';
import vm from 'node:vm';
import {migrateRecords} from './dist/learning-model.js';
const source = fs.readFileSync('dist/app.js','utf8');
const code = source.slice(source.indexOf('async function initDB()'),
  source.indexOf('\nasync function save('));
const req = {}; let tx, callbackError;
const context = vm.createContext({indexedDB:{open:()=>req},
  db:null,records:{},daily:null,session:null,pendingLessons:[],
  migrateRecords,birds:[],english:false,
  restoreLessonState:()=>({session:null,pending:[]}),
  sessionStorage:{getItem:()=>null,removeItem:()=>{}}});
vm.runInContext(code,context);
const promise = context.initDB();
req.result = {transaction:()=>tx={objectStore:()=>({get:key=>({
  result:key==='records'?{'eurbla:en':null}:null})})}};
req.onsuccess();
try { tx.oncomplete(); } catch (error) { callbackError=error.message; }
const state = await Promise.race([
  promise.then(()=>'resolved',()=>'rejected'),
  new Promise(resolve=>setTimeout(()=>resolve('pending'),10))]);
console.log({callbackError,promise:state});
// callbackError: Cannot read properties of null (reading 'contexts')
// promise: pending
JS
```

### F3: Beschädigter Kontext besteht die Backup-Prüfung

```sh
node --input-type=module <<'JS'
import {gradeRecord, scheduleText} from './dist/learning-model.js';
import {inspectBackup} from './dist/backup.js';
const r = gradeRecord(undefined,'de','text',
  {correct:true,now:100000000,gradeId:'a'});
r.contexts['de:recall'].lessonFirstAttempts = 'oops';
r.contexts['de:recall'].due = 1e308;
const p = inspectBackup({app:'BirdNames DE',version:2,
  records:{'eurbla:en':r}},new Set(['eurbla'])).records['eurbla:en'];
console.log(gradeRecord(p,'de','text',
  {correct:true,now:200000000,gradeId:'b'})
  .contexts['de:recall'].lessonFirstAttempts); // oops1
console.log(scheduleText(p.contexts['de:recall'])); // enthält Invalid Date
JS
```
