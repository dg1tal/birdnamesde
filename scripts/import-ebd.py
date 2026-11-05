#!/usr/bin/env python3
"""Stream private eBird country ZIPs into a public, aggregate seasonal import preview.

No extraction of observations, credentials or network access. The preview is deliberately
outside dist/: review country coverage and taxonomy before activating it in the app.
"""
import argparse
from collections import Counter, defaultdict
import csv
import datetime as dt
import hashlib
import io
import json
from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
YEARS = range(2021, 2026)
SEASONS = ('winter', 'spring', 'summer', 'autumn')
MONTH_SEASON = (0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 0)
TYPES = {'Stationary', 'Traveling', 'Area'}
TERMS = 'https://www.birds.cornell.edu/home/ebird-data-access-terms-of-use/'
SAMPLING_FIELDS = ('SAMPLING EVENT IDENTIFIER', 'GROUP IDENTIFIER', 'COUNTRY CODE',
                   'STATE CODE', 'STATE', 'COUNTY CODE', 'COUNTY', 'OBSERVATION DATE',
                   'ALL SPECIES REPORTED', 'OBSERVATION TYPE')
OBS_FIELDS = ('SAMPLING EVENT IDENTIFIER', 'TAXON CONCEPT ID', 'CATEGORY',
              'SCIENTIFIC NAME', 'APPROVED', 'EXOTIC CODE', 'OBSERVATION COUNT')


def rows(archive, member, required):
    # Comments are trailing free text. Split TSV literally: quote interpretation can
    # turn a comment into a multi-line row and corrupt otherwise valid identifiers.
    with archive.open(member) as binary:
        stream = io.TextIOWrapper(binary, encoding='utf-8-sig')
        header = stream.readline().rstrip('\r\n').split('\t')
        if not set(required).issubset(header):
            raise ValueError(f'{member}: missing required columns')
        indexes = [header.index(k) for k in required]
        last_index = max(indexes)
        for line in stream:
            fields = line.rstrip('\r\n').split('\t')
            if len(fields) <= last_index:
                raise ValueError(f'{member}: malformed TSV row')
            yield tuple(fields[i] for i in indexes)


def taxon_mapping():
    birds = json.loads((ROOT / 'dist/species.json').read_text())['species']
    catalog = {b['id'] for b in birds}
    scientific = {b['sci']: b['id'] for b in birds}
    mapping = {}
    with (ROOT / 'data/taxonomy.csv').open(encoding='utf-8-sig', newline='') as f:
        for row in csv.DictReader(f):
            parent = row['REPORT_AS'] or row['SPECIES_CODE']
            if parent in catalog and row['CATEGORY'] in {'species', 'issf', 'form', 'domestic', 'intergrade'}:
                mapping[row['TAXON_CONCEPT_ID']] = parent
    return sorted(catalog), scientific, mapping


def select_checklists(records, country, labels, stats, local_codes=None):
    representatives = {}
    for identifier, group, cc, state, state_name, county, county_name, date, complete, protocol in records:
        stats['samplingRows'] += 1
        if cc != country:
            raise ValueError('Archive contains a different country')
        if complete != '1' or protocol not in TYPES or not ('2021-01-01' <= date <= '2025-12-31'):
            continue
        parsed = dt.date.fromisoformat(date)
        if not identifier or not state.startswith(country + '-'):
            raise ValueError('Eligible checklist lacks identifier or state code')
        labels[state] = state_name
        if county and not county.startswith(state + '-'):
            # Some border localities have inconsistent hierarchy assignments in
            # the source. Retain country/state evidence, omit the local rollup.
            stats['countyHierarchyMismatch'] += 1
            county = ''
        if local_codes is not None and county not in local_codes:
            county = ''
        if county:
            labels[county] = county_name
        regions = (country, state) + ((county,) if county else ())
        metadata = (parsed.year, MONTH_SEASON[parsed.month - 1], regions)
        key = ('group', group) if group else ('checklist', identifier)
        previous = representatives.get(key)
        # Select one actual complete checklist, never a union of observers' species.
        # The smallest identifier makes the choice independent of archive row order.
        if previous is None or identifier < previous[0]:
            representatives[key] = (identifier, metadata)
        stats['eligibleSamplingRows'] += 1
    selected = {identifier: metadata for identifier, metadata in representatives.values()}
    if len(selected) != len(representatives):
        raise ValueError('Conflicting checklist/group identifiers')
    stats['independentChecklists'] = len(selected)
    if not selected:
        raise ValueError('No eligible complete checklists in 2021–2025')
    return selected


def collect_detections(records, selected, catalog, scientific, mapping, stats):
    positions = {bird: n for n, bird in enumerate(catalog)}
    detections = defaultdict(int)
    unmatched = Counter()
    for identifier, concept, category, sci, approved, exotic, count in records:
        stats['observationRows'] += 1
        if identifier not in selected or approved != '1' or exotic == 'X':
            continue
        if category not in {'species', 'issf', 'form', 'domestic', 'intergrade'}:
            continue
        if count != 'X':
            try:
                if int(count) <= 0:
                    continue
            except ValueError:
                raise ValueError('Invalid observation count') from None
        bird = mapping.get(concept)
        if bird is None:
            if sci in scientific:
                # Never silently reconcile a changed taxon concept by name alone.
                unmatched[sci] += 1
            continue
        detections[identifier] |= 1 << positions[bird]
    return detections, dict(sorted(unmatched.items()))


