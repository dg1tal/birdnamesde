#!/usr/bin/env python3
"""Fetch public, unfiltered country taxon IDs for an explicit catalogue review."""
import argparse
import datetime as dt
import importlib.util
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('regional_updater', ROOT/'scripts/update-regions.py')
regions = importlib.util.module_from_spec(spec)
spec.loader.exec_module(regions)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    token = os.environ.get('EBIRD_API_KEY', '').strip()
    if not token or any(c.isspace() for c in token):
        raise SystemExit('EBIRD_API_KEY is missing or malformed')
    countries = []
    for country in regions.COUNTRIES:
        code = country['code']
        payload = regions.request_json(regions.API+f'product/spplist/{code}', token)
        if not isinstance(payload, list) or not payload or not all(
                isinstance(x, str) and regions.re.fullmatch('[a-z0-9]+', x) for x in payload):
            raise ValueError('Invalid country species list: '+code)
        countries.append({'code':code, 'taxa':sorted(set(payload))})
        print(f'{code}: {len(set(payload))} source taxa')
    data = {'version':1, 'source':'eBird API v2 country species lists',
            'targetTaxonomy':'v2025', 'retrievedAt':dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds'),
            'countries':countries}
    encoded = json.dumps(data, ensure_ascii=False, indent=2)+'\n'
    if token in encoded:
        raise ValueError('Credential material rejected')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(encoded)


if __name__ == '__main__':
    main()
