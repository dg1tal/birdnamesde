# Usability Review BirdNames DE

Die Befunde wurden anschließend umgesetzt; siehe [Umsetzung und Abnahme](usability-implementation-20261108.md). Die folgenden Beobachtungen beschreiben den ursprünglichen Prüfstand.

Review vom 8. November 2026 für Mobilgeräte und Desktop. Geprüfter Checkout: `f6cbc4f06fcc35097bedf6ac56d64d24a06a7395`.

BirdNames DE bietet funktionierende zentrale Such- und Lernwege. Die größte Usability-Hürde ist inzwischen die Menge und Reihenfolge der Informationen: Eine einfache Änderung der Lernmethode führt mobil durch eine lange Konfiguration; Einführung und Feedback zeigen viel Wissen neben dem eigentlichen Lernziel. Hinzu kommt eine überraschende Kopplung: Das Betrachten anderer Statistikwerte verändert die Einstellungen für künftige Lernrunden.

Das Review enthält **neun priorisierte Befunde: fünf P2 und vier P3**. In den durchgespielten Aufgaben wurde keine P1-Blockade nachgewiesen. Priorität haben die mobile Lernvorbereitung, die Nebenwirkungen der Statistikfilter und verständliches Feedback nach einem Hinweis.

Die App und ihre Daten wurden nicht verändert. Bericht und Screenshots bleiben lokal; es wurde weder ein Commit noch eine Veröffentlichung ausgelöst. Die bereits vorhandene unversionierte Datei `docs/security-review-20261029.md` blieb unberührt.

## Prüfgrundlage und Grenzen

Die Prüfung kombiniert aufgabenbezogene Browserdurchläufe, visuelle Kontrolle, Accessibility-Baum und gezielte Quelltextprüfung. Sie ist eine Expertenbewertung, kein Test mit echten Nutzern. Beobachtetes Verhalten ist unten von vermuteten Auswirkungen auf Nutzer getrennt. Es wurden keine Erfolgsquoten, Nutzerzeiten oder tatsächlichen Abbruchraten gemessen.

| Bereich | Prüfung |
| --- | --- |
| Mobil | 390 × 844 CSS-Pixel als Hauptgröße; zusätzlich 320 × 568 für schmale Ansichten und Bilddialog |
| Desktop | 1440 × 900; ergänzend 1280 × 720 für die Suche auf einem Laptop |
| Browser | ChatGPT In-App-Browser; Größen über Viewport-Vorgaben, keine physischen Mobilgeräte |
| Darstellung | Dunkle Darstellung für Einstieg und erste Lernrunde; helle Darstellung insbesondere für Suche, Filter und kleine Ansichten |
| Sprache | Deutsch als Hauptprüfung; Englisch für pausierte Runde, Texteingabe-Feedback, vorzeitigen Abschluss und Karteikarten |
| Zustände | Zwei separate lokale Ursprünge mit zunächst leerem Speicher, anschließend selbst erzeugten Testantworten und pausierten Runden |
| Live-Abgleich | Veröffentlichte Website zu Beginn geöffnet und Suchansicht geprüft; dort keine Lernantworten oder Einstellungen verändert |
| Datenstand | Lokaler unveränderter Checkout; lokale Regionsdaten zeigten den 5. November, die veröffentlichte Suche den 8. November. Hinweise auf fehlende frische Ergänzungen im lokalen Test belegen keinen Ausfall der Live-Aktualisierung. |

Die Hauptprüfung lief gegen `dist/` aus dem kanonischen Checkout über einen lokalen statischen Server. Persönliche Live-Lernwerte wurden nicht verwendet. Ein Export der selbst erzeugten drei Lernziele wurde heruntergeladen und anschließend im regulären Dateiauswahlprozess zur Importvorschau geöffnet. Die Vorschau wurde abgebrochen; der endgültige Austausch und das Zurücksetzen wurden nicht ausgeführt.

Nicht abgedeckt sind physische Bildschirmtastaturen, VoiceOver/TalkBack-Ausgabe, mehrere Browser-Engines, tatsächlicher Browserzoom/Textvergrößerung, Betriebssystem-Hochkontrastmodus und Netzwerkausfälle. Die Prüfung ersetzt keinen vollständigen Barrierefreiheits- oder Kontrastaudit. Mehrtägige Bestätigungsserien wurden nicht im Browser durchlaufen; eine nach Ablauf der kurzen Fehlerfrist fällige Wiederholung war während der Sitzung sichtbar.

## Geprüfte Nutzeraufgaben

