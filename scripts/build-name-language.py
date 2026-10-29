#!/usr/bin/env python3
"""Extract one language from the retained official workbook records; no translation guesses."""
import argparse
import json
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]

def build(language,column):
    if not re.fullmatch('[a-z]{2,3}',language):raise ValueError('Invalid language code')
    source=json.loads((ROOT/'data/official-records.json').read_text())['names']
    birds=json.loads((ROOT/'dist/species.json').read_text())['species']
    names={}
    for s in birds:
        row=source[s['id']]
        if row['sci_name']!=s['sci']:raise ValueError('Taxonomy mismatch: '+s['id'])
        name=row.get(column,'').strip()
        if name:names[s['id']]={'name':name,'aliases':[]}
    output={'version':1,'language':language,'meta':{'source':'eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx','sourceUrl':'https://support.ebird.org/en/support/solutions/articles/48000804865-bird-names-in-ebird','column':column,'taxonomy':'eBird/Clements v2025','speciesCount':len(names)},'species':names}
    destination=ROOT/'dist/languages'/f'{language}.json';destination.parent.mkdir(exist_ok=True)
    destination.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
    print(f'{language}: {len(names)}/{len(birds)} official names extracted; taxonomy unchanged.')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--language',required=True);parser.add_argument('--column',required=True)
    args=parser.parse_args();build(args.language,args.column)
