#!/usr/bin/env python3
"""Activate reviewed EBD aggregates; no raw data, credentials or network required."""
import argparse
import hashlib
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATASET_ID = 'ebd-relSep-2026-2021-2025-v1'
SEASONS = ('winter', 'spring', 'summer', 'autumn')
TERMS = 'https://www.birds.cornell.edu/home/ebird-data-access-terms-of-use/'


def load(path):
    return json.loads(path.read_text())


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build(preview, region_snapshot, species_ids):
    if preview.get('period') != '2021–2025' or preview.get('source') != 'eBird Basic Dataset':
        raise ValueError('Unexpected historical source or period')
    expected_method = {'observationTypes': ['Area', 'Stationary', 'Traveling'],
                       'completeChecklistsOnly': True,
                       'thresholds': {'frequentAtLeast': .1, 'mediumAtLeast': .01, 'rareAbove': 0},
                       'minimumSample': 300, 'minimumYears': 3, 'minimumSamplePerYear': 100}
    if any(preview.get('method', {}).get(k) != v for k, v in expected_method.items()):
        raise ValueError('Selection rules changed; review before activation')
    sources = preview['provenance']
    if {p['country'] for p in sources} != {'DE', 'NL', 'GB'} or len(sources) != 3:
        raise ValueError('All three countries are required')
    if any(p['release'] != 'relSep-2026' or p['unresolvedCatalogTaxa'] or p['originalDataPublished'] for p in sources):
        raise ValueError('Unreviewed source release or taxonomy')
    labels = {r['code']: r for r in region_snapshot['regions']}
    bycode = {r['code']: r for r in preview['regions']}
    if len(labels) != len(region_snapshot['regions']) or len(bycode) != len(preview['regions']):
        raise ValueError('Duplicate regions')
    if bycode.keys() - labels.keys():
        raise ValueError('EBD region not available in the reviewed API hierarchy')
    citations = {p['citation'] for p in sources}
    if len(citations) != 1 or not next(iter(citations)).strip():
        raise ValueError('Source citations differ or are empty; review before activation')
    credit = {**load(ROOT / 'data/ebird-citation.json'), 'datasetCitation': next(iter(citations))}
    regions = []
    for code, region in sorted(bycode.items()):
        if set(region['seasons']) != set(SEASONS):
            raise ValueError('Four seasons required')
        seasons = {}
        for season in SEASONS:
            value = region['seasons'][season]
            annual = value['annualSamples']
            if set(annual) != {str(y) for y in range(2021, 2026)} or any(type(n) is not int or n < 0 for n in annual.values()):
                raise ValueError('Invalid annual sample')
            if value['sample'] != sum(annual.values()) or value['years'] != sum(n >= 100 for n in annual.values()):
                raise ValueError('Sample support mismatch')
            groups = value['groups']
            if set(groups) != {'frequent', 'medium', 'rare'}:
                raise ValueError('Invalid frequency groups')
            all_ids = sum(groups.values(), [])
            if len(set(all_ids)) != len(all_ids) or not set(all_ids) <= species_ids:
                raise ValueError('Unknown or overlapping species')
            if set(value['ids']) != set(groups['frequent'] + groups['medium']) or len(value['ids']) != len(set(value['ids'])):
                raise ValueError('Default groups mismatch')
            seasons[season] = {k: value[k] for k in ('sample', 'years', 'ids', 'groups')}
        regions.append({'code': code, 'seasons': seasons})
    dataset = {'id': DATASET_ID, 'source': 'eBird Basic Dataset', 'release': 'September 2026', 'period': '2021–2025'}
    output = {'version': 1, 'experimental': True, 'dataset': dataset,
              'source': dataset['source'], 'period': dataset['period'], 'credit': credit, 'preparedAt': preview['preparedAt'],
              'terms': TERMS, 'termsFile': 'ebd-terms.txt', 'provenance': 'seasonal-provenance.json', 'regions': regions}
    audit = {'dataset': dataset, 'preparedAt': preview['preparedAt'], 'terms': TERMS,
             'method': preview['method'], 'sources': sources, 'credit': credit,
             'regionMatch': {'source': region_snapshot['source'],
                             'snapshotGeneratedAt': region_snapshot['snapshotGeneratedAt'],
                             'checkedAt': region_snapshot['checkedAt'],
                             'matchedCodes': sorted(bycode),
                             'withoutHistoricalSample': sorted(labels.keys() - bycode.keys()),
                             'unmatchedEbdCodes': []}, 'originalDataPublished': False}
    return output, audit


