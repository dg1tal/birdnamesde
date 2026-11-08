# Katalogprüfung: Namen, Artidentität und Verweise

Stand: 8. November 2026. Geprüfter Checkout: `36d030b`. Ergänzung zum Qualitätsbericht vom 8. November; **keine Reparatur, Taxonomieumstellung oder Veröffentlichung**.

Nachtrag: Dieser Satz beschreibt den Untersuchungsstand vor der Behebung.
Im anschließenden Paket `20261108-quality1` werden ausschließlich die elf
verifizierten gleichbedeutenden Namen als Suchinformation ergänzt und erklärt.
Der Katalogstand und die Lernantworten bleiben 2025. Die drei Änderungen der
Artabgrenzung bleiben Entscheidungen für ein getrenntes Taxonomieupdate.

## Ergebnis und Ursprung der Verwirrung

Alle 940 Katalogarten wurden gegen die gespeicherte Taxonomie 2025 und die vollständige offizielle eBird-Arbeitsmappe 2026 abgeglichen. Die Prüfung berücksichtigt Artkategorie und Avibase-Taxonkonzept, nicht nur Namen und eBird-ID.

Der Katalog verwendet wissenschaftliche Namen und Artabgrenzungen von 2025. Seit `d8de7bc` stammen die Eingabecodes aus der Tabelle vom 27. Oktober 2026; seit `c601878` werden wissenschaftliche Codes bevorzugt und ihre Quellnamen angezeigt. Der Suchindex aus `8573e7c` berücksichtigt diese zusätzlichen Quellnamen nicht. Damit treffen unterschiedliche Taxonomiestände auf eine unvollständige Suche. Ein bloßer Unterschied der wissenschaftlichen Namen beweist keine Artverwechslung.

Beim Zaunkönig ist die Zuordnung korrekt: `Troglodytes troglodytes` (2025) und `Nannus troglodytes` (2026) bezeichnen dasselbe Konzept `avibase-AF700208`, eBird-ID `winwre4`. Der Winterzaunkönig ist eine andere Art: `Troglodytes hiemalis` beziehungsweise `Nannus hiemalis`, Konzept `avibase-C757BD95`, ID `winwre3`. Dieser ist nicht im App-Katalog enthalten. Auch das Präfix `winwre` einer historischen ID eignet sich nicht zur Namensinterpretation.

Die offizielle Codetabelle enthält beim Zaunkönig außerdem den regionalen englischen Namen „Eurasian Wren (Winter Wren)“ und „Northern Wren“. Das erklärt weiteres Verwechslungspotenzial bei englischen Suchquellen. Die App führt als englischen Hauptnamen korrekt „Eurasian Wren“; der gespeicherte Alias lautet „Northern Wren“. Winterzaunkönig und Zaunkönig haben getrennte wissenschaftliche Codes: `NAHI` und `NATR`.

