#!/usr/bin/env python3
"""Publish validated DDA abbreviations; reuse the last good snapshot on failure."""
import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/dda-code-records.json'
OUTPUT = ROOT / 'dist/dda-codes.json'
API = 'https://www.dda-web.de/api/species/abbreviations'
PREVIOUS = 'https://dg1tal.github.io/birdnamesde/dda-codes.json'


def snapshot(records, meta, mapping, ids):
    if not isinstance(records, list) or not records or len(records) > 10000:
        raise ValueError('Invalid DDA list')
    species, retained, review, deprecated, seen = {}, [], [], [], set()
    for row in records:
        if not isinstance(row, dict):
            raise ValueError('Invalid DDA row')
        pk = row.get('speciesPKID')
        if type(pk) is not int or pk <= 0 or pk in seen:
            raise ValueError('Invalid or duplicate DDA ID')
        seen.add(pk)
        if any(not isinstance(row.get(f), str) or not 0 < len(row[f]) <= 300
               for f in ('germanName', 'scientificName', 'abbrev')):
            raise ValueError('Invalid DDA fields')
        if not re.fullmatch(r'[A-ZÄÖÜ][a-zäöüß]{0,2}', row['abbrev']):
            raise ValueError('Invalid DDA abbreviation')
        clean = {k: row[k] for k in ('speciesPKID', 'germanName', 'scientificName', 'abbrev')}
        retained.append(clean)
        if row['germanName'].startswith('VERALTET:') or row['scientificName'].startswith('OLD:'):
            deprecated.append(clean)
            continue
        match = mapping.get(str(pk))
        if not match or match['id'] not in ids or match['scientificName'] != row['scientificName']:
            review.append(clean)
            continue
        if match['id'] in species:
            raise ValueError('Conflicting DDA catalogue mapping')
        species[match['id']] = {'sourceId': pk, 'name': row['germanName'],
                               'scientificName': row['scientificName'], 'code': row['abbrev'],
                               'scope': match.get('scope', {})}
    if not species:
        raise ValueError('No usable DDA mappings')
    return {'version': 1, 'meta': {**meta, 'sourceUrl': 'https://www.dda-web.de/monitoring/mhb/artkuerzel',
            'apiUrl': API, 'sourceCount': len(records), 'activeCount': len(species),
            'deprecated': deprecated, 'review': review}, 'records': retained,
            'species': dict(sorted(species.items()))}


def request(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'BirdNames-DE-DDA/1.0', 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as response:
        raw = response.read(2_000_001)
    if len(raw) > 2_000_000:
        raise ValueError('DDA response too large')
    return raw


def validate_previous(value, mapping, ids, now):
    if value.get('version') != 1:
        raise ValueError('Invalid DDA snapshot version')
    meta = value['meta']
    stamp = dt.datetime.fromisoformat(meta['fetchedAt'].replace('Z', '+00:00'))
    if not stamp.tzinfo or stamp > now + dt.timedelta(minutes=5):
        raise ValueError('Invalid DDA timestamp')
    if meta.get('sourceStand') != '28.02.2020' or not re.fullmatch('[a-f0-9]{64}', meta.get('sha256', '')):
        raise ValueError('Invalid DDA provenance')
    allowed = {k: meta[k] for k in ('fetchedAt', 'sourceStand', 'sha256')}
    return snapshot(value['records'], allowed, mapping, ids)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check committed bootstrap without network')
    parser.add_argument('--from-records', action='store_true', help='Build committed bootstrap without network')
    parser.add_argument('--if-due', action='store_true', help='Reuse a valid published snapshot under 24 hours old')
    args = parser.parse_args()
    source = json.loads(SOURCE.read_text())
    ids = {b['id'] for b in json.loads((ROOT / 'dist/species.json').read_text())['species']}
    baseline = snapshot(source['records'], source['meta'], source['mapping'], ids)
    if args.check:
        if json.loads(OUTPUT.read_text()) != baseline:
            raise SystemExit('DDA bootstrap differs from reviewed records')
        print(f"PASS: {len(baseline['species'])} active DDA abbreviations match reviewed source.")
        return
    result = baseline
    if not args.from_records:
        now = dt.datetime.now(dt.timezone.utc)
        try:
            result = validate_previous(json.loads(request(PREVIOUS)), source['mapping'], ids, now)
        except Exception:
            print('DDA: published snapshot unavailable; retaining reviewed bootstrap.')
        age = now - dt.datetime.fromisoformat(result['meta']['fetchedAt'].replace('Z', '+00:00'))
        if not args.if_due or age >= dt.timedelta(hours=24):
            try:
                raw = request(API)
                meta = {**source['meta'], 'fetchedAt': now.isoformat(timespec='seconds').replace('+00:00', 'Z'),
                        'sha256': hashlib.sha256(raw).hexdigest()}
                result = snapshot(json.loads(raw), meta, source['mapping'], ids)
            except Exception:
                print('WARNING: DDA refresh failed; retaining last good snapshot and original timestamp.')
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(f"DDA: {len(result['species'])} active entries; {len(result['meta']['review'])} require mapping review; fetched {result['meta']['fetchedAt']}.")


if __name__ == '__main__':
    main()
