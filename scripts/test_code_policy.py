import json
import unittest

from code_policy import ROOT, ranked_codes


class CodePolicyTests(unittest.TestCase):
    def test_more_specific_common_code_beats_banding(self):
        row = {'com_quick_codes': 'ABCD EFGH', 'banding_code': 'IJKL'}
        self.assertEqual(ranked_codes(row, {'ABCD': 3, 'EFGH': 1, 'IJKL': 2}),
                         ['EFGH', 'IJKL', 'ABCD'])

    def test_ties_prefer_banding_and_duplicates_are_removed(self):
        row = {'com_quick_codes': 'EFGH ABCD EFGH', 'banding_code': 'EFGH'}
        self.assertEqual(ranked_codes(row, {'ABCD': 1, 'EFGH': 1}), ['EFGH', 'ABCD'])

    def test_real_world_species_have_specific_primary_codes(self):
        birds = {b['id']: b for b in json.loads((ROOT/'dist/species.json').read_text())['species']}
        expected = {'taibeg1': 'TABG', 'tunbeg1': 'TUBG', 'cangoo': 'CANG',
                    'cacgoo1': 'CACG', 'eurspa1': 'ESPA', 'eurbla': 'EUBB',
                    'skylar': 'EUSK', 'grecor': 'BLSH'}
        for code, primary in expected.items():
            self.assertEqual(birds[code]['codes'][0], primary, code)
        source = json.loads((ROOT/'data/code-records.json').read_text())
        self.assertEqual(set(source['meta']['exceptions']), {'spofly1'})
        for b in birds.values():
            counts = source['speciesCounts']
            self.assertEqual(counts[b['codes'][0]], min(counts[c] for c in b['codes']))


if __name__ == '__main__':
    unittest.main()
