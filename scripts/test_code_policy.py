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

    def test_scientific_codes_lead_even_when_a_common_code_is_more_specific(self):
        row = {'com_quick_codes': 'ABCD', 'banding_code': 'EFGH', 'sci_quick_codes': 'IJKL ABCD'}
        self.assertEqual(ranked_codes(row, {'ABCD': 1, 'EFGH': 1, 'IJKL': 2}), ['ABCD', 'IJKL', 'EFGH'])

    def test_real_world_species_have_specific_primary_codes(self):
        birds = {b['id']: b for b in json.loads((ROOT/'dist/species.json').read_text())['species']}
        expected = {'taibeg1': 'ANFA', 'tunbeg1': 'ANSE', 'cangoo': 'BRCA',
                    'cacgoo1': 'BRHU', 'eurspa1': 'ACNI', 'eurbla': 'TUME',
                    'skylar': 'ALAR', 'grecor': 'PHCA', 'eurjay1': 'GAGL'}
        for code, primary in expected.items():
            self.assertEqual(birds[code]['codes'][0], primary, code)
        source = json.loads((ROOT/'data/code-records.json').read_text())
        self.assertEqual(set(source['meta']['exceptions']), {'spofly1'})
        for b in birds.values():
            counts = source['speciesCounts']
            self.assertIn(b['codes'][0], b['scientificCodes'])
            self.assertEqual(counts[b['codes'][0]], min(counts[c] for c in b['scientificCodes']))
            self.assertTrue(all(c not in b['scientificCodes'] for c in b['codes'][len(b['scientificCodes']):]))


if __name__ == '__main__':
    unittest.main()
