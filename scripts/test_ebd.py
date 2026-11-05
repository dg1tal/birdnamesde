import importlib.util
import json
from collections import Counter
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('ebd', Path(__file__).with_name('import-ebd.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def sample(identifier='S1', group='', date='2021-03-01', complete='1', protocol='Traveling',
           country='DE', state='DE-BY', county='DE-BY-GAP'):
    return (identifier, group, country, state, 'Bayern', county, 'Garmisch-Partenkirchen', date, complete, protocol)


class EBDTests(unittest.TestCase):
    def select(self, records):
        labels, stats = {'DE': 'Deutschland'}, Counter()
        return m.select_checklists(records, 'DE', labels, stats), labels, stats

    def test_representative_is_deterministic_and_zero_lists_survive(self):
        records = [sample('S2', 'G1'), sample('S1', 'G1'), sample('S3')]
        selected, labels, stats = self.select(records)
        reverse, _, _ = self.select(reversed(records))
        self.assertEqual(selected, reverse)
        self.assertEqual(set(selected), {'S1', 'S3'})
        self.assertEqual(stats['eligibleSamplingRows'], 3)
        detections, _ = m.collect_detections([
            ('S2', 'a', 'species', 'A a', '1', '', 'X'),
            ('S1', 'a', 'species', 'A a', '1', '', 'X'),
            ('S1', 'sub-a', 'issf', 'A a', '1', '', '4'),
        ], selected, ['a'], {'A a': 'a'}, {'a': 'a', 'sub-a': 'a'}, Counter())
        data = m.aggregate(selected, detections, ['a'], labels)
        for region in data:
            spring = region['seasons']['spring']
            self.assertEqual(spring['sample'], 2)
            self.assertEqual(spring['groups']['frequent'], ['a'])
            self.assertEqual(spring['annualSamples']['2021'], 2)

    def test_filters_and_border_hierarchy(self):
        records = [sample(), sample('incomplete', complete='0'), sample('banding', protocol='Banding'),
                   sample('old', date='2020-12-31'), sample('new', date='2026-01-01'),
                   sample('nfc', protocol='Nocturnal Flight Call Count'),
                   sample('border', county='DE-BW-X')]
        selected, labels, stats = self.select(records)
        self.assertEqual(set(selected), {'S1', 'border'})
        self.assertEqual(selected['border'][2], ('DE', 'DE-BY'))
        self.assertEqual(stats['countyHierarchyMismatch'], 1)
        with self.assertRaises(ValueError):
            self.select([sample(country='NL')])

    def test_accepted_presence_exact_mapping_and_unresolved_concepts(self):
        selected, _, _ = self.select([sample()])
        observations = [
            ('S1', 'a', 'species', 'A a', '1', '', 'X'),
            ('S1', 'b', 'species', 'B b', '0', '', '1'),
            ('S1', 'c', 'species', 'C c', '1', 'X', '1'),
            ('S1', 'd', 'species', 'D d', '1', '', '0'),
            ('S1', 'e', 'slash', 'E e', '1', '', '1'),
            ('S1', 'unknown', 'species', 'Changed concept', '1', '', '1'),
        ]
        catalog = ['a', 'b', 'c', 'd', 'e']
        detections, unresolved = m.collect_detections(observations, selected, catalog,
            {'Changed concept': 'a'}, {x: x for x in catalog}, Counter())
        self.assertEqual(detections['S1'], 1)
        self.assertEqual(unresolved, {'Changed concept': 1})

    def test_exact_thresholds_year_support_and_calendar_winter(self):
        selected = {}
        for year in range(2021, 2024):
            for n in range(100):
                selected[f'{year}-{n}'] = (year, 0, ('DE',))
        # 30/300 = 10%; 3/300 = 1%; 1/300 is rare. No detection is not rare.
        detections = {key: (1 if i < 30 else 0) | (2 if i < 3 else 0) | (4 if i < 1 else 0)
                      for i, key in enumerate(selected)}
        winter = m.aggregate(selected, detections, ['a', 'b', 'c', 'zero'], {'DE': 'Germany'})[0]['seasons']['winter']
        self.assertEqual(winter['groups'], {'frequent': ['a'], 'medium': ['b'], 'rare': ['c']})
        self.assertEqual(winter['years'], 3)
        selected, _, _ = self.select([sample('jan', date='2021-01-01'), sample('dec', date='2021-12-31')])
        self.assertEqual({value[:2] for value in selected.values()}, {(2021, 0)})

    def test_archive_roundtrip_terms_and_missing_columns(self):
        catalog, scientific, mapping = m.taxon_mapping()
        concept = next(c for c, bird in mapping.items() if bird == catalog[0])
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'ebd_DE_smp_relSep-2026.zip'
            with zipfile.ZipFile(path, 'w') as z:
                z.writestr(path.stem + '_sampling.txt', '\t'.join(m.SAMPLING_FIELDS) + '\n' + '\t'.join(sample()) + '\n')
                z.writestr(path.stem + '.txt', '\t'.join(m.OBS_FIELDS) + '\n' + '\t'.join(('S1', concept, 'species', '', '1', '', 'X')) + '\n')
                z.writestr('terms_of_use.txt', 'fixture terms')
                z.writestr('recommended_citation.txt', 'fixture citation')
            output, terms = m.build([path])
            self.assertEqual(terms, 'fixture terms')
            self.assertEqual(output['provenance'][0]['citation'], 'fixture citation')
            self.assertEqual(output['regions'][0]['seasons']['spring']['ids'], [catalog[0]])
            self.assertNotIn('S1', json.dumps(output))
            with self.assertRaises(ValueError):
                m.build([path, path])
            with zipfile.ZipFile(path, 'a') as z:
                z.writestr('bad.txt', 'MISSING\nvalue\n')
            with zipfile.ZipFile(path) as z:
                with self.assertRaises(ValueError):
                    list(m.rows(z, 'bad.txt', m.SAMPLING_FIELDS))

    def test_publication_guard_rejects_renamed_raw_files(self):
        spec = importlib.util.spec_from_file_location('guard', Path(__file__).with_name('check-private-ebd.py'))
        guard = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(guard)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'innocent.tsv'
            path.write_text('OBSERVER ID\tSAMPLING EVENT IDENTIFIER\tOBSERVATION DATE\n')
            self.assertTrue(guard.is_private(path))
            path.write_text('{"sample": 300, "ids": []}')
            self.assertFalse(guard.is_private(path))
            for name in ['data.zip', 'data.tar', 'data.tar.gz', 'ebd_DE_sampling.txt']:
                self.assertTrue(guard.is_private(Path(directory) / name))

    def test_preview_contains_only_consistent_aggregates(self):
        path = m.ROOT / 'data/ebd-seasonal-preview.json'
        if not path.exists():
            self.skipTest('No real import preview yet')
        data = json.loads(path.read_text())
        catalog = set(m.taxon_mapping()[0])
        countries = {p['country'] for p in data['provenance']}
        self.assertEqual(countries, {'DE', 'NL', 'GB'})
        self.assertEqual(data['status'], 'import-preview-not-active')
        self.assertTrue(all(not p['originalDataPublished'] for p in data['provenance']))
        for audit in data['provenance']:
            country = next(r for r in data['regions'] if r['code'] == audit['country'])
            self.assertEqual(sum(s['sample'] for s in country['seasons'].values()),
                             audit['statistics']['independentChecklists'])
            self.assertFalse(audit['unresolvedCatalogTaxa'])
        for region in data['regions']:
            for season in region['seasons'].values():
                self.assertEqual(season['sample'], sum(season['annualSamples'].values()))
                self.assertEqual(season['years'], sum(n >= 100 for n in season['annualSamples'].values()))
                ids = sum(season['groups'].values(), [])
                self.assertEqual(len(ids), len(set(ids)))
                self.assertTrue(set(ids) <= catalog)
                self.assertEqual(set(season['ids']), set(season['groups']['frequent'] + season['groups']['medium']))


if __name__ == '__main__':
    unittest.main()