Beleg: [Cornell: Gattungsänderungen 2026](https://www.birds.cornell.edu/clementschecklist/updates-and-corrections-october-2026-page-2/) und die unten identifizierten offiziellen Arbeitsmappen.

## Liste A: Bestätigte Such- und Erklärungslücke

Diese elf abweichenden Codenamen gehören jeweils zum **gleichen unveränderten Taxonkonzept** wie der Katalogname. Keine dieser Zeilen ist eine nachgewiesene Verwechslung mit einer anderen Art. Die vollständigen angezeigten Codenamen liefern bei zehn Arten keinen Treffer. Bei der Rohrammer entsteht lediglich ein Treffer über den gemeinsamen Bestandteil `schoeniclus`; das zusätzliche Feld wird auch dort nicht indexiert.

| Art / ID | Katalogname 2025 | Quellname des Codes 2026 | Wissenschaftlicher Code | Vollständiger Quellname findet eigene Art |
| --- | --- | --- | --- | --- |
| Braunkopfammer / `rehbun1` | Emberiza bruniceps | Melophus bruniceps | MEBR | Nein |
| Gelbbrauenammer / `yebbun1` | Emberiza chrysophrys | Schoeniclus chrysophrys | SCCH | Nein |
| Kappenammer / `blhbun1` | Emberiza melanocephala | Melophus melanocephalus | MEME | Nein |
| Maskenammer / `bkfbun1` | Emberiza spodocephala | Schoeniclus spodocephalus | SCSP | Nein |
| Pallasammer / `palbun` | Emberiza pallasi | Schoeniclus pallasi | SCPA | Nein |
| Rohrammer / `reebun` | Emberiza schoeniclus | Schoeniclus schoeniclus | SCSC | Ja, über vorhandenen Namensbestandteil |
| Rötelammer / `chebun1` | Emberiza rutila | Schoeniclus rutilus | SCRU | Nein |
| Waldammer / `rusbun` | Emberiza rustica | Schoeniclus rusticus | SCRU | Nein |
| Weidenammer / `yebbun` | Emberiza aureola | Schoeniclus aureolus | SCAU | Nein |
| Zaunkönig / `winwre4` | Troglodytes troglodytes | Nannus troglodytes | NATR | Nein |
| Zwergammer / `litbun` | Emberiza pusilla | Schoeniclus pusillus | SCPU | Nein |

**Bewertung:** P3 wie B3 im Qualitätsbericht. Zusätzlich fehlen an der konkreten Namensabweichung verständliche Versions- und Synonymhinweise. Empfohlen: belegte gleichbedeutende Namen für Suche verwenden und ihre Herkunft anzeigen. Keine automatische Umbenennung des Katalogs aus dem Codefeld.

`SCRU` ist ausdrücklich ein offizieller Code für Rötelammer und Waldammer. Das ist eine Codekollision, kein Fehlverweis. Codes dürfen deshalb keine Artidentifikatoren ersetzen.

## Liste B: Unterschiedliche Artabgrenzungen hinter gleichen oder weiterverwendeten IDs

Diese drei Fälle benötigen eine eigene Entscheidung. Sie lassen sich nicht als zusätzliche Synonyme lösen.

| Art / ID | Nachgewiesene Abweichung | Auswirkung und Vorschlag |
| --- | --- | --- |
| Grauschnäpper / `spofly1` | 2025 Art `Muscicapa striata`; 2026 dieselbe ID als Sammelzuordnung `Muscicapa striata/tyrrhenica` (`slash`). Die enger abgegrenzten Arten haben IDs `spofly2` und `spofly3`. | Der generierte eBird-Artlink und die Galerieabfrage verwenden weiter `spofly1` und adressieren damit laut aktueller Tabelle eine Sammelzuordnung. Die Beibehaltung der Codes von 2025 ist bereits dokumentiert, die sichtbare Einordnung des externen Ziels fehlt. Bis zu einer bewussten Migration die breitere Zuordnung kennzeichnen. Nicht blind auf `spofly2` umbiegen. |
| Rotkehlchen / `eurrob1` | Name und ID bleiben gleich, Konzept wechselt von `avibase-C809B2B9` zu `avibase-E68C3C70`. Das frühere Konzept umfasst auch das jetzt getrennte Kanarenrotkehlchen. | Der Katalog von 2025 und die externe Artseite beziehungsweise Codequelle von 2026 haben unterschiedliche Umfänge. Bei einer Umstellung Länderzuordnungen, Medien und Lernfortschritt gesondert prüfen. Ein Namensvergleich erkennt das nicht. |
| Virginiauhu / `grhowl` | Name und ID bleiben gleich, Konzept wechselt von `avibase-FC366114` zu `avibase-AC8B8FC6`. 2026 sind `Bubo nigrescens` und `Bubo nacurutu` getrennte Arten. | Gleiche strukturelle Versionsabweichung wie beim Rotkehlchen. Kein Nachweis eines falsch bestimmten App-Fotos. Konzeptgrenze explizit dokumentieren und vor einer Migration die betroffenen Daten prüfen. |

**Bewertung:** bestätigte Abweichungen zwischen den Datenständen; daraus folgt noch kein nachgewiesener Bewertungsfehler oder Datenverlust. Der Import prüft für reguläre Arten nur ID und Kategorie, nicht die Konzeptidentität. Dies ist eine konkrete Prüflücke. Für `spofly1` existiert bereits eine Ausnahme, für die beiden unverändert benannten Arten fehlt eine entsprechende Entscheidung.

Belege: [Cornell: Artaufspaltungen 2026](https://www.birds.cornell.edu/clementschecklist/updates-and-corrections-october-2026/) und offizielle Arbeitsmappe, Blatt `Sparse`. Cornell erklärt selbst, dass Arten-IDs zwischen Versionen keinen unveränderten Konzeptumfang garantieren und dafür die Konzeptkennung verglichen werden sollte: [Feldbeschreibung 2026](https://www.birds.cornell.edu/clementschecklist/introduction/updateindex/october-2026/).

## Weitere geprüfte Fälle und Grenzen

- Keine fehlende der 940 IDs in der Arbeitsmappe 2026; eine Kategorieänderung und zwei Konzeptänderungen wie oben. Alle elf übrigen wissenschaftlichen Namensänderungen behalten ihre Konzeptkennung.
- Keine Abweichung der gespeicherten Codefelder von der vollständigen offiziellen Codetabelle; ausgenommen die ausdrücklich dokumentierte Beibehaltung der 2025-Codes beim Grauschnäpper.
- Keine falsche Zuordnung bei deutschen Hauptnamen, wissenschaftlichen Katalognamen, britischen Namensvarianten oder den 940 niederländischen Hauptnamen gegenüber ihren festgelegten 2025-Quellen. Englische Hauptnamen stimmen mit der Taxonomie-CSV überein. Die Spalte `English` der Namensmatrix ist eine eigene Sprachvariante und darf nicht mit dem primären englischen Taxonomienamen gleichgesetzt werden.
- Fünf geänderte primäre englische Namen 2026 sind bereits suchbar: Eastern Imperial Eagle, Red-billed Teal, Hume's Leaf Warbler, Chinese Grosbeak, Red-crowned Kakariki. Daraus ergibt sich keine zusätzliche Suchlücke.
- `eclpar4` hat 2025 keinen deutschen Hauptnamen; 2026 liegt „Papua-Edelpapagei“ vor. Die App verwendet bislang die dokumentierte Rückfallanzeige. Dies ist eine mögliche belegte Namensergänzung, kein falscher Artverweis.
- 1.360 Fotoeinträge einschließlich Zusatzbildern: keine abweichende gespeicherte `sci`-Angabe gegenüber der zugehörigen Katalogart. Das ist eine Metadatenprüfung, keine erneute ornithologische Bestimmung aller Bilder und keine Bestätigung sämtlicher externen Bildtitel.
- Direkte eBird-Artseiten waren beim Webabruf durch den Bot-Schutz gesperrt. Aussagen über deren Zielkonzepte beruhen auf der aktuellen offiziellen Tabelle und der geprüften URL-Erzeugung in `dist/app.js`, nicht auf einer Sichtprüfung dieser Seiten.
- Der separate CSV-Neuabruf von Cornell lieferte HTTP 403. Stattdessen wurde die bereits vorhandene vollständige offizielle Arbeitsmappe verwendet; ihre Prüfsumme stimmt exakt mit der im Import festgeschriebenen Quelle überein.

## Genereller Umgang: Vorschlag vor einer Umsetzung

1. **Einen Taxonomiestand für den Katalog festlegen.** Dieser bestimmt Hauptnamen und Artumfang. Eine Aktualisierung erfolgt bewusst als Datenmigration, nicht nebenbei beim Import neuer Codes oder Medien.
2. **Artidentität, Namen und Codes getrennt führen.** Interne Lernreferenzen bleiben stabil. Pro Datenstand werden zusätzlich Quellen-ID, Konzeptkennung, Kategorie und Version gespeichert. Externe IDs und vierstellige Codes sind keine dauerhafte Identitätsgarantie.
3. **Jede Quelländerung klassifizieren.** Gleiche Konzeptkennung plus neuer Name: belegtes Synonym beziehungsweise neue Namenskombination. Geänderte Konzeptkennung, Split, Zusammenlegung oder Kategorieänderung: Prüffall mit expliziter Entscheidung. Fehlende Konzeptkennung: Zuordnung ungeprüft lassen. Keine automatische Freigabe nur aufgrund eines ähnlichen Namens oder derselben ID.
4. **Gleichbedeutende Namen verständlich anzeigen und finden.** Ein Hauptname, dazu bei Bedarf „auch … / Name nach Quelle …“. Verifizierte Synonyme durchsuchen; historische weiter gefasste Namen und mehrdeutige Bezeichnungen gesondert behandeln. Suchbarkeit und Annahme als Lernantwort getrennt entscheiden. Etymologien nicht ohne Prüfung auf eine andere Gattung übertragen.
5. **Artaufteilungen mit Fortschrittsregeln migrieren.** Alten Lernstand erhalten; Nachweise nicht pauschal auf alle neu getrennten Arten kopieren. Regionale Auswahl, Saisondaten, Bilder, externe Links und Sicherungen müssen dieselbe Zuordnungsentscheidung verwenden.
6. **Vor jeder Aktualisierung einen Änderungsbericht erzeugen.** Automatisierter Abgleich aller IDs, Kategorien, Konzeptkennungen und Namen; ungeklärte Konzeptänderungen vor Übernahme stoppen. Regressionen für die elf Synonyme, die drei Konzeptfälle, Codekollisionen sowie Backup/Weiterlernen nach Migration ergänzen.

Für dieses Paket empfiehlt sich zuerst die Entscheidung über den künftigen Taxonomiestand, anschließend die drei Konzeptfälle, dann die sichere Aufnahme der elf gleichbedeutenden Namen in Suche und Darstellung. Die App und ihre Daten wurden für diese Untersuchung nicht geändert.

## Reproduktionsgrundlage

- Offizieller Bezug: [eBird-Namen und Taxonomie](https://support.ebird.org/en/support/solutions/articles/48000804865).
- Arbeitsmappe 2026: [Cornell-Download](https://cornell.box.com/s/fjp112mh25nlvbyr1p28r9ya7nriblls), SHA-256 `989a1c4e9524c6b0fb3b8a69f99bad98f80706cd183e934bc620c6dd24e70e62`.
- Arbeitsmappe 2025: [Cornell-Download](https://cornell.box.com/s/zjci66divvqnz00k98r7pmmb6kpc69zs), SHA-256 `5a6c29b6a48db107b20f8bd1bc6f468ef652a51ccae299b1102350459d73b909`.
- Katalog SHA-256: `9c5f76e5ec1ce4e2d5c14188b803012428c29212ff33213d58491eeda3237595`.
- Die Arbeitsmappen wurden mit `scripts/catalog_workbook.py:workbook_rows` gelesen. Alle Katalog-IDs wurden mit `Sparse.species_code` verbunden; `category` und `bio_concept_code` wurden mit `CATEGORY` und `TAXON_CONCEPT_ID` aus `data/taxonomy.csv` verglichen. Alle gespeicherten Codefelder wurden mit `4-letter Codes` verglichen, einschließlich der dokumentierten Ausnahme. Die Suchnachweise verwenden direkt `searchLookup()` mit allen 940 Arten, geladenen niederländischen Namen und redaktionellen deutschen Namen.
- Die unversionierte Sicherheitsprüfung blieb unverändert; SHA-256 `c7da05a88fa84e08515bea1c01e6eb8bc1158f3deeb8ba7800cb7ea2ded72b11`.
