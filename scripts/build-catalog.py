#!/usr/bin/env python3
"""Build a reviewed v2025 country union; no network or private observations."""
import argparse
import copy
import csv
import hashlib
import json
from pathlib import Path
import re

from catalog_workbook import workbook_rows
from code_policy import apply_codes

ROOT = Path(__file__).resolve().parents[1]
SOURCE_URL = 'https://cornell.box.com/s/zjci66divvqnz00k98r7pmmb6kpc69zs'
WORKBOOK_SHA256 = '5a6c29b6a48db107b20f8bd1bc6f468ef652a51ccae299b1102350459d73b909'


def digest(value):
    return hashlib.sha256(value).hexdigest()


def build(workbook, country_source, root=ROOT):
    if digest(workbook.read_bytes()) != WORKBOOK_SHA256:
        raise ValueError('Workbook is not the reviewed official v2025 source; refusing taxonomy drift')
    baseline = json.loads((root/'data/catalog-baseline.json').read_text())
    source = json.loads(country_source.read_text())
    countries = json.loads((root/'data/region-countries.json').read_text())
    expected = {c['code'] for c in countries}
    if source.get('version') != 1 or {c['code'] for c in source['countries']} != expected:
        raise ValueError('Country source does not match configured countries')
    taxonomy = {r['SPECIES_CODE']:r for r in csv.DictReader((root/'data/taxonomy.csv').open(encoding='utf-8-sig'))}
    names = {r['species_code']:r for r in workbook_rows(workbook, 'full_sparse') if r.get('category')=='species'}
    codes = {r['species_code']:r for r in workbook_rows(workbook, '4_letter_codes') if r.get('category')=='species'}
    groups = {r['en']:r['de'] for r in workbook_rows(workbook, 'species_groups')}
    # Verify the pinned source against every retained species, not its download filename.
    for s in baseline['species']:
        n = names.get(s['id'], {})
        if n.get('sci_name') != s['sci'] or n.get('German') != s['de']:
            raise ValueError('Workbook version does not match retained v2025 taxon: '+s['id'])
    selected = {s['id'] for s in baseline['species']}
    membership = {}
    exclusions = {}
    for country in source['countries']:
        ids, excluded = set(), []
        for code in country['taxa']:
            row = taxonomy.get(code)
            if row is None:
                excluded.append({'id':code, 'reason':'unknown in pinned v2025 taxonomy'})
                continue
            parent = row['REPORT_AS'] or code
            if row['CATEGORY'] not in {'species','issf','form','domestic','intergrade'} or taxonomy.get(parent,{}).get('CATEGORY')!='species':
                excluded.append({'id':code, 'reason':'not resolvable to one species'})
                continue
            ids.add(parent)
        membership[country['code']] = sorted(ids)
        exclusions[country['code']] = excluded
        selected.update(ids)
    legacy = {s['id']:s for s in baseline['species']}
    birds, missing = [], {'names':{}, 'codes':[]}
    for code in sorted(selected):
        t, n, c = taxonomy[code], names.get(code), codes.get(code)
        if n is None or c is None or n['sci_name'] != t['SCI_NAME']:
            raise ValueError('Missing or mismatched official species record: '+code)
        if code in legacy:
            bird = copy.deepcopy(legacy[code])
            bird['statusCountry'] = 'DE'
        else:
            quick = re.findall(r'\b[A-Z]{4}\b', c['com_quick_codes'] or c['banding_code'] or '')
            group = groups.get(n['species_group']) or n['species_group']
            if n['order1'] in ('Accipitriformes','Falconiformes'):group='Greifvögel'
            if n['order1']=='Strigiformes':group='Eulen'
            if n['order1']=='Charadriiformes' and any(f in n['family'] for f in ('Scolopacidae','Charadriidae','Haematopodidae','Recurvirostridae','Burhinidae')):group='Limikolen'
            gb = n['English, United Kingdom'] or n['English']
            aliases = [v for k,v in n.items() if k.startswith('English') and v and v not in (t['PRIMARY_COM_NAME'],gb) and '(' not in v and '/' not in v]
            bird = {'id':code, 'de':n['German'], 'en':t['PRIMARY_COM_NAME'], 'enGB':gb if gb!=t['PRIMARY_COM_NAME'] else '',
                    'sci':t['SCI_NAME'], 'codes':list(dict.fromkeys(quick)), 'bandingCode':c['banding_code'],
                    'codeSource':'com_quick_codes' if c['com_quick_codes'] else 'banding_code' if quick else '',
                    'aliases':{'de':[], 'en':list(dict.fromkeys(aliases))}, 'group':group, 'status':[], 'note':''}
        birds.append(bird)
        absent = [lang for lang,column in [('de','German'),('nl','Dutch')] if not n[column]]
        if absent:missing['names'][code]=absent
        if not bird['codes']:missing['codes'].append(code)
    fingerprint = digest('\n'.join(sorted(selected)).encode())
    catalog = {'version':1, 'id':'countries-v2025-'+fingerprint[:12], 'fingerprint':fingerprint,
               'taxonomy':'v2025', 'countries':sorted(expected), 'sourceRetrievedAt':source['retrievedAt'],
               'countrySpecies':membership, 'workbookUrl':SOURCE_URL, 'workbookSha256':digest(workbook.read_bytes()),
               'countrySourceSha256':digest(country_source.read_bytes())}
    meta = copy.deepcopy(baseline['meta'])
    meta.update({'built':source['retrievedAt'][:10], 'catalog':catalog,
                 'selection':'Union of eBird species records in DE, NL and GB, including historical rarities, plus the retained original German catalogue. Occurrence records are not breeding or establishment status. Taxonomy is pinned to v2025; excluded source taxa are documented in catalog-review.json.'})
    report = {'catalog':catalog, 'speciesCount':len(birds), 'retainedSpecies':len(legacy),
              'addedSpecies':sorted(selected-legacy.keys()), 'excludedSourceTaxa':exclusions, 'missing':missing}
    records = {'names':{k:names[k] for k in sorted(selected)}, 'codes':{k:codes[k] for k in sorted(selected)}, 'groups':groups}
    data = {'meta':meta, 'species':sorted(birds,key=lambda s:s['de'] or s['sci'])}
    data = apply_codes(data, json.loads((root/'data/code-records.json').read_text()))
    report['missing']['codes'] = [b['id'] for b in data['species'] if not b['codes']]
    return data, records, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workbook', type=Path, required=True)
    parser.add_argument('--countries', type=Path, required=True)
    parser.add_argument('--output-root', type=Path, default=ROOT)
    args = parser.parse_args()
    data, records, report = build(args.workbook, args.countries)
    for name,value in [('dist/species.json',data),('data/official-records.json',records),('data/catalog-country-lists.json',json.loads(args.countries.read_text())),('dist/catalog-review.json',report)]:
        path=args.output_root/name;path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text(json.dumps(value,ensure_ascii=False,indent=None if name=='data/official-records.json' else 2)+'\n')
    print(f"Catalogue: {len(data['species'])} species; {len(report['addedSpecies'])} additions; review dist/catalog-review.json")


if __name__=='__main__':main()
