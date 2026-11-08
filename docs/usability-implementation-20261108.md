# Umsetzung des Usability Reviews

Die neun Befunde des [Reviews](usability-review-20261108.md) sind im Änderungspaket `20261108-usability1` umgesetzt. Die Abnahme umfasst die neue Merkliste einschließlich Sicherungsversion 3 und die bestehenden Such- und Lernabläufe. Taxonomie, Datenbestände und Lernintervalle bleiben unverändert.

## Änderungen und Nachweise

| Befund | Umsetzung | Abnahme |
| --- | --- | --- |
| U01 | Methode und Bilder gehören zu den Grundeinstellungen; Region und Artenauswahl stehen separat nach der Tagesrunde. | Methodenwechsel ohne Regionsvorschau. Bei 390 × 844 liegt die Methodenwahl nun bei rund 1.000 statt 3.100 Pixeln Dokumenthöhe; genaue Position hängt von Methode und Rundenzustand ab. |
| U02 | Statistik speichert einen eigenen Frage-/Antwort-/Methodenkontext. Nur ausdrückliche Übungsaktionen übernehmen ihn. | Niederländisch/Freier Abruf betrachtet, danach weiterhin Englisch/Erst überlegen in der Lernvorbereitung; tatsächlicher Startkontext zusätzlich automatisiert geprüft. |
| U03 | „Richtig mit Hinweis“, unmittelbare Erklärung der Unterstützung und eines hinzugefügten Zusatzversuchs. | Hinweisantwort mit zwei Hauptfragen erzeugt sichtbare Erklärung und nachfolgende Wiederholung. |
| U04 | Lernziel, akzeptierte Varianten, wissenschaftlicher Name und Bilder bleiben sichtbar; sonstige Details sind eingeklappt. | Einführungen, Texteingabe-Feedback und Karteikarten mit Fotos geprüft; alle akzeptierten Namensvarianten bleiben durch Regressionstests abgedeckt. |
| U05 | Arten aus Suchdetails und normalen Karten merken und über die Merkliste gemeinsam üben. | Zwei Arten gespeichert, nach Reload erhalten und gemeinsam geübt. Vorhandene pausierte Runde sperrt einen neuen Start. |
| U06 | Fortschrittseinordnung und nächste Aktion vor Kennzahlen; Definitionen aufklappbar; nächster vorhandener Wiederholungstermin sichtbar. | Leerer und vorhandener Lernstand sowie unabhängiger Statistik-Kontext geprüft. |
| U07 | Sichtbare Phase „Hauptfragen“ beziehungsweise „Hauptfragen fertig · Zusatzversuche“. | Zusatzversuch nach abgeschlossenen Hauptfragen zeigt ausdrücklich die noch offene Phase. |
| U08 | Katalogweite Gegenprüfung bei leerer Suche; Schreibfehler und Filterkonflikte erhalten unterschiedliche Hilfen. | Blaumiese empfiehlt Schreibkorrektur; Blaumeise mit Entenvögel bietet Erweitern an. Der Suchtext bleibt erhalten. |
| U09 | Offene Runde ausdrücklich vorzeitig beenden und auf der Zusammenfassung rückgängig machen. | Entwurf und bereits bewertetes Feedback wiederhergestellt. Produktionshandler mit zwei weiteren gespeicherten Runden und fehlgeschlagenem Schreiben getestet; keine Doppelbewertung. |

## Merkliste und Speicherkompatibilität

Die Merkliste liegt als `saved-species-v1` im bestehenden IndexedDB-Store. Die Datenbankversion bleibt 1. Schreibvorgänge speichern Liste, Lernwerte, Tagesbudget und Runden gemeinsam; fehlgeschlagene Transaktionen veröffentlichen keinen teilweise importierten Zustand.

Sicherungsversion 3 enthält `savedSpecies`. Versionen 1 und 2 bleiben lesbar und erhalten die vorhandene Merkliste. Die Vorschau erklärt die jeweilige Wirkung. Reine Merklistensicherungen ohne Lernwerte sind gültig. Unbekannte importierte Arten werden gemeldet und übersprungen; unbekannte bereits lokal gespeicherte IDs bleiben erhalten. Zurücksetzen der Lernwerte erhält die Merkliste.

Im Browser wurde ein Export mit Version 3, zwei gemerkten Arten und zwei Lernzielen heruntergeladen und sein Inhalt geprüft. Anschließend wurde eine separate reine Merklistensicherung über die reguläre Dateiauswahl geöffnet und erfolgreich wiederhergestellt. Die Vorschau zeigte den vollständigen Austausch der Merkliste und die Folgen für die vorhandenen Lernwerte und pausierte Runde. Alle Tests verwendeten eigens angelegte lokale Ursprünge und Testdaten; persönliche Live-Lernstände wurden nicht verändert.

## Prüfung

- `npm test` und alle `scripts/test-*.mjs`, einschließlich `test-usability.mjs`.
- 47 Python-Tests bestanden.
- Datenvalidierung, Namensprüfung, EBD-Reproduzierbarkeit, Ausschluss privater Rohdaten und Medienvalidierung bestanden.
- JavaScript-Syntax und konsistente Modulversionen geprüft.
- Browser: 390 × 844 und 320 × 568 mobil; 1440 × 900 und 1280 × 720 Desktop/Laptop. Deutsch/Englisch und heller/dunkler Modus wurden im Verlauf geprüft; nicht jede Kombination wurde vollständig wiederholt.
- Texteingabe mit Hinweis und Enter, Karteikarte mit Enter, direkte Antwortauswahl sowie „Erst überlegen“ mit anschließender Auswahl geprüft.
- Bilddialog öffnet mit Schließen-Fokus; Escape gibt den Fokus an die Bildschaltfläche zurück. Keine Browserfehler in den geprüften Abläufen, kein horizontaler Überlauf in den gemessenen schmalen Ansichten.

Der Browserzugang bietet Viewport-Steuerung, aber keine gezielte Textvergrößerung. Echte Browser-/Systemtextvergrößerung, Screenreader-Ausgabe, physische Bildschirmtastaturen und weitere Browser-Engines bleiben separat zu prüfen. Die vorhandenen Viewport- und Fokusregressionen ersetzen diese Prüfungen nicht.

## Belegbilder

- [Kompakte mobile Lernvorbereitung](usability-update-20261108/mobile-learning-ready.jpg)
- [Direkt erreichbare Grundeinstellungen](usability-update-20261108/mobile-basic-settings.jpg)
- [Gestraffte Einführung](usability-update-20261108/mobile-introduction.jpg)
- [Unmittelbares Hinweisfeedback](usability-update-20261108/mobile-hint-feedback.jpg)
- [Sichtbare Zusatzversuchsphase](usability-update-20261108/mobile-extra-phase.jpg)
- [Merkliste am Desktop](usability-update-20261108/desktop-saved-en.jpg)
- [Karteikarte am Desktop](usability-update-20261108/desktop-flashcard-en.jpg)
- [Vorschau einer reinen Merklistensicherung](usability-update-20261108/desktop-backup-v3-preview.jpg)
- [Antwortauswahl auf kleinem Smartphone](usability-update-20261108/small-mobile-choice-en.jpg)
- [Rückgängig auf kleinem Smartphone](usability-update-20261108/small-mobile-undo-en.jpg)
- [Schreibfehlerhilfe am Laptop](usability-update-20261108/laptop-typo-en.jpg)
