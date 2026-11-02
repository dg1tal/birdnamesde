#!/usr/bin/env python3
"""Build derived seasonal sets from manually downloaded eBird histogram exports.

No network, credentials or browser session access. Original TSVs remain outside dist.
Input: regions.json, CODE-taxa.json (visible species links), and
raw/CODE-2021-2025.tsv plus raw/CODE-YEAR.tsv for each year 2021..2025.
"""
import argparse
import csv
import datetime as dt
import hashlib
import html
import json
import math
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
YEARS = range(2021, 2026)
SEASONS = {'winter': [0, 1, 11], 'spring': [2, 3, 4], 'summer': [5, 6, 7], 'autumn': [8, 9, 10]}
TERMS = 'https://www.birds.cornell.edu/home/ebird-data-access-terms-of-use/'


def read_histogram(path, mapping=None, known=None):
    rows = list(csv.reader(path.read_text(encoding='utf-8-sig').splitlines(), delimiter='\t'))
    samples = [r for r in rows if r and r[0] == 'Sample Size:']
    if len(samples) != 1:
        raise ValueError(f'{path.name}: expected one Sample Size row')
    sample = [float(v) for v in samples[0][1:] if v != '']
    if len(sample) != 48 or any(not math.isfinite(v) or v < 0 or not v.is_integer() for v in sample):
        raise ValueError(f'{path.name}: invalid 48-bin sample')
    species = {}
    exported = 0
    for row in rows:
        if not row or '<em' not in row[0]:
            continue
        match = re.search(r'<em[^>]*>(.*?)</em>', row[0])
        if not match:
            raise ValueError(f'{path.name}: invalid scientific name')
        sci = html.unescape(match[1])
        rate = [float(v) for v in row[1:] if v != '']
        if len(rate) != 48 or any(not math.isfinite(v) or not 0 <= v <= 1 for v in rate):
            raise ValueError(f'{path.name}: invalid frequency for {sci}')
        exported += 1
        if mapping is None:
            continue  # Individual-year exports establish checklist denominators.
        key = mapping.get(sci)
        if key is None:
            if sci in known:
                raise ValueError(f'{path.name}: catalog species missing from visible taxon mapping: {sci}')
            continue  # Hybrids, subspecies and other taxa are outside the app catalog.
        if key not in known.values():
            continue
        if key in species:
            raise ValueError(f'{path.name}: duplicate species ID {key}')
        species[key] = rate
    if not exported:
        raise ValueError(f'{path.name}: no histogram rows')
    return {'sample': [int(v) for v in sample], 'species': species, 'exportedTaxa': exported}


def seasonal_sets(pooled, annual):
    if set(annual) != set(YEARS):
        raise ValueError('All five individual years are required')
    if any(sum(annual[y]['sample'][i] for y in YEARS) != pooled['sample'][i] for i in range(48)):
        raise ValueError('Individual-year samples do not sum to the pooled export')
    result = {}
    for season, months in SEASONS.items():
        bins = [m * 4 + i for m in months for i in range(4)]
        n = sum(pooled['sample'][i] for i in bins)
        supported = sum(sum(annual[y]['sample'][i] for i in bins) >= 100 for y in YEARS)
        ids = sorted(key for key, rates in pooled['species'].items()
                     if n and sum(pooled['sample'][i] * rates[i] for i in bins) / n >= .01)
        result[season] = {'sample': n, 'years': supported, 'ids': ids}
    return result


def build(source, today):
    birds = json.loads((ROOT / 'dist/species.json').read_text())['species']
    known = {s['sci']: s['id'] for s in birds}
    output = {'version': 1, 'experimental': True, 'source': 'eBird histogram exports',
              'period': '2021–2025', 'preparedAt': today, 'terms': TERMS,
              'method': 'Meldeanteil mindestens 1 %, nach Exportstichprobe gewichtet. Mindestens 300 Listen insgesamt und mindestens drei Jahre mit je 100 Listen. Winter: Dezember/Januar/Februar der jeweiligen Kalenderjahre. Experimentelle Auswahlregeln; keine Häufigkeits- oder Schwierigkeitseinstufung.',
              'regions': []}
    audit = {'retrievedAt': today, 'period': '2021–2025', 'source': 'eBird / Cornell Lab of Ornithology',
             'terms': TERMS, 'originalExportsPublished': False, 'regions': []}
    seen = set()
    for region in sorted(json.loads((source / 'regions.json').read_text()), key=lambda r: r['code']):
        code = region['code']
        if not re.fullmatch(r'DE-[A-Z]{2}(?:-[A-Z]+)?', code) or code in seen:
            raise ValueError('Invalid or duplicate region')
        seen.add(code)
        mapfile = source / f'{code}-taxa.json'
        mapping = {}
        for t in json.loads(mapfile.read_text()):
            if not t.get('sci'):
                continue
            if t['sci'] in mapping and mapping[t['sci']] != t['code']:
                raise ValueError(f'Ambiguous taxon: {t["sci"]}')
            mapping[t['sci']] = t['code']
        pooled_path = source / 'raw' / f'{code}-2021-2025.tsv'
        pooled = read_histogram(pooled_path, mapping, known)
        annual = {y: read_histogram(source / 'raw' / f'{code}-{y}.tsv') for y in YEARS}
        seasons = seasonal_sets(pooled, annual)
        output['regions'].append({'code': code, 'seasons': seasons})
        files = []
        for period in ['2021-2025', *YEARS]:
            path = source / 'raw' / f'{code}-{period}.tsv'
            first, last = (2021, 2025) if period == '2021-2025' else (period, period)
            files.append({'period': str(period), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                          'source': f'https://ebird.org/barchart?byr={first}&eyr={last}&bmo=1&emo=12&r={code}'})
        audit['regions'].append({'code': code, 'nameDe': region['nameDe'], 'files': files,
            'taxonMappingSha256': hashlib.sha256(mapfile.read_bytes()).hexdigest(),
            'matchedCatalogSpecies': len(pooled['species']),
            'annualSamples': {str(y): sum(annual[y]['sample']) for y in YEARS},
            'seasons': {k: {'sample': v['sample'], 'supportedYears': v['years'],
                            'species': len(v['ids']), 'ready': v['sample'] >= 300 and v['years'] >= 3}
                        for k, v in seasons.items()}})
    return output, audit


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    output, audit = build(args.source, dt.date.today().isoformat())
    for path, data in [(ROOT / 'dist/seasonal-species.json', output),
                       (ROOT / 'data/seasonal-histogram-provenance.json', audit)]:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    for r in audit['regions']:
        print(r['code'], ' '.join(f'{k}: {v["species"]} species, {v["sample"]} lists, {v["supportedYears"]} years, {"ready" if v["ready"] else "fallback"}' for k, v in r['seasons'].items()))


if __name__ == '__main__':
    main()
