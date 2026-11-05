import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('activation', Path(__file__).with_name('build-ebd-seasonal.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class EBDActivationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.preview = m.load(ROOT / 'data/ebd-seasonal-preview.json')
        cls.snapshot = m.load(ROOT / 'data/ebd-region-match.json')
        cls.ids = {s['id'] for s in m.load(ROOT / 'dist/species.json')['species']}
        cls.data, cls.audit = m.build(cls.preview, cls.snapshot, cls.ids)

    def test_all_countries_exact_regions_and_halton_fallback(self):
        self.assertEqual(len(self.data['regions']), 144)
        self.assertEqual({r['code'] for r in self.data['regions']}, set(self.audit['regionMatch']['matchedCodes']))
        self.assertEqual(self.audit['regionMatch']['withoutHistoricalSample'], ['GB-ENG-HAL'])
        self.assertEqual(self.audit['regionMatch']['unmatchedEbdCodes'], [])
        original = {r['code']: r for r in self.preview['regions']}
        for region in self.data['regions']:
            for season, value in region['seasons'].items():
                expected = original[region['code']]['seasons'][season]
                self.assertEqual(value['sample'], expected['sample'])
                self.assertEqual(value['years'], expected['years'])
                self.assertEqual(value['groups'], expected['groups'])
        countries = {r['code']: r for r in self.data['regions'] if '-' not in r['code']}
        self.assertEqual(set(countries), {'DE', 'NL', 'GB'})
        self.assertTrue(all(s['sample'] >= 300 and s['years'] >= 3 for r in countries.values() for s in r['seasons'].values()))

    def test_reject_changed_period_thresholds_taxonomy_and_region(self):
        mutations = [lambda p: p.update(period='2022–2026'),
                     lambda p: p['method']['thresholds'].update(frequentAtLeast=.2),
                     lambda p: p['method'].update(minimumSample=200),
                     lambda p: p['provenance'][0].update(citation=''),
                     lambda p: p['provenance'][0].update(unresolvedCatalogTaxa={'unknown': 1}),
                     lambda p: p['regions'][0].update(code='DE-UNKNOWN'),
                     lambda p: p['regions'][0]['seasons']['winter']['groups']['rare'].append('invented')]
        for mutate in mutations:
            preview = copy.deepcopy(self.preview)
            mutate(preview)
            with self.subTest(mutation=mutate), self.assertRaises(ValueError):
                m.build(preview, self.snapshot, self.ids)

    def test_sample_gates_and_source_metadata(self):
        regions = {r['code']: r for r in self.data['regions']}
        for code, supported in [('DE-SL', []), ('NL-DR', ['spring', 'summer']), ('DE-BY-GAP', ['spring', 'summer'])]:
            self.assertEqual([k for k, s in regions[code]['seasons'].items() if s['sample'] >= 300 and s['years'] >= 3], supported)
        self.assertEqual(self.data['period'], '2021–2025')
        self.assertEqual(self.data['dataset']['id'], m.DATASET_ID)
        published = m.load(ROOT / 'dist/seasonal-species.json')
        self.assertEqual(published, self.data)
        self.assertNotIn('annualSamples', json.dumps(published))
        self.assertFalse(self.audit['originalDataPublished'])

    def test_method_page_coverage_tracks_data_and_missing_region(self):
        page = m.method_page(self.data, self.audit, self.snapshot)
        self.assertIn('GB-ENG-HAL', page)
        self.assertEqual(page.count('<th scope="row">'), len(self.snapshot['regions']))
        self.assertIn('Regionsliste / Regional list<br>0 Listen', page)
        self.assertIn('September 2026', page)
        for source in ['seasonal-provenance.json', 'ebd-terms.txt', 'seasonal-species.json']:
            self.assertIn(f'href="{source}"', page)
        self.assertIn(self.audit['sources'][0]['citation'], page)
        changed = copy.deepcopy(self.snapshot)
        changed['regions'][0]['nameDe'] = '<img src=x>'
        safe = m.method_page(self.data, self.audit, changed)
        self.assertIn('&lt;img src=x&gt;', safe)
        self.assertNotIn('<img src=x>', safe)


if __name__ == '__main__':
    unittest.main()
