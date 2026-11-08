# Nachschlagen: Suchabsicht sichtbar machen

8. November 2026

## Problem und Entscheidung

Die bisherige Volltextsuche vermischte exakte Quickcodes, vollständige Namen,
Wortanfänge und zufällige Teilzeichenfolgen. Alphabetische Sortierung und große
Artenkarten erschwerten die Zuordnung kurzer Eingaben. Namensanzeige und
Suchumfang waren nicht klar unterscheidbar.

Die Suche behält ein einziges Eingabefeld für alle Sprachen und Codes. Sie
verlangt weder eine Sprachwahl noch eine spezielle Schreibweise. Großschreibung
wird nicht als Absicht interpretiert; auch ein vollständig eingegebener Name
kann großgeschrieben sein.

Die neue Trefferliste priorisiert:

1. Vollständig übereinstimmende Namen oder Codes, einschließlich Alternativnamen.
2. Wortanfänge in Namen und Codeanfänge.
3. Übrige Teiltreffer innerhalb eines Feldes.
4. Suchbegriffe, die erst über mehrere Felder zusammenpassen.

Innerhalb gleicher Trefferstärke gilt weiterhin die gewählte Namenssortierung.
Jede Art erscheint einmal. Exakte Code-Kollisionen bleiben gleichberechtigt
sichtbar. Eine kompakte Trefferzeile zeigt den Artnamen und die tatsächlich
passende Zeichenfolge mit Sprache oder Codeart, unabhängig von den eingeblendeten
Namenssprachen. Bei mehreren gleich starken Namen einer Sprache wird der erste
gezeigt; die Artenkarte enthält die weiteren Namen. Bei feldübergreifenden
Suchbegriffen bleiben die beteiligten Werte sichtbar.

Die native Details-Zeile öffnet die vollständige Artenkarte mit Namen, Codes,
Hintergrund und optionalen Bildern. Sie ist per Tastatur bedienbar und benötigt
keine eigene Combobox-Steuerung. Bestehende Länder-/Regionsfilter, explizites
Leeren, Trefferzahlen und Nachladen bleiben erhalten. Alle Trefferstärken sind
sichtbar; schwächere Treffer werden nicht automatisch ausgeschlossen.

Land, Region und Artengruppe stehen gemeinsam unter „Suchbereich“; aktive
Gebiets- und Artengruppenfilter bleiben außerhalb sichtbar. Das schafft Platz
für die ersten Treffer.

Die Suchmaske erhält einen sichtbaren Titel, konkrete Beispiele und einen
bleibenden Hinweis zum Suchumfang. „Namensanzeige“ bezeichnet ausdrücklich die
Darstellungseinstellung. Die Trefferübersicht nennt bei einer Suche die
Relevanzreihenfolge anstelle einer irreführenden reinen Namenssortierung.

## Forschungsgrundlage und Grenzen

- [NN/g: Site Search Suggestions](https://www.nngroup.com/articles/site-search-suggestions/)
  beschreibt den Nutzen erkennbarer Vorschläge mit Kontext: Wiedererkennen,
  weniger Tipparbeit und Unterstützung bei der Suchformulierung.
- [NN/g: Scoped Search: Dangerous, but Sometimes Useful](https://www.nngroup.com/articles/scoped-search/)
  zeigt, dass Nutzende Suchbegrenzungen übersehen oder vergessen können. Daher
  wird kein zusätzliches, dauerhaftes Feld-Dropdown eingeführt.
- [Baymard: Autocomplete Design](https://baymard.com/research-articles/autocomplete-design)
  empfiehlt deutlich erkennbaren Kontext und überschaubare Vorschläge an der
  Suche. Hier übernimmt die kompakte sofortige Trefferliste diese Aufgabe;
  ein zusätzliches Overlay würde dieselben Arten ein zweites Mal darstellen.

Die Quellen wurden am 8. November 2026 online geprüft. Ihre Befunde stammen
überwiegend aus allgemeinen Website- und E-Commerce-Suchen. Die Übertragung auf
ein mehrsprachiges Vogellexikon, die vierstufige Rangfolge und die aufklappbaren
Artenkarten sind Produktentscheidungen, keine bereits empirisch validierten
Ergebnisse für BirdNames DE.

Für einen anschließenden Nutzertest eignen sich Aufgaben mit einem kollidierenden
Quickcode (EUBL), einem kurzen Namensfragment (mer), einem niederländischen Namen
(Merel), einem Alternativnamen (Ziegenmelker) sowie einer durch Länderfilter
ausgeschlossenen Art. Zu beobachten sind Zeit bis zur richtigen Art,
Fehlöffnungen, Erkennen der Trefferursache und Korrektur aktiver Gebietsfilter.

## Verifikation

Automatisierte Regressionen prüfen reale Code-Kollisionen, Namen aller Sprachen,
Alternativnamen, Umlauttranskriptionen, feldübergreifende Begriffe, unveränderte
Treffermengen für repräsentative Eingaben, Rangfolge, eindeutige Arten,
Trefferursachen, zweisprachiges Markup und HTML-Escaping. Vorhandene Tests für
Artenkarten, Sprachen, Lernfunktionen und konsistente Modulversionen bleiben
anwendbar. Leere oder ausschließlich aus Satzzeichen bestehende Eingaben erzeugen
keine bedeutungslosen Suchtreffer.

Visuelle und funktionale Prüfung im internen Browser: EUBL mit beiden
gleichberechtigten Arten, Merel als niederländischer Exakttreffer, mer mit
Wortanfängen vor Teiltreffern, Details per Eingabetaste, Länderwahl, deutsche
und englische Oberfläche sowie Nachladen von 60 auf 120 Arten mit Fokus auf
dem ersten neuen Treffer. Bei 390 CSS-Pixeln waren Dokument und Viewport
gleich breit; kein horizontaler Überlauf. Die anfänglich gesperrte
Browseranbindung konnte nach einem Neustart der Verbindung verwendet werden.
