import csv
import hashlib
import importlib.util
import json
from pathlib import Path
import unittest
from code_policy import CODE_FIELDS

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('regions',ROOT/'scripts/update-regions.py')
regions=importlib.util.module_from_spec(spec);spec.loader.exec_module(regions)


class CatalogueTests(unittest.TestCase):
    def test_country_union_and_legacy_compatibility(self):
        data=json.loads((ROOT/'dist/species.json').read_text())
        birds={s['id']:s for s in data['species']}
        baseline=json.loads((ROOT/'data/catalog-baseline.json').read_text())['species']
        country_ids=set().union(*map(set,data['meta']['catalog']['countrySpecies'].values()))
        self.assertEqual(set(birds),country_ids|{s['id'] for s in baseline})
        self.assertEqual(data['meta']['catalog']['fingerprint'],hashlib.sha256('\n'.join(sorted(birds)).encode()).hexdigest())
        self.assertEqual(set(data['meta']['catalog']['countries']),regions.COUNTRY_CODES)
        self.assertEqual(set(data['meta']['catalog']['countrySpecies']),regions.COUNTRY_CODES)
        for original in baseline:
            for key,value in original.items():
                if key not in CODE_FIELDS:self.assertEqual(birds[original['id']][key],value)
        for code in ('eursha1','rebcho1','darwar1','roster','wilpta1'):
            self.assertIn(code,birds)
            self.assertIn(code,data['meta']['catalog']['countrySpecies']['GB'])
        with (ROOT/'data/taxonomy.csv').open(encoding='utf-8-sig') as stream:
            taxonomy={r['SPECIES_CODE']:r for r in csv.DictReader(stream)}
        self.assertTrue(all(taxonomy[code]['CATEGORY']=='species' for code in birds))

    def test_finnish_and_french_species_have_official_names_and_codes(self):
        data=json.loads((ROOT/'dist/species.json').read_text())
        birds={s['id']:s for s in data['species']}
        for country in ('FI','FR'):
            names=json.loads((ROOT/f'dist/languages/{country.lower()}.json').read_text())['species']
            self.assertTrue(set(data['meta']['catalog']['countrySpecies'][country]) <= names.keys())
        for country,ids in {'FI':['sibjay1','gyhchi','grgowl'],
                            'FR':['cornut1','corfin1','pitsan1']}.items():
            names=json.loads((ROOT/f'dist/languages/{country.lower()}.json').read_text())['species']
            for code in ids:
                self.assertIn(code,data['meta']['catalog']['countrySpecies'][country])
                self.assertTrue(birds[code]['de'])
                self.assertTrue(birds[code]['en'])
                self.assertTrue(birds[code]['codes'])
                self.assertTrue(names[code]['name'])

    def test_official_mapping_and_candidate_report(self):
        result=regions.make_list(['species','subspecies','hybrid','new','unknown'],'all',{'species'},'now',
                                 {'species':'species','subspecies':'species','hybrid':None,'new':'candidate'})
        self.assertEqual(result['ids'],['species'])
        self.assertEqual(result['catalogCandidates'],['candidate'])
        self.assertEqual(result['unknownTaxa'],['unknown'])

    def test_changed_catalogue_cannot_reuse_recent_cache(self):
        import datetime as dt
        now=dt.datetime.now(dt.timezone.utc)
        # A fresh old-format cache must still be rejected before any reuse.
        self.assertIsNone(regions.reusable_snapshot({'version':1,'recentDays':30,'regions':[]},set(),now,'new-catalogue'))


if __name__=='__main__':unittest.main()
