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
            self.assertEqual(value, {'sample': 600, 'years': 5, 'ids': ['threshold'], 'groups': {'frequent': [], 'medium': ['threshold'], 'rare': ['below']}})
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

    def test_group_boundaries_and_no_detection(self):
        annual = {y: {'sample': [10] * 48} for y in m.YEARS}
        pooled = {'sample': [50] * 48, 'species': {'frequent': [.1]*48, 'medium': [.01]*48, 'rare': [.00999]*48, 'zero': [0]*48}}
        groups = m.seasonal_sets(pooled, annual)['autumn']['groups']
        self.assertEqual(groups, {'frequent': ['frequent'], 'medium': ['medium'], 'rare': ['rare']})

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

    def test_archived_histogram_provenance(self):
        # Historical histogram audit remains available after EBD activation.
        # Its original samples must not be compared with the new EBD estimates.
        root = Path(__file__).resolve().parents[1]
        audit = json.loads((root / 'data/seasonal-histogram-provenance.json').read_text())
        self.assertEqual(len(audit['regions']), 17)
        for region in audit['regions']:
            self.assertEqual(len(region['files']), 6)
            for entry in region['files']:
                self.assertEqual(len(entry['sha256']), 64)
                self.assertTrue(entry['source'].startswith('https://ebird.org/barchart?'))
            for value in region['seasons'].values():
                self.assertEqual(value['ready'], value['sample'] >= 300 and value['supportedYears'] >= 3)
        self.assertFalse(audit['originalExportsPublished'])


if __name__ == '__main__':
    unittest.main()
