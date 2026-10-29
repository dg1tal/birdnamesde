import importlib.util
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location('update_regions',Path(__file__).with_name('update-regions.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class RegionTests(unittest.TestCase):
    def test_only_local_species_and_no_observation_fields(self):
        result=m.make_list([{'speciesCode':'eurbla','lat':52,'locName':'private','subId':'S1'},{'speciesCode':'newtaxon'}],'recent',{'eurbla'},'2026-01-01T00:00:00Z')
        self.assertEqual(result,{'ids':['eurbla'],'reportedTaxa':2,'updatedAt':'2026-01-01T00:00:00Z'})
    def test_alltime_dedup_and_intersection(self):
        self.assertEqual(m.make_list(['eurbla','eurbla','hybrid'],'all',{'eurbla'},'now')['ids'],['eurbla'])
    def test_invalid_response(self):
        for data in ({'error':'no'},['<script>']):
            with self.assertRaises(ValueError):m.make_list(data,'all',{'eurbla'},'now')
    def test_previous_is_whitelisted(self):
        data={'version':1,'regions':[{'code':'DE','recent':{'ids':['eurbla'],'reportedTaxa':1,'updatedAt':'2026-01-01T00:00:00Z','secret':'never-copy'}}]}
        self.assertNotIn('secret',m.safe_previous(data,{'eurbla'})['DE']['recent'])
        data['regions'][0]['recent']['ids']=['unknown']
        self.assertEqual(m.safe_previous(data,{'eurbla'})['DE'],{})
    def test_supported_countries(self):
        self.assertTrue(m.supported_region('GB'))
        self.assertTrue(m.supported_region('GB-ENG'))
        self.assertTrue(m.supported_region('NL'))
        self.assertTrue(m.supported_region('NL-NH'))
        self.assertFalse(m.supported_region('FR'))
        self.assertFalse(m.supported_region('NL/../../secret'))

    def test_no_cross_host_credential(self):
        with self.assertRaises(ValueError):m.request_json('https://example.com','fake-test-token')

if __name__=='__main__':unittest.main()