def aggregate(selected, detections, catalog, labels):
    samples = defaultdict(Counter)
    reports = defaultdict(Counter)
    for identifier, (year, season, regions) in selected.items():
        bits = detections.get(identifier, 0)
        present = []
        while bits:
            bit = bits & -bits
            present.append(catalog[bit.bit_length() - 1])
            bits -= bit
        for region in regions:
            samples[region, season][year] += 1
            reports[region, season].update(present)
    result = []
    for region in sorted({r for r, _ in samples}):
        seasons = {}
        for index, name in enumerate(SEASONS):
            annual = samples[region, index]
            total = sum(annual.values())
            counts = reports[region, index]
            groups = {'frequent': [], 'medium': [], 'rare': []}
            for bird, count in sorted(counts.items()):
                if not 0 < count <= total:
                    raise ValueError('Detections exceed checklist denominator')
                group = 'frequent' if count * 10 >= total else 'medium' if count * 100 >= total else 'rare'
                groups[group].append(bird)
            seasons[name] = {'sample': total, 'years': sum(annual[y] >= 100 for y in YEARS),
                             'annualSamples': {str(y): annual[y] for y in YEARS},
                             'ids': sorted(groups['frequent'] + groups['medium']), 'groups': groups}
        result.append({'code': region, 'name': labels[region], 'seasons': seasons})
    return result


def import_archive(path, catalog, scientific, mapping):
    match = re.fullmatch(r'ebd_(DE|NL|GB)_smp_(rel[A-Za-z]{3}-\d{4})\.zip', path.name)
    if not match:
        raise ValueError('Expected an explicitly named DE, NL or GB country sampling ZIP')
    country, release = match.groups()
    before = path.stat()
    stats = Counter()
    labels = {country: {'DE': 'Deutschland', 'NL': 'Nederland', 'GB': 'United Kingdom'}[country]}
    stem = path.stem
    print(f'{country}: reading sampling events', flush=True)
    with zipfile.ZipFile(path) as archive:
        # Reading required members to EOF also checks their ZIP CRCs.
        terms = archive.read('terms_of_use.txt').decode('utf-8-sig')
        citation = archive.read('recommended_citation.txt').decode('utf-8-sig').strip()
        config = next(c for c in json.loads((ROOT / 'data/region-countries.json').read_text()) if c['code'] == country)
        local_codes = None if config.get('includeLocalRegions') else {
            r['code'] for entries in config.get('localRegions', {}).values() for r in entries}
        selected = select_checklists(rows(archive, stem + '_sampling.txt', SAMPLING_FIELDS), country, labels, stats, local_codes)
        print(f'{country}: {len(selected)} independent complete checklists; reading observations', flush=True)
        detections, unmatched = collect_detections(rows(archive, stem + '.txt', OBS_FIELDS),
                                                  selected, catalog, scientific, mapping, stats)
    if unmatched:
        raise ValueError(f'{country}: unresolved catalog taxon concepts: {", ".join(unmatched)}')
    regions = aggregate(selected, detections, catalog, labels)
    with path.open('rb') as stream:
        sha256 = hashlib.file_digest(stream, 'sha256').hexdigest()
    after = path.stat()
    if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
        raise ValueError('Archive changed during import; wait for the download to complete')
    provenance = {'country': country, 'release': release, 'archive': path.name, 'sha256': sha256,
                  'citation': citation, 'statistics': dict(stats), 'unresolvedCatalogTaxa': unmatched,
                  'originalDataPublished': False}
    print(f'{country}: {len(regions)} regional aggregates ready', flush=True)
    return regions, provenance, terms


def build(paths):
    catalog, scientific, mapping = taxon_mapping()
    regions, provenance, terms = [], [], None
    for path in paths:
        imported, audit, archive_terms = import_archive(path, catalog, scientific, mapping)
        if any(p['country'] == audit['country'] for p in provenance):
            raise ValueError('Supply only one archive per country')
        if terms is not None and terms != archive_terms:
            raise ValueError('Archives contain different terms; review before combining')
        terms = archive_terms
        regions.extend(imported)
        provenance.append(audit)
    return {'version': 1, 'experimental': True, 'status': 'import-preview-not-active',
            'source': 'eBird Basic Dataset', 'period': '2021–2025',
            'preparedAt': dt.date.today().isoformat(), 'terms': TERMS,
            'method': {'observationTypes': sorted(TYPES), 'completeChecklistsOnly': True,
                       'sharedChecklists': 'one complete checklist per group; smallest sampling event identifier',
                       'detections': 'approved positive counts or X; exact taxon concept mapping; escapees excluded',
                       'frequency': 'independent complete checklists reporting the species / all eligible checklists',
                       'thresholds': {'frequentAtLeast': 0.1, 'mediumAtLeast': 0.01, 'rareAbove': 0},
                       'minimumSample': 300, 'minimumYears': 3, 'minimumSamplePerYear': 100,
                       'winter': 'December, January and February of each calendar year'},
            'provenance': provenance,
            'regions': sorted(regions, key=lambda r: r['code'])}, terms


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archives', type=Path, nargs='+', help='Only completed country ZIPs; no download directory glob')
    parser.add_argument('--output', type=Path, default=ROOT / 'data/ebd-seasonal-preview.json')
    args = parser.parse_args()
    output, terms = build(args.archives)
    if 'dist' in args.output.resolve().parts:
        parser.error('Preview output must be outside the published dist directory')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.with_suffix('.terms.txt').write_text(terms.rstrip() + '\n')
    temporary = args.output.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(args.output)
    print(f'Wrote aggregate preview: {args.output}', flush=True)


if __name__ == '__main__':
    main()
