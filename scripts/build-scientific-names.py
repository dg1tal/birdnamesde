#!/usr/bin/env python3
"""Compile explicit editorial glosses. Never infer meanings from spelling endings."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = ('de', 'en', 'nl')
EVIDENCE_SCOPES = {'wordMeaning', 'wordComponent', 'nameHistory', 'dedication', 'identity', 'nameContext'}


def read_glosses(names):
    result = {}
    for name in names:
        path = ROOT / f'data/scientific-name-{name}.txt'
        for number, line in enumerate(path.read_text().splitlines(), 1):
            if not line or line.startswith('#'):
                continue
            fields = line.split('|')
            assert len(fields) in (4, 5), (path, number)
            assert all(fields[1:4]), (path, number)
            assert len(fields) == 4 or fields[4] == '?', (path, number)
            for term in fields[0].split():
                assert term not in result, (path, number, term)
                result[term] = {'term': term, 'text': dict(zip(LANGUAGES, fields[1:4])),
                                'uncertain': len(fields) == 5}
    return result


def build():
    raw = (ROOT / 'dist/species.json').read_bytes()
    birds = json.loads(raw)['species']
    # Use the same reviewed name selection as the UI; never guess from code names.
    current_names = json.loads(subprocess.check_output(
        ['node', '--input-type=module', '-e',
         "import {readFileSync} from 'node:fs';"
         "import {primaryName} from './dist/name-languages.js';"
         "const birds=JSON.parse(readFileSync('dist/species.json')).species;"
         "console.log(JSON.stringify(Object.fromEntries(birds.map(b=>[b.id,primaryName(b,'sci')]))));"],
        cwd=ROOT, text=True))
    audit = json.loads((ROOT / 'docs/scientific-name-feasibility-20261107.json').read_text())
    provenance = {b['id']: b for b in audit['species']}
    genera = read_glosses(['genera'])
    epithets = read_glosses(['epithets', 'histories', 'people'])
    overrides = json.loads((ROOT / 'data/scientific-name-overrides.json').read_text())
    reviewed_evidence = json.loads((ROOT / 'data/scientific-name-evidence.json').read_text())
    assert set(genera) == {name.split()[0] for name in [b['sci'] for b in birds] + list(current_names.values())}
    assert set(epithets) == {name.split()[1] for name in [b['sci'] for b in birds] + list(current_names.values())}
    assert set(overrides) <= set(current_names.values())
    sources = {
        'jobling2010': {'title': 'James A. Jobling (2010), The Helm Dictionary of Scientific Bird Names',
                       'url': 'https://www.bloomsbury.com/uk/helm-dictionary-of-scientific-bird-names-9781408133262/'},
        'alipiopsitta2006': {'title': 'Caparroz & Pacheco (2006), A homonymy in Psittacidae',
                            'url': 'https://www.researchgate.net/publication/242361616_A_homonymy_in_Psittacidae_New_name_for_Salvatoria_Miranda-Ribeiro'},
        'helopsaltes2018': {'title': 'Alström et al. (2018), Locustellidae',
                           'url': 'https://doi.org/10.1016/j.ympev.2018.03.029'},
        'goffiniana2004': {'title': 'Roselaar & Michels (2004), Systematic notes on Asian birds 48',
                          'url': 'https://repository.naturalis.nl/pub/215560/ZV350_183-196.pdf'},
        'sibirionetta': {'title': 'The Key to Scientific Names: Sibirionetta (reference transcription)',
                        'url': 'https://www.worldbirdnames.com/bird/baikal-teal/422.html'},
    }
    supplements = {'Alipiopsitta': 'alipiopsitta2006', 'Helopsaltes': 'helopsaltes2018',
                   'goffiniana': 'goffiniana2004', 'Sibirionetta': 'sibirionetta'}
    assert not (sources.keys() & reviewed_evidence['sources'].keys()), 'Duplicate reviewed source'
    sources.update(reviewed_evidence['sources'])
    terms, species = {}, {}
    for bird in birds:
        assert provenance[bird['id']]['scientificName'] == bird['sci'], bird['id']
        name = current_names[bird['id']]
        parts = []
        for i, term in enumerate(name.split()):
            role = 'genus' if i == 0 else 'epithet'
            key = ('g:' if i == 0 else 'e:') + term
            entry = dict((genera if i == 0 else epithets)[term])
            if role in overrides.get(name, {}):
                key += ':' + bird['id']
                entry['text'] = dict(zip(LANGUAGES, overrides[name][role]))
            # Changed genera require a reviewed reference, not the old genus page.
            if i == 0 and term != bird['sci'].split()[0]:
                assert key in reviewed_evidence['terms'] and 'source' in reviewed_evidence['terms'][key], key
            evidence = provenance[bird['id']][role + 'Source']
            if term in supplements:
                entry['source'] = supplements[term]
            else:
                entry['source'] = 'jobling2010'
                entry['page'] = evidence['printedPage']
            if key in reviewed_evidence['terms']:
                reviewed = reviewed_evidence['terms'][key]
                assert set(reviewed) <= {'source', 'page', 'additionalSources'}, key
                if 'source' in reviewed:
                    assert reviewed['source'] in sources, key
                    entry.pop('page', None)
                    entry['source'] = reviewed['source']
                    if 'page' in reviewed:
                        entry['page'] = reviewed['page']
                else:
                    assert 'page' not in reviewed, key
                if 'additionalSources' in reviewed:
                    references = reviewed['additionalSources']
                    assert isinstance(references, list) and 0 < len(references) <= 12, key
                    for reference in references:
                        assert set(reference) <= {'source', 'page', 'scope'}, key
                        assert reference['source'] in sources and reference['scope'] in EVIDENCE_SCOPES, key
                        assert 'page' not in reference or (type(reference['page']) is int and reference['page'] > 0), key
                    entry['additionalSources'] = references
            if key in terms:
                assert terms[key] == entry, key
            terms[key] = entry
            parts.append(key)
        species[bird['id']] = {'scientificName': name, 'parts': parts}
    assert reviewed_evidence['terms'].keys() <= terms.keys(), 'Unknown reviewed term'
    return {'version': 1, 'languages': list(LANGUAGES),
            'meta': {'date': '2026-11-09', 'catalogueSha256': hashlib.sha256(raw).hexdigest(),
                     'editorial': 'Independent concise glosses in German, English and Dutch. Sources document name histories, not translations of entire dictionary entries. Uncertain origins are explicitly marked. Personal and geographical homonyms use taxon-specific overrides.'},
            'sources': sources, 'terms': dict(sorted(terms.items())), 'species': dict(sorted(species.items()))}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    output = ROOT / 'dist/scientific-names.json'
    text = json.dumps(build(), ensure_ascii=False, indent=2) + '\n'
    if args.check:
        assert output.read_text() == text, 'Scientific-name explanations need rebuilding'
    else:
        output.write_text(text)
    print(f'{"Checked" if args.check else "Built"} scientific-name explanations for all catalogue species in de/en/nl')