def method_page(data, audit, snapshot):
    esc = html.escape
    bycode = {r['code']: r for r in data['regions']}
    def table(regions):
        rows = []
        for region in regions:
            code = region['code']
            cells = []
            for season in SEASONS:
                s = bycode.get(code, {}).get('seasons', {}).get(season, {'sample': 0, 'years': 0})
                ready = s['sample'] >= 300 and s['years'] >= 3
                status = 'Saisonal / Seasonal' if ready else 'Regionsliste / Regional list'
                cells.append(f'<td>{status}<br>{s["sample"]:,} Listen / lists<br>{s["years"]} Jahre / years</td>')
            label = esc(region['nameDe'])
            if region['nameEn'] != region['nameDe']:
                label += ' / <span lang="en">' + esc(region['nameEn']) + '</span>'
            rows.append(f'<tr><th scope="row">{label}<br><small>{esc(code)}</small></th>{"".join(cells)}</tr>')
        return '<div class="seasonal-coverage" tabindex="0" role="region" aria-label="Datenabdeckung / Seasonal coverage"><table><caption>Stichprobe / Sample 2021–2025</caption><thead><tr><th scope="col">Region</th>' + ''.join(f'<th scope="col">{s}</th>' for s in ['Winter','Frühjahr / Spring','Sommer / Summer','Herbst / Autumn']) + '</tr></thead><tbody>' + ''.join(rows) + '</tbody></table></div>'
    coverage = []
    for country in ['DE', 'NL', 'GB']:
        regions = [r for r in snapshot['regions'] if r['code'] == country or r['code'].startswith(country + '-')]
        coverage.append(f'<h3>{esc(regions[0]["nameDe"])} / {esc(regions[0]["nameEn"])}</h3>')
        coverage.append(table([r for r in regions if r['code'].count('-') < 2]))
        local = [r for r in regions if r['code'].count('-') == 2]
        if local:
            coverage.append(f'<details><summary>Lokale Regionen / Local regions ({len(local)})</summary>{table(local)}</details>')
    credit = data['credit']
    citations = f'<li>{esc(credit["datasetCitation"])}</li><li><a href="{esc(credit["primaryReference"]["url"])}">{esc(credit["primaryReference"]["citation"])}</a></li>'
    return f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Saisonale Auswahl – Daten und Methode</title><link rel="stylesheet" href="style.css?v=20261102-cardactions1"></head><body><main>