| Nutzeraufgabe | Nachweis und Ergebnis |
| --- | --- |
| Beim ersten Besuch orientieren | Mobil frische Suche; am Desktop frische Lernvorbereitung und leerer Lernstand. Drei Hauptbereiche sind klar benannt. Die Suche beginnt mit einer umfangreichen alphabetischen Liste. |
| Namen nachschlagen | Blaumeise, Pimpelmees und Cyanistes caeruleus führen zum passenden Vogel; die Treffer zeigen die passende Namenssprache. Mobil Details geöffnet, am Desktop Suchbereich und Anzeige geprüft. |
| Mehrdeutige Codes verstehen | EUBL liefert Amsel und Mönchsgrasmücke mit Hinweisen auf die Mehrdeutigkeit. |
| Eine erfolglose Suche korrigieren | Blaumeise mit Filter Entenvögel: gezielte Entfernung angeboten. Blaumiese ohne Zusatzfilter: kein Treffer; unter Deutschland wird pauschal auf Filter verwiesen. |
| Mit dem Lernen beginnen | Mobil vollständige Tagesrunde mit drei Einführungen, zwei richtigen Erstversuchen, einem „Weiß ich nicht“ und erfolgreichem Zusatzversuch abgeschlossen. |
| Lernmethode und Auswahl ändern | Gemeinsame Einstellungen geöffnet, Methoden gewechselt, Code-Lernziel gewählt und Region Berlin eingestellt; regionale Auswahl aktualisiert sich. |
| Verschiedene Antwortformen bedienen | „Erst überlegen“ mobil vollständig durchgespielt; Texteingabe am Desktop mit Hinweis und Enter geprüft; Karteikarten am Desktop aufgedeckt und bewertet; direkte Multiple-Choice-Auswahl für Codes mobil geprüft. |
| Unterbrechen und zurückkehren | Pausieren → Reload → Fortsetzen erhält Antwortfeedback und Rundenzähler. Sprachwechsel erhält die pausierte Runde. |
| Vorzeitig beenden | Am Desktop eine Texteingabe-Runde nach einer Antwort beendet. Offene Fragen werden in der Zusammenfassung ausgewiesen; die bewertete Antwort bleibt erhalten. |
| Fortschritt verstehen | Mobil Statistik nach erster Runde; Desktop leerer und vorhandener Lernstand. Antwortsprache und Nachweismethode gewechselt und Auswirkungen auf neue Lerneinstellungen geprüft. |
| Fortschritt sichern | Download erfolgreich; Auswahl derselben Testsicherung zeigt Datum, drei Lernziele, aktuellen Umfang und Ersetzen-Warnung; Abbrechen lässt den Stand bestehen. |
| Mit Tastatur bedienen | Enter bewertet Texteingabe und Karteikarte; Inhalts-Sprung fokussiert die Suche. Bilddialog öffnet mit Fokus auf Schließen; Escape schließt ihn und gibt den Fokus an die Bildschaltfläche zurück. |

Die Aufgaben wurden je nach Schwerpunkt auf den genannten Größen geprüft. Das bedeutet insbesondere keine vollständige Wiederholung jeder Kombination aus Sprache, Größe, Methode und Speicherzustand.

## Prioritäten und Übersicht

**P1** bedeutet eine schwere Blockade oder Verlust im üblichen Kernablauf. **P2** bezeichnet eine relevante Hürde oder überraschendes Verhalten bei einer wichtigen Aufgabe. **P3** bezeichnet begrenzte Reibung oder eine verbesserungswürdige Rückmeldung. Die Einstufungen sind Produktprioritäten dieser Expertenbewertung, keine formalen Konformitätsstufen.

Der Aufwand ist relativ geschätzt: **S** für begrenzte Text-/Zustandsänderungen, **M** für Änderungen an Aufbau oder Interaktionen mit mehreren betroffenen Zuständen. Es sind keine verbindlichen Zeitschätzungen.

| ID | Priorität | Befund | Schwerpunkt | Aufwand |
| --- | --- | --- | --- | --- |
| U01 | P2 | Einfache Lerneinstellungen liegen hinter einer sehr langen Konfiguration | Mobil | M |
| U02 | P2 | Statistikfilter verändern zugleich die nächste Lernrunde | Beide | M |
| U03 | P2 | Hinweisfolgen fehlen im unmittelbaren Antwortfeedback | Beide | S |
| U04 | P2 | Zusatzwissen überlagert das gewählte Lernziel | Mobil, auch Desktop | M |
| U05 | P2 | Von einer nachgeschlagenen Art führt kein direkter Weg zum Üben | Beide | M |
| U06 | P3 | Statistik priorisiert Kennzahlen und Erklärungen vor Orientierung und Handlung | Mobil | M |
| U07 | P3 | Der Fortschrittsbalken ist bei offenen Zusatzversuchen bereits voll | Beide | S |
| U08 | P3 | Tippfehler erhalten unter Standardfiltern eine unpassende Hilfestellung | Beide | S bis M |
| U09 | P3 | Vorzeitiges Abschließen entfernt die fortsetzbare Runde ohne Rückweg | Beide | S bis M |

