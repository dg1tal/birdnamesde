"""Audit literal code provenance and collisions in the complete app catalogue."""
import collections
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def audit():
    source = json.loads((ROOT / 'data/code-records.json').read_text())
    birds = json.loads((ROOT / 'dist/species.json').read_text())['species']
    hits = collections.defaultdict(list)
    fields = {'scientific': 'sci_quick_codes', 'common': 'com_quick_codes', 'banding': 'banding_code'}
    for bird in birds:
        row = source['records'][bird['id']]
        expected = {c for field in fields.values() for c in re.findall(r'\b[A-Z]{4}\b', row[field])}
        assert set(bird['codes']) == expected, bird['id']
        assert bird['bandingCode'] == row['banding_code'], bird['id']
        assert bird['scientificCodes'] == row['sci_quick_codes'].split(), bird['id']
        for code in bird['codes']:
            hits[code].append({'id': bird['id'], 'de': bird['de'], 'sci': bird['sci'],
                               'types': [kind for kind, field in fields.items() if code in row[field].split()]})
    collisions = []
    for code, species in sorted(hits.items()):
        if len(species) < 2:
            continue
        pairs = sorted({'+'.join(sorted((a, b)))
                        for i, first in enumerate(species) for second in species[i + 1:]
                        for a in first['types'] for b in second['types']})
        without_banding = sum(any(t != 'banding' for t in bird['types']) for bird in species)
        collisions.append({'code': code, 'typePairs': pairs,
                           'introducedByBanding': without_banding < 2, 'species': species})
    return {'scope': 'All species in dist/species.json; collisions count distinct species, not repeated code types on the same species.',
            'source': source['meta'],
            'summary': {'species': len(birds), 'distinctCodes': len(hits), 'ambiguousCodes': len(collisions),
                        'commonBandingCollisions': sum('banding+common' in c['typePairs'] for c in collisions),
                        'collisionsIntroducedByBanding': sum(c['introducedByBanding'] for c in collisions),
                        'typePairs': dict(sorted(collections.Counter(p for c in collisions for p in c['typePairs']).items()))},
            'collisions': collisions}


if __name__ == '__main__':
    report = audit()
    (ROOT / 'docs/quick-code-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report['summary'], ensure_ascii=False))
