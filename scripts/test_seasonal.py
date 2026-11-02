import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
spec = importlib.util.spec_from_file_location('seasonal', Path(__file__).with_name('build-seasonal.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class SeasonalTests(unittest.TestCase):
    def test_weighting_and_three_year_support(self):
        annual = {year: {'sample': [10] * 48} for year in m.YEARS}
        pooled = {'sample': [50] * 48, 'species': {'threshold': [.01] * 48, 'below': [.009] * 48}}
        sets = m.seasonal_sets(pooled, annual)
        for value in sets.values():
            self.assertEqual(value, {'sample': 600, 'years': 5, 'ids': ['threshold']})
        # A large pooled sample from a single year must not pass the multi-year gate.
        annual = {year: {'sample': [50 if year == 2025 else 0] * 48} for year in m.YEARS}
        self.assertEqual(m.seasonal_sets(pooled, annual)['summer']['years'], 1)

    def test_weighted_rate_not_average_of_bins(self):
        counts = [1] * 48
        counts[20] = 1000  # One June bin dominates the summer checklist denominator.
        annual = {y: {'sample': counts if y == 2025 else [0] * 48} for y in m.YEARS}
        rates = [0] * 48
        rates[21] = 1  # Unweighted mean would incorrectly pass 1%.
        pooled = {'sample': counts, 'species': {'misleading': rates}}
        self.assertEqual(m.seasonal_sets(pooled, annual)['summer']['ids'], [])

    def test_mismatched_individual_years_rejected(self):
        annual = {y: {'sample': [1] * 48} for y in m.YEARS}
        with self.assertRaises(ValueError):
            m.seasonal_sets({'sample': [6] * 48, 'species': {}}, annual)

    def test_invalid_export_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'sample.tsv'
            path.write_text('Sample Size:\t' + '\t'.join(['1'] * 48) + '\nA (<em>A a</em>)\t' + '\t'.join(['nan'] * 48))
            with self.assertRaises(ValueError):
                m.read_histogram(path, {'A a': 'a'}, {'A a': 'a'})
            path.write_text('<html>Sign in</html>')
            with self.assertRaises(ValueError):
                m.read_histogram(path)

    def test_published_coverage_and_provenance(self):
        root = Path(__file__).resolve().parents[1]
        data = json.loads((root / 'dist/seasonal-species.json').read_text())
        audit = json.loads((root / 'data/seasonal-histogram-provenance.json').read_text())
        self.assertTrue(data['experimental'])
        states = {r['code']: r for r in data['regions'] if r['code'].count('-') == 1}
        self.assertEqual(set(states), {'DE-BW','DE-BY','DE-BE','DE-BB','DE-HB','DE-HH','DE-HE','DE-MV','DE-NI','DE-NW','DE-RP','DE-SL','DE-SN','DE-ST','DE-SH','DE-TH'})
        for code, r in states.items():
            self.assertEqual(sum(s['sample'] >= 300 and s['years'] >= 3 for s in r['seasons'].values()), 0 if code == 'DE-SL' else 4)
        self.assertEqual(len(audit['regions']), 17)
        bycode = {r['code']: r for r in data['regions']}
        for r in audit['regions']:
            self.assertEqual(len(r['files']), 6)
            for season, value in r['seasons'].items():
                self.assertEqual(value['species'], len(bycode[r['code']]['seasons'][season]['ids']))
                self.assertEqual(value['sample'], bycode[r['code']]['seasons'][season]['sample'])
        self.assertFalse(audit['originalExportsPublished'])


if __name__ == '__main__':
    unittest.main()