## U01 Lange Wege zu einfachen Lerneinstellungen

**Beobachtung:** Bei frischem Zustand und 390 × 844 Pixeln ist die eingeklappte Lernvorbereitung überschaubar. Nach „Einstellungen ändern“ umfasst die Seite jedoch rund 4.127 Pixel. „Einstellungen ändern“ steht bei Dokumentposition y = 408, die Antwortmethode bei y = 3.102 und „Tagesrunde starten“ bei y = 3.703. Die Messung betrifft die reguläre Konfiguration ohne zusätzlich aufgeklappte Artenlisten. Der Startknopf rückt damit auf mehr als vier Bildschirmhöhen unter den Seitenanfang.

**Reproduktion:** Frisch Lernen öffnen → Einstellungen ändern → nur von „Erst überlegen“ zu „Texteingabe“ wechseln wollen. Vor der Antwortmethode liegen Sprachen, Region, regionale Vergleichstabelle, Häufigkeitsstufen, Datenhinweise und Artengruppen. Die Ansicht am Desktop nutzt den Platz besser, behält aber dieselbe Reihenfolge.

**Erwartete Auswirkung:** Wer lediglich Methode oder Bilder ändern will, muss viele fachliche Auswahlmöglichkeiten passieren. Die naheliegende Folge ist zusätzlicher Such- und Scrollaufwand; ein tatsächlicher Abbruch wurde nicht gemessen.

**Vorschlag:** Sprache, Methode und Bilder unmittelbar zusammen anbieten. Region und Artenauswahl als gesonderte, zunächst kompakte Einstellungen behandeln. Eine kurze Zusammenfassung und eine klar erreichbare Startaktion sollen während der Vorbereitung Orientierung geben. Die vorhandenen Voreinstellungen und Vorschauen erhalten.

**Abnahme:** Auf 390 × 844 ist die Antwortmethode nach Öffnen der einfachen Einstellungen ohne Durchqueren der regionalen Datenvorschau erreichbar. Nach einer Änderung sind aktive Auswahl und Startaktion leicht auffindbar. Erweiterte Einstellungen bleiben per Tastatur vollständig bedienbar.

**Belege:** [Mobile Konfiguration](usability-review-20261108/27-mobile-expanded-settings.jpg), [kompakter Einstieg](usability-review-20261108/03-mobile-learning-start.jpg), [Desktopvorbereitung](usability-review-20261108/26-desktop-learning-start.jpg). Aufbau in `dist/app.js`, Funktion `learn()`.

## U02 Statistikbetrachtung ändert Lerneinstellungen

**Beobachtung:** „Antwortname“ und „Methode des Nachweises“ wirken in der Statistik wie Auswahlfelder zum Betrachten vorhandener Ergebnisse. Ihre Änderungen schreiben zugleich die gemeinsamen Lerneinstellungen. Ein Wechsel von Englisch/Selbsteinschätzung zu Niederländisch/Freier Abruf führt in der Vorbereitung neuer Runden zu „Deutsch → Niederländisch · Texteingabe“. Eine bestehende pausierte Englisch-Runde bleibt richtigerweise unverändert.

**Reproduktion:** In einer Englisch-Runde Karteikarten verwenden → pausieren → Statistik → Antwortname Niederländisch → Methode Freier Abruf → Lernen → Neue Einheit vorbereiten. Die neue Lernrichtung und Methode sind übernommen, obwohl nur Statistikwerte ausgewählt wurden.

**Erwartete Auswirkung:** Das Nachsehen anderer Ergebnisse kann unbeabsichtigt den nächsten Lernablauf ändern. Bei paralleler pausierter Runde werden zusätzlich zwei verschiedene Kontexte sichtbar. Die fachlich korrekte Trennung der Lernstände ist für Nutzer dadurch schwerer vorherzusagen.

**Vorschlag:** Statistikfilter als eigene Ansichtseinstellungen speichern. Eine ausdrückliche Aktion „Mit dieser Lernrichtung üben“ kann den betrachteten Kontext in die Lernvorbereitung übernehmen. Falls die Kopplung beibehalten wird, muss sie vor der Änderung deutlich benannt und die Übernahme sichtbar bestätigt werden.

