"""Select literal eBird entry codes by global species specificity."""
import argparse
import collections
import hashlib
import json
from pathlib import Path
import re

from catalog_workbook import workbook_rows

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/code-records.json'
CODE_FIELDS = {'codes', 'bandingCode', 'codeSource', 'scientificCodes', 'scientificCodeName'}
WORKBOOK_SHA256 = '989a1c4e9524c6b0fb3b8a69f99bad98f80706cd183e934bc620c6dd24e70e62'


def candidates(row):
    return list(dict.fromkeys(re.findall(r'\b[A-Z]{4}\b',
        (row.get('com_quick_codes') or '') + ' ' + (row.get('banding_code') or '') +
        ' ' + (row.get('sci_quick_codes') or ''))))


def ranked_codes(row, counts):
    # Scientific codes lead; retain specificity ordering for other accepted codes.
    scientific = (row.get('sci_quick_codes') or '').split()
    return sorted(candidates(row), key=lambda c: (
        c not in scientific, counts[c], c != row.get('banding_code'), c))


def primary_source(row, codes):
    if codes and codes[0] in (row.get('sci_quick_codes') or '').split():
        return 'sci_quick_codes'
    return 'banding_code' if codes and codes[0] == row['banding_code'] else 'com_quick_codes'


def apply_codes(data, source):
    for bird in data['species']:
        row = source['records'][bird['id']]
        bird['codes'] = ranked_codes(row, source['speciesCounts'])
        bird['bandingCode'] = row['banding_code']
        bird['scientificCodes'] = row['sci_quick_codes'].split()
        bird['scientificCodeName'] = row['sci_name']
        bird['codeSource'] = primary_source(row, bird['codes'])
    data['meta']['codes'] = source['meta']
    data['meta']['validation'] = 'Arten-IDs, englische und wissenschaftliche Namen gegen die offizielle v2025-4 CSV geprüft; deutsche Namen gegen die Namensmatrix von 2025. Eingabecodes gegen die offizielle Codetabelle vom 27. Oktober 2026 mit dokumentierter Taxonomie-Ausnahme geprüft.'
    return data


def import_source(workbook, data):
    if hashlib.sha256(workbook.read_bytes()).hexdigest() != WORKBOOK_SHA256:
        raise ValueError('Expected the reviewed official 27 October 2026 workbook')
    rows = list(workbook_rows(workbook, '4-letter Codes'))
    species = {r['species_code']: r for r in rows if r['category'] == 'species'}
    legacy = json.loads((ROOT/'data/official-records.json').read_text())['codes']
    records, exceptions = {}, {}
    for bird in data['species']:
        code = bird['id']
        if code in species:
            row = species[code]
        elif code == 'spofly1':
            row = legacy[code]
            exceptions[code] = 'Retained v2025 species concept; v2026 reclassifies this ID as a slash (Muscicapa striata/tyrrhenica). Codes remain from the official 2025 workbook pending a taxonomy migration.'
            species[code] = row
        else:
            raise ValueError('Review changed taxonomic concept before importing codes: '+code)
        records[code] = {k: row[k] for k in ('com_quick_codes', 'banding_code', 'sci_quick_codes', 'sci_name')}
    hits = collections.defaultdict(set)
    for code, row in species.items():
        for value in candidates(row):
            hits[value].add(code)
    used = {c for row in records.values() for c in candidates(row)}
    return {'meta': {'version': 'eBird v2026 codes / 27 October 2026',
        'sourceUrl': 'https://support.ebird.org/en/support/solutions/articles/48000804865',
        'workbookUrl': 'https://cornell.box.com/s/fjp112mh25nlvbyr1p28r9ya7nriblls',
        'workbookSha256': WORKBOOK_SHA256,
        'policy': 'Official scientific codes first. Within scientific and other codes separately, prefer fewest matching species worldwide, then banding codes, then alphabetical order. All candidates are accepted. Scientific code names follow their source workbook; catalogue names remain pinned to v2025.',
        'specificitySpecies': len(species), 'exceptions': exceptions},
        'speciesCounts': {c: len(hits[c]) for c in sorted(used)},
        'records': dict(sorted(records.items()))}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workbook', type=Path, help='Import reviewed official source; omit to reuse saved records')
    args = parser.parse_args()
    path = ROOT/'dist/species.json'
    data = json.loads(path.read_text())
    source = import_source(args.workbook, data) if args.workbook else json.loads(SOURCE.read_text())
    if args.workbook:
        SOURCE.write_text(json.dumps(source, ensure_ascii=False, indent=2)+'\n')
    path.write_text(json.dumps(apply_codes(data, source), ensure_ascii=False, indent=2)+'\n')


if __name__ == '__main__':
    main()