<p><a href="./#lernen">← Zurück zum Lernen / Back to learning</a> · <a href="#method-en" lang="en">English explanation</a></p>
<h1>Saisonale Häufigkeitsstufen und aktuelle Ergänzungen</h1>
<p><strong>Experimentell:</strong> Die Gruppen beschreiben historische Meldeanteile, keine Bestandsgröße, Lernschwierigkeit oder persönliche Sichtungswahrscheinlichkeit.</p>
<p>Grundlage ist das eBird Basic Dataset (EBD), Ausgabe September 2026. Ausgewertet werden ausschließlich 2021–2025 für Deutschland, die Niederlande und das Vereinigte Königreich. Die Daten wurden am 5. November 2026 aufbereitet. Die App enthält saisonale Stichproben für {len(bycode)} exakt zugeordnete Regionen. Die Zuordnung wurde gegen den öffentlichen eBird-Regionsstand der App vom {esc(snapshot['snapshotGeneratedAt'][:10])} geprüft. Neue Regionslisten können später hinzukommen und bleiben ohne passende historische Daten bei der regionalen Artenliste.</p>
<h2>Berechnung und Auswahl</h2>
<p>Verwendet werden vollständige Checklisten der Beobachtungstypen Stationary, Traveling und Area. Zufallsbeobachtungen, historische Protokolle und spezialisierte Erfassungen werden ausgeschlossen. Es gibt keinen zusätzlichen Filter für Dauer oder Entfernung. Geteilte Checklisten zählen einmal: Pro Gruppe wird die vollständige Checkliste mit der lexikografisch kleinsten Kennung verwendet. Nachweise anderer Gruppenkopien werden nicht hinzugefügt. Vollständige Listen ohne Nachweis einer Lernart bleiben in der Stichprobe.</p>
<p>Eine Art zählt je Checkliste höchstens einmal. Berücksichtigt werden bestätigte Datensätze (APPROVED = 1) mit positiver Anzahl oder X als Anwesenheitsangabe. Als Gefangenschaftsflüchtlinge markierte Nachweise (EXOTIC CODE = X) werden ausgeschlossen. Arten und unterstützte unterartliche Einträge werden über die offiziellen Taxonkennungen und Artzuordnungen auf den bestehenden Lernkatalog abgebildet; Hybriden und mehrdeutige Bestimmungen werden ausgeschlossen. Der Artenkatalog selbst bleibt unverändert.</p>
<p>Der Meldeanteil ist die Zahl geeigneter Listen mit Nachweis der Art geteilt durch alle geeigneten Listen in Region und Saison. <strong>Häufig:</strong> mindestens 10 %. <strong>Mittel:</strong> 1 bis unter 10 %. <strong>Selten:</strong> über 0 bis unter 1 %. Häufig und mittel sind standardmäßig aktiv und mit selten kombinierbar. Nullwerte oder fehlende Nachweise gehören keiner Gruppe an. Sensible Daten können in EBD fehlen; fehlende oder nicht bestätigte Meldungen beweisen keine Abwesenheit. Beobachtungsaufwand und Erfassungsorte beeinflussen die Werte. Die Ergebnisse können durch Filter und die Zusammenführung geteilter Listen von den bisherigen eBird-Histogrammen abweichen.</p>
<p>Für eine saisonale Auswahl sind mindestens 300 Listen insgesamt und mindestens drei Einzeljahre mit je 100 Listen erforderlich. Andernfalls wird ausdrücklich die regionale Artenliste verwendet. Winter: Dezember, Januar und Februar der jeweiligen Kalenderjahre; Frühjahr: März–Mai; Sommer: Juni–August; Herbst: September–November. Zeitraum und Schwellenwerte sind unverändert und bleiben vorläufige Auswahlregeln.</p>
<h2>Aktuelle Meldungen und gespeicherte Runden</h2>
<p>Die tägliche API-Aktualisierung ergänzt automatisch gültige bemerkenswerte eBird-Meldungen außerhalb der gewählten Grundauswahl. Sie ändern keine historische Häufigkeitsgruppe und erzeugen keine Dopplungen. Sie gelten höchstens 14 Tage ab Beobachtung und enden am Ablaufdatum um 00:00 UTC. Snapshots über drei Tage werden nicht verwendet. Meldehäufigkeit wird dadurch nicht neu berechnet. Arten- und Namenssprachenfilter gelten weiter; Lernstandsfilter gelten für eigene Runden. Fällige Wiederholungen bleiben über die aktuelle Artenauswahl hinaus möglich.</p>
<p>Neue Runden verwenden die neue Datengrundlage. Begonnene und pausierte Runden behalten ihre gespeicherte Auswahl und Meldungsdaten. Neue saisonale Runden speichern zusätzlich die Datenquellen-Version. Ältere Runden ohne Quellenangabe erhalten nachträglich keine neue Zuordnung. Lernfortschritt und Wiederholungstermine werden durch die Umstellung nicht geändert.</p>
<p>EBD wird lokal aus manuellen Downloads aufbereitet und nicht täglich aktualisiert. Die API aktualisiert weiterhin separat die regionalen Artenlisten (einschließlich des 30-Tage-Modus) und aktuellen bemerkenswerten Meldungen. Bei fehlenden frischen aktuellen Daten gibt es keine aktuellen Ergänzungen; die historische Grundlage bleibt nutzbar.</p>
<h2>Quellen und Nutzungsbedingungen / Sources and terms</h2><ul>{citations}</ul>
<p>{esc(credit["acknowledgement"]["de"])} <span lang="en">{esc(credit["acknowledgement"]["en"])}</span></p>
<p><a href="{esc(credit["dataSourceURL"])}">EBD-Datenquelle / EBD data source</a> · <a href="{esc(credit["citationGuidelinesURL"])}">Offizielle Zitierhinweise / Official citation guidance</a>. Die Datensatzzitierung wurde unverändert aus recommended_citation.txt der drei Archive übernommen. / The dataset citation is reproduced unchanged from recommended_citation.txt supplied with all three archives.</p>
<p>Die abgeleiteten Daten unterliegen den <a href="{TERMS}">eBird Data Access Terms of Use</a>. <a href="ebd-terms.txt">Vollständige mitgelieferte Bedingungen / Full supplied terms</a>. Die MIT-Lizenz des Programmcodes gilt nicht für diese Daten. Die Bedingungen verlangen insbesondere Quellenangabe, nichtkommerzielle Nutzung, Nutzung für den beantragten Zweck und dieselben Bedingungen bei Weitergabe abgeleiteter Daten. Originaldaten, Beobachter- und Checklistenkennungen, Koordinaten und Kommentare werden nicht veröffentlicht. Keine Bestätigung oder Empfehlung durch Cornell oder eBird.</p>
<p><a href="seasonal-species.json">Saisonale Artenauswahl / Seasonal species (JSON)</a> · <a href="seasonal-provenance.json">Herkunft, Methode und Prüfsummen / Provenance, method and hashes (JSON)</a></p>
<section lang="en" id="method-en"><h2>Seasonal selection and current additions</h2>
<p>Experimental seasonal groups use the eBird Basic Dataset, September 2026 release, restricted to 2021–2025 in Germany, the Netherlands and the UK. Prepared 5 November 2026. Historical samples cover {len(bycode)} exactly matched app regions. The existing learning catalogue and taxon IDs are unchanged.</p>
<p>Only complete Stationary, Traveling and Area checklists are eligible; incidental, historical and specialized surveys are excluded. No additional duration or distance filter is applied. One complete checklist per shared group is selected by its lexicographically smallest identifier. Reports from other copies are not combined. Lists without catalog detections remain in the denominator. Only approved positive counts or X presence records are counted; escapees are excluded. Exact official taxon concepts and parent-species links combine supported infraspecific records, once per species per checklist. Hybrids and ambiguous taxa are excluded. These filters and group deduplication can change results compared with the previous histogram exports.</p>
<p>Frequency is the proportion of eligible checklists reporting a species. Frequent ≥10%; medium ≥1% and &lt;10%; rare &gt;0% and &lt;1%. Frequent and medium remain the default. Zero/missing reports are not rare. A seasonal list needs ≥300 checklists overall and ≥3 years with ≥100 checklists each. Otherwise the regional list is used, visibly labelled. Winter combines December, January and February of each calendar year; spring March–May, summer June–August, autumn September–November. These are provisional selection rules, not population estimates, learning difficulty or detection probabilities. Effort, survey locations and withheld sensitive data affect results; missing accepted records do not prove absence.</p>
<p>Daily API updates remain separate: regional lists include all-time and last-30-days modes; valid recent notable reports automatically supplement the selected base without changing historical groups or duplicating species. Reports expire 14 days after observation at 00:00 UTC; snapshots older than three days are ignored. Species and name-language filters still apply; progress filters apply to custom rounds. Due reviews remain eligible beyond the current species selection. Existing and paused rounds retain their original selection and report dates. New seasonal rounds store the dataset version. Older rounds are not assigned a new source retrospectively; learning progress and review dates are preserved. EBD aggregates are updated only after a new local import.</p>
<p>Derived data remain subject to the full eBird terms linked above, including attribution, non-commercial use, requested purpose and the same terms on redistribution. The code's MIT licence does not cover these data. Raw observations, observer/checklist IDs, coordinates and comments are not published. No endorsement by Cornell or eBird.</p></section>
<h2>Datenabdeckung je Jahreszeit / Coverage by season</h2>
<p>„Saisonal / Seasonal“ erfüllt die unveränderten Stichprobenregeln. „Regionsliste / Regional list“ verwendet die regionale Artenliste. Jede Zelle nennt die Gesamtstichprobe und die Zahl der Jahre mit jeweils mindestens 100 Listen. / Each cell shows the total sample and years with at least 100 lists; insufficient samples use the regional list.</p>
{''.join(coverage)}
</main></body></html>'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check tracked artifacts without modifying them')
    args = parser.parse_args()
    preview_path = ROOT / 'data/ebd-seasonal-preview.json'
    regions_path = ROOT / 'data/ebd-region-match.json'
    preview, snapshot = load(preview_path), load(regions_path)
    ids = {s['id'] for s in load(ROOT / 'dist/species.json')['species']}
    data, audit = build(preview, snapshot, ids)
    audit['inputs'] = {str(p.relative_to(ROOT)): digest(p) for p in [preview_path, regions_path, ROOT / 'data/taxonomy.csv', ROOT / 'data/ebird-citation.json', ROOT / 'data/ebd-seasonal-preview.terms.txt', Path(__file__).resolve()]}
    files = {ROOT / 'dist/seasonal-species.json': json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n',
             ROOT / 'dist/seasonal-provenance.json': json.dumps(audit, ensure_ascii=False, indent=2) + '\n',
             ROOT / 'dist/ebd-terms.txt': (ROOT / 'data/ebd-seasonal-preview.terms.txt').read_text(),
             ROOT / 'dist/seasonal-data.html': method_page(data, audit, snapshot) + '\n'}
    for path, content in files.items():
        if args.check:
            if not path.exists() or path.read_text() != content:
                raise SystemExit(f'Generated file differs: {path.relative_to(ROOT)}')
        else:
            path.write_text(content)
    print(f'{"Verified" if args.check else "Built"}: {len(data["regions"])} exact EBD regions; {len(audit["regionMatch"]["withoutHistoricalSample"])} regional fallbacks without historical samples.')


if __name__ == '__main__':
    main()