**Abnahme:** Reines Betrachten von Niederländisch/Freier Abruf verändert keine zuvor eingestellte Englisch-Karteikartenrunde. Eine ausdrückliche Übernahme zeigt den neuen Kontext vor dem Start; pausierte Runden bleiben erhalten.

**Beleg:** [Pausierte Runde und veränderte Vorbereitung](usability-review-20261108/29-mobile-stats-change-settings.jpg). Quelltext bestätigt die Schreibwirkung in `dist/app.js:793` und `dist/app.js:794`.

## U03 Richtige Antwort mit Hinweis bleibt im Feedback unerklärt

**Beobachtung:** In der Texteingabe zeigt „Hinweis“ für Fischadler „Beginnt mit O“. Nach Osprey und Enter erscheint „✓ Richtig.“; gleichzeitig steigt die Zahl offener Zusatzversuche. Der Zusatz „Mit Unterstützung beantwortet“ und die Folgen für den Wiederholungstermin stehen erst in „Warum sehe ich diesen Vogel?“. In der Zusammenfassung wird die unterstützte Antwort gesondert gezählt.

**Reproduktion:** Texteingabe starten → bei Fischadler Hinweis anfordern → Osprey eingeben → Enter → sichtbares Feedback und offene Fragen vergleichen. Die ausgewählte Frage stand vor weiteren Rundenfragen, sodass ein Zusatzversuch möglich war.

**Erwartete Auswirkung:** Eine richtige Antwort und eine neue offene Aufgabe können widersprüchlich wirken. Zudem lässt der Knopf „Hinweis“ unmittelbar nicht erkennen, wie sich seine Nutzung auf den Lernnachweis auswirkt. Die Lernregel ist dokumentiert, wird aber im entscheidenden Moment nicht erklärt.

**Vorschlag:** Direkt „Richtig mit Hinweis“ anzeigen und knapp ergänzen, dass die Frage später noch einmal kommt. Bei der Hinweisaktion die Folge für die Bestätigung kurz zugänglich machen. Zeitplan und genaue Lernregeln können in der ausführlichen Erklärung bleiben.

**Abnahme:** Vor und nach der Hinweisnutzung ist verständlich, dass die Antwort unterstützt war. Ein hinzugefügter Zusatzversuch wird unmittelbar begründet, auch in der fokussierten Rückmeldung für assistive Bedienung.

**Beleg:** [Feedback nach Hinweis](usability-review-20261108/16-desktop-hint-feedback.jpg). `dist/app.js:778` baut die unmittelbare Rückmeldung auf; die Unterstützung wird im aufgeklappten Lernhinweis ergänzt.

## U04 Zusatzwissen überlagert das Lernziel

**Beobachtung:** Beim Ziel „englische Vogelnamen“ zeigen Einführung und Antwortfeedback zusätzlich wissenschaftlichen Namen, mehrere farbige Codes, Kollisionshinweise, Namensherkunft und eBird-Link. In der Einführung zur Mönchsgrasmücke stehen vier auffällige Codefelder neben dem einen eigentlich zu lernenden Namen. Im mobilen Antwortfeedback beginnen die Bilder bei 844 Pixel Höhe erst nahe dem unteren Rand beziehungsweise unter der festen Weiter-Leiste. Die Folge sind lange Karten; am Desktop trat das auch bei aufgedeckten Karteikarten hervor.

**Reproduktion:** Mit den Voreinstellungen englische Namen lernen → Einführung und richtige Antwort zur Mönchsgrasmücke ansehen. Alternativ eine Karteikarte aufdecken. Die Zusatzinformationen erscheinen auch bei reinem Namenlernen, ohne gesondert angefordert zu werden.

**Erwartete Auswirkung:** Gerade beim Einstieg ist weniger klar, was man sich tatsächlich merken soll. Die Codes erhalten starke visuelle Aufmerksamkeit, während die Bilder und die Erklärung des Lernfortschritts weiter unten stehen. Ob dadurch die Gedächtnisleistung sinkt, wurde nicht untersucht.

**Vorschlag:** Die erste Ebene auf Frage, gesuchten Namen beziehungsweise Code, notwendige Namensvarianten und die gewählte Bildhilfe konzentrieren. Andere Codes, Herkunft und externe Details unter einer verständlichen Zusatzaktion bündeln. Beim Code-Lernziel müssen dessen gültige Varianten weiterhin unmittelbar sichtbar bleiben. Bildnachweise bleiben zugänglich und korrekt zugeordnet.

**Abnahme:** Die erste mobile Bildschirmansicht zeigt eindeutig das gewählte Lernziel. Wer ausschließlich englische Namen lernt, muss keine Codeinformationen lesen, um Einführung und Feedback zu verstehen. Zusatzwissen ist weiterhin erreichbar, verdeckt aber weder Antwort noch Bedienaktionen.

**Belege:** [Mobile Einführung](usability-review-20261108/05-mobile-introduction.jpg), [mobiles Feedback](usability-review-20261108/07-mobile-feedback.jpg), [Desktopkarteikarte](usability-review-20261108/18-desktop-flashcard-en.jpg). Gemeinsame Ausgabe in `studyDetailsMarkup()` und den Einführungs-/Feedbackansichten von `dist/app.js`.

## U05 Kein direkter Übergang vom Nachschlagen zum Üben

**Beobachtung:** Die geöffnete Blaumeise zeigt Namen, Codes, Namensherkunft und eBird-Link. Eine Aktion zum Üben dieser Art fehlt. Die Navigation „Lernen“ öffnet die allgemeine Artenauswahl; die gesuchte Blaumeise wird dabei nicht als Lernwunsch übernommen. Gezieltes Üben einzelner Arten ist an anderer Stelle, etwa bei häufig falsch beantworteten Arten in der Statistik, bereits vorhanden.

**Reproduktion:** Blaumeise suchen → Artendetails öffnen → diese konkrete Übersetzung üben wollen. Über „Lernen“ landet man in der allgemeinen Vorbereitung beziehungsweise bei einer pausierten Runde.

**Erwartete Auswirkung:** Zwei Hauptzwecke der App sind nur über die Navigation verbunden. Ein naheliegender Lernimpuls nach einer erfolgreichen Suche lässt sich nicht direkt umsetzen. Das ist eine aus der Aufgabe abgeleitete Produktlücke, kein nachgewiesener Fehler der Suchfunktion.

**Vorschlag:** In den Details eine Aktion „Diese Art üben“ oder „Diesen Namen üben“ anbieten. Vor dem Start Richtung und Methode kurz bestätigen lassen beziehungsweise sichtbar aus den aktuellen Einstellungen übernehmen. Bei pausierter Runde eine klare Wahl anbieten, ohne diese still zu verwerfen. Ein eigener Mechanismus zum Merken von Arten wäre eine spätere Erweiterung und ist für den ersten Schritt nicht erforderlich.

**Abnahme:** Von der gefundenen Blaumeise lässt sich mit klar erkennbarer Lernrichtung eine gezielte Übung erreichen. Es wird erkennbar, ob freiwilliges Üben gestartet wird; die Tagesrunde und ihre Einführungslimits werden nicht irreführend bezeichnet.

**Beleg:** [Geöffnete Suchdetails](usability-review-20261108/02-mobile-lookup.jpg). Suchkarten und Suchtreffer in `dist/app.js`, unter anderem `lookupHitList()`.

## U06 Statistik erschwert die Einordnung der ersten Lernerfolge

**Beobachtung:** Nach der ersten Runde zeigt die Statistik „3 Arten begonnen“, aber jeweils null sichere Namen, sichere Codes und fällige Wiederholungen. Auf dem Handy folgen zunächst Speicherhinweis und Sicherungsaktion. Die Definition von „sicher“, die nächsten Lernaktionen und die Erfolgsquote liegen weiter unten. Auch eine komplett leere Statistik beginnt mit Auswahlfeldern und vier Nullwerten.

**Reproduktion:** Eine erste Runde abschließen → Fortschritt ansehen, mobil bei 390 × 844. Zusätzlich frischen Lernstand am Desktop öffnen. Im ersten mobilen Bildschirm ist die Frage „Was habe ich erreicht und was mache ich als Nächstes?“ nur teilweise beantwortet.

**Erwartete Auswirkung:** Null sichere Ziele können wie fehlender Fortschritt wirken, obwohl das Lernmodell korrekt mehrere zeitversetzte Wiederholungen fordert. Der Speicherhinweis ist wichtig, verdrängt aber die Orientierung über die nächste sinnvolle Handlung.

**Vorschlag:** Eine kurze Einordnung voranstellen, etwa „3 Arten begonnen. Sicher werden sie nach mehreren Wiederholungen an späteren Tagen.“ Die konkrete nächste Aktion und, soweit bekannt, die nächste anstehende Wiederholung früh sichtbar machen. Im leeren Zustand direkt zum ersten Lernen führen. Sicherung weiterhin gut auffindbar halten.

**Abnahme:** Ein Erstnutzer kann ohne Lesen der ausführlichen Lernregeln erkennen, dass die erste Runde gespeichert wurde und warum „sicher“ noch null ist. Die nächste sinnvolle Aktion ist auf Mobilgeräten früh sichtbar.

**Belege:** [Statistik nach erster Runde](usability-review-20261108/11-mobile-statistics.jpg), [leere Desktopstatistik](usability-review-20261108/25-desktop-empty-statistics.jpg).

## U07 Voller Balken bei offenen Zusatzversuchen

**Beobachtung:** Nach drei beantworteten Rundenfragen und einem Fehler zeigt die Wiederholung einen vollen Fortschrittsbalken. Darüber stehen korrekt „3 von 3 beantwortet“ und „0 Rundenfragen · 1 Zusatzversuch“ offen. Die zugängliche Balkenbeschreibung bezieht sich ausdrücklich auf Erstversuche; die visuelle Darstellung benötigt diese Erklärung ebenfalls.

**Reproduktion:** In einer Runde mit drei Fragen die zweite mit „Weiß ich nicht“ beantworten → dritte beantworten → zum Zusatzversuch wechseln.

**Erwartete Auswirkung:** Der volle Balken vermittelt visuell Abschluss, während noch eine Frage zu bearbeiten ist. Der vorhandene Text verhindert eine falsche fachliche Aussage, verlangt aber eine genaue Interpretation zweier Zähler.

**Vorschlag:** Hauptfragen und Zusatzversuche als zwei erkennbare Phasen darstellen oder dem vollen Balken deutlich „Hauptfragen fertig – noch 1 Wiederholung“ zuordnen. Bereits erledigten Fortschritt beim Hinzukommen weiterer Versuche nicht überraschend zurücksetzen.

**Abnahme:** Bei offenen Zusatzversuchen vermittelt die Darstellung ohne Detaillektüre, dass die Einheit weiterläuft. Visuelle und zugängliche Beschreibung stimmen überein.

**Beleg:** [Offener Zusatzversuch bei vollem Balken](usability-review-20261108/09-mobile-retry-progress.jpg).

## U08 Tippfehler führen zur falschen Problemdiagnose

**Beobachtung:** „Blaumiese“ liefert keinen Treffer. Mit der voreingestellten Deutschland-Liste und ohne Artengruppenfilter lautet die Hilfe „Aktive Filter schränken die Suche ein. Entferne einen Filter oder setze die Suche zurück.“ Nach Wahl aller unterstützten Länder erscheint stattdessen „Versuche einen kürzeren Namen oder einen anderen Code“. Es gibt für dieses Beispiel keinen Korrekturvorschlag. Die richtige Schreibweise Blaumeise wird in beiden Suchbereichen gefunden.

**Reproduktion:** Frische Suche mit Deutschland → Blaumiese eingeben. Danach ausschließlich den Suchbereich auf alle unterstützten Länder erweitern. Das Wort bleibt falsch; nur der Hilfetext ändert sich.

**Erwartete Auswirkung:** Nutzer können den falschen Schritt wählen und Suchbereich oder Eingabe verwerfen, obwohl eine Schreibkorrektur hilft. Ein Regionsfilter ist zwar aktiv, wurde aber nicht als tatsächliche Ursache für den fehlenden Treffer ermittelt.

**Vorschlag:** Zwischen „im gesamten Katalog nicht gefunden“ und „außerhalb deiner Filter vorhanden“ unterscheiden. Zuerst die Schreibweise beziehungsweise kürzere Eingabe empfehlen, wenn auch katalogweit nichts passt. Optional klar bezeichnete ähnliche Namen anbieten; diese dürfen nicht als exakte Treffer oder automatisch gültige Lernantworten gelten.

**Abnahme:** Blaumiese unter Deutschland führt zu einer passenden Schreib-/Suchhilfe. Blaumeise mit Entenvögel bietet weiterhin gezieltes Entfernen des tatsächlich störenden Filters. Die Suche wird bei Korrektur nicht unnötig gelöscht.

**Belege:** [Tippfehler unter Standardauswahl](usability-review-20261108/30-mobile-typo-default-country.jpg), [Tippfehler ohne Länderfilter](usability-review-20261108/21-desktop-typo.jpg), [echter Filterkonflikt](usability-review-20261108/20-desktop-zero-results.jpg). Der pauschale Test auf `state.group || state.region` steht in `dist/app.js:394`.

## U09 Vorzeitiges Abschließen hat keinen Rückweg zur Runde

**Beobachtung:** „Abschließen“ beziehungsweise „Finish“ beendet die aktive Runde sofort. Im geprüften Beispiel waren erst eine von drei Fragen beantwortet und ein Zusatzversuch offen. Danach erklärt die Zusammenfassung korrekt den vorzeitigen Abschluss und erhält bewertete Antworten. Eine Rückkehr zu genau dieser offenen Runde wird nicht angeboten.

**Reproduktion:** Laufende Texteingabe-Runde nach der ersten Antwort über Finish beenden → Zusammenfassung → Lernvorbereitung. Die zuvor offene Einheit ist nicht mehr als pausierte Runde verfügbar. Pausieren hätte sie hingegen erhalten.

**Erwartete Auswirkung:** Die benachbarten Aktionen „Pausieren“ und „Abschließen“ haben unterschiedlich weitreichende Folgen. „Abschließen“ kann als normale Rückkehr oder positives Fertigstellen verstanden werden. Ein Fehlklick kostet die Fortsetzung der Zusammenstellung, auch wenn kein bewerteter Lernfortschritt verloren geht.

**Vorschlag:** Bei offenen Fragen „Runde vorzeitig beenden“ benennen. Eine kurze Rückgängig-Aktion mit Wiederherstellung der offenen Runde wäre einem zusätzlichen Bestätigungsdialog im alltäglichen Ablauf vorzuziehen. Die Begriffe Runde, Einheit und Sitzung konsistent führen.

**Abnahme:** Vor dem Auslösen ist erkennbar, dass offene Fragen beendet werden. Ein versehentliches Beenden lässt sich unmittelbar korrigieren, ohne Antworten doppelt zu bewerten. Normales Abschließen einer vollständig bearbeiteten Runde bleibt direkt möglich.

**Beleg:** [Vorzeitig beendete englische Runde](usability-review-20261108/17-desktop-finished-early-en.jpg). `endLesson()` in `dist/app.js` entfernt die aktive Runde und öffnet die Zusammenfassung.

## Was erhalten bleiben sollte

- **Klare Hauptnavigation:** Nachschlagen, Lernen und Statistik sind auf kleinen und großen Ansichten direkt erreichbar. Der konzentrierte Übungsmodus reduziert die übrige Navigation.
- **Gute Trefferzuordnung:** Pimpelmees und der wissenschaftliche Name führen zur Blaumeise und zeigen, warum der Treffer passt. Mehrdeutige Codes werden nicht als eindeutig ausgegeben.
- **Gezielte Fehlerbehebung bei Filtern:** Blaumeise mit Entenvögel bietet „Artengruppe entfernen“ an. Diese präzise Korrektur ist besser als ein pauschaler Neustart und sollte zum Maßstab für weitere Leerzustände werden.
- **Verlässliche Unterbrechung im Test:** Pausieren, Neuladen, Fortsetzen und Oberflächensprachwechsel erhalten die geprüfte Runde und ihr Feedback.
- **Sorgfältige Sicherungsvorschau:** Vor dem Ersetzen sind Umfang, Datum, aktueller Stand und vollständiger Austausch klar erkennbar. Die Dateiauswahl allein verändert den Lernstand nicht.
- **Bedienbare kleine Ansichten:** In den geprüften Such-, Feedback- und Dialogzuständen bei 320 Pixel Breite wurde kein horizontaler Seitenüberlauf festgestellt. Der Bilddialog bleibt scrollbar und per Escape bedienbar.
- **Nützliche Tastatur- und Fokusführung:** Inhalts-Sprung zur Suche, Enter bei Texteingabe und Karteikarte sowie Fokusrückgabe nach dem Bilddialog funktionieren in den geprüften Abläufen.
- **Erklärte Grenzen des Lernmodells:** Die Lernhilfe unterscheidet Prinzipien aus Forschung von den konkreten App-Festlegungen. Die unterschiedlichen Methodenstände werden nicht fälschlich zusammengezählt.

Die deutsche Namensherkunft innerhalb der englischen Oberfläche mit deutscher Fragesprache wurde nicht als Übersetzungsfehler gewertet: `explanationLanguage()` richtet diese Erklärung ausdrücklich nach der Fragesprache aus. Ob diese Entscheidung für Nutzer erwartbar ist, wäre eine geeignete Frage im Nutzertest.

## Empfohlene Reihenfolge der Verbesserungen

1. **Lernkontext vorhersehbar machen:** U02 und U03 zuerst bearbeiten. Beide betreffen überraschende Folgen einer scheinbar einfachen Aktion. Die Effekte lassen sich in klaren Vorher-/Nachher-Aufgaben prüfen.
2. **Mobile Lernvorbereitung und Lernkarten vereinfachen:** U01 und U04 zusammen gestalten. Die kompakte Grundeinstellung und die Konzentration auf das gewählte Ziel sollten durch den gesamten Lernweg konsistent sein.
3. **Suche mit Lernen verbinden:** U05 als kleinen gezielten Lernweg ergänzen. Verhalten bei pausierter Runde und freiwilligem Üben ausdrücklich festlegen.
4. **Orientierung und Korrektur verbessern:** U06 bis U09 bearbeiten, insbesondere Fortschrittsanzeige und Fehlersuche. U08 lässt sich bereits durch präzisere Rückmeldung verbessern, bevor eine Ähnlichkeitssuche hinzukommt.

Vor größeren Umbauten sollten kurze Nutzertests prüfen, ob diese Priorisierung trägt. Besonders U01, U04 und U06 enthalten Gestaltungsurteile, deren tatsächliche Wirkung von Vorkenntnissen und Nutzungsgewohnheiten abhängt.

## Aufgaben für anschließende Nutzertests

Fünf moderierte Sitzungen von jeweils etwa 25 bis 35 Minuten wären ein sinnvoller nächster Schritt. Ein Teil der Personen sollte wenig Vogelkunde mitbringen, ein anderer bereits Arten beobachten; mobile und Desktopnutzung sollten vorkommen. Die Sitzungen wurden für dieses Review nicht durchgeführt.

| Aufgabe ohne vorgegebene Navigation | Worauf achten |
| --- | --- |
| „Du hast den Namen Pimpelmees gelesen. Finde heraus, welcher Vogel gemeint ist.“ | Einstieg, Sprachsuche, Trefferverständnis |
| „Diesen Namen möchtest du dir merken. Übe ihn.“ | Übergang von Suche zu Lernen, U05 |
| „Du möchtest heute kurz englische Vogelnamen lernen und Antworten eintippen.“ | Start und Methodenwahl, U01 |
| „Wenn du nicht weiterweißt, nutze die angebotenen Hilfen.“ | Verständnis von Hinweis, richtiger Antwort und Zusatzversuch, U03/U07 |
| „Du musst unterbrechen. Mach später genau hier weiter.“ | Unterscheidung Pausieren/Beenden, Wiederaufnahme, U09 |
| „Finde heraus, was du schon kannst und was als Nächstes ansteht.“ | Bedeutung der Nullwerte, sichere Ziele, U06 |
| „Schau dir auch die niederländischen Ergebnisse an. Lerne danach wie vorher weiter.“ | Erwartung an Statistikfilter, U02 |
| „Du wechselst den Browser. Bereite deinen Lernstand dafür vor.“ | Finden der Sicherung, Verständnis des Speicherorts und der Importvorschau |

Pro Aufgabe Erfolg ohne Hilfe, erste falsche Abzweigung, benötigte Unterstützung und eine kurze Einschätzung der Schwierigkeit festhalten. Vor dem Start einer Runde nach erwarteter Sprache und Methode fragen; nach einer Hinweisantwort nach dem Grund der erneuten Frage. Beobachtungen von den Personen erklären lassen, ohne während der Aufgabe die Oberfläche zu erläutern.

## Technische Gegenprüfung und Dateien

Folgende vorhandene Prüfungen bestanden am unveränderten App-Stand:

```sh
npm test
node scripts/test-accessibility.mjs
node scripts/test-study-viewport.mjs
node scripts/test-learning-settings.mjs
node scripts/test-progress-copy.mjs
```

Diese Prüfungen stützen die vorhandenen Funktionen und Zustandsregeln. Insbesondere die Prüfungen zu Fokus und Viewport enthalten simulierte Umgebungen; sie sind keine Aussage über echte Screenreader-Ausgabe, physische Mobilgeräte oder eine bestandene vollständige Barrierefreiheitsprüfung. Für den reinen Review wurden keine neuen Tests oder App-Anpassungen angelegt.

Die Screenshots liegen unter [usability-review-20261108](usability-review-20261108/). Die bei den Befunden verlinkten Aufnahmen bilden die maßgeblichen Belege; weitere Aufnahmen dokumentieren Zwischenzustände. Die nummerierte Reihenfolge dient der Zuordnung und ist keine Messung von Bearbeitungszeiten. Vollseitenaufnahmen zeigen auch Inhalte außerhalb des ersten Bildschirms; die ersten mobilen Bildschirmansichten sind unter anderem in 01, 06, 09 und 28 als Viewport-Aufnahmen festgehalten.
