import importlib.util
import datetime as dt
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
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
        self.assertTrue(m.supported_region('GB-ENG-LND'))
        self.assertFalse(m.supported_region('GB-ENG-LND-EXTRA'))
        self.assertTrue(m.supported_region('NL'))
        self.assertTrue(m.supported_region('NL-NH'))
        self.assertFalse(m.supported_region('FR'))
        self.assertFalse(m.supported_region('NL/../../secret'))

    def test_local_region_discovery_and_parent_validation(self):
        country={'code':'GB','nameDe':'UK','nameEn':'UK','expectedSubregions':1,'includeLocalRegions':True}
        calls=[]
        def fetch(path):
            calls.append(path)
            return [{'code':'GB-ENG','name':'England'}] if 'subnational1' in path else [{'code':'GB-ENG-LND','name':'London'}]
        with patch.object(m,'COUNTRIES',[country]):
            regions=m.discover_regions(fetch)
            self.assertEqual([r['parentCode'] for r in regions],[None,'GB','GB-ENG'])
            self.assertEqual(regions[-1]['code'],'GB-ENG-LND')
            self.assertIn('ref/region/list/subnational2/GB-ENG?fmt=json',calls)
            with self.assertRaises(AssertionError):
                m.discover_regions(lambda path:[{'code':'GB-ENG','name':'England'}] if 'subnational1' in path else [{'code':'GB-SCT-ORK','name':'Wrong parent'}])

    def test_local_region_last_good_snapshot(self):
        data={'version':1,'regions':[{'code':'GB-ENG-LND','recent':{'ids':['eurbla'],'reportedTaxa':1,'updatedAt':'2026-01-01T00:00:00Z'}}]}
        self.assertEqual(m.safe_previous(data,{'eurbla'})['GB-ENG-LND']['recent']['ids'],['eurbla'])

    def test_no_cross_host_credential(self):
        with self.assertRaises(ValueError):m.request_json('https://example.com','fake-test-token')

    def test_current_snapshot_is_reused_without_ebird_requests(self):
        now = dt.datetime.now(dt.timezone.utc)
        stamp = now.isoformat(timespec='seconds').replace('+00:00', 'Z')
        entry = {'ids':['eurbla'], 'reportedTaxa':1, 'updatedAt':stamp, 'secret':'discard'}
        snapshot = {'version':1, 'generatedAt':stamp, 'recentDays':30,
                    'regions':[{'code':'DE','country':'DE','parentCode':None,
                                'nameDe':'Deutschland','nameEn':'Germany',
                                'all':entry,'recent':entry}]}
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root/'dist').mkdir()
            (root/'dist/species.json').write_text(json.dumps({'species':[{'id':'eurbla'}]}))
            calls = []
            def fake_request(url, token=None):
                calls.append((url, token))
                return snapshot
            with patch.object(m,'ROOT',root), patch.object(m,'COUNTRIES',[{'code':'DE','nameDe':'Deutschland','nameEn':'Germany','expectedSubregions':0}]), patch.object(m,'COUNTRY_CODES',{'DE'}), patch.object(m,'request_json',fake_request), patch.object(m.sys,'argv',['update-regions.py','--if-due']), patch.dict(m.os.environ,{'EBIRD_API_KEY':''}):
                self.assertEqual(m.main(),0)
            self.assertEqual(calls,[(m.PREVIOUS,None)])
            output=json.loads((root/'dist/regions.json').read_text())
            self.assertEqual(output['regions'][0]['all']['ids'],['eurbla'])
            self.assertNotIn('secret',output['regions'][0]['all'])

    def test_stale_or_incomplete_snapshot_requires_refresh(self):
        now = dt.datetime.now(dt.timezone.utc)
        stamp = now.isoformat(timespec='seconds').replace('+00:00','Z')
        entry = {'ids':['eurbla'], 'reportedTaxa':1, 'updatedAt':stamp}
        region = {'code':'DE','country':'DE','parentCode':None,'nameDe':'Deutschland','nameEn':'Germany','all':entry,'recent':entry}
        snapshot = {'version':1,'generatedAt':stamp,'recentDays':30,'regions':[region]}
        with patch.object(m,'COUNTRIES',[{'code':'DE','nameDe':'Deutschland','nameEn':'Germany','expectedSubregions':0}]), patch.object(m,'COUNTRY_CODES',{'DE'}):
            self.assertIsNotNone(m.reusable_snapshot(snapshot,{'eurbla'},now))
            old = (now-m.REFRESH_INTERVAL).isoformat(timespec='seconds').replace('+00:00','Z')
            self.assertIsNone(m.reusable_snapshot({**snapshot,'regions':[{**region,'recent':{**entry,'updatedAt':old}}]},{'eurbla'},now))
            self.assertIsNone(m.reusable_snapshot({**snapshot,'regions':[{**region,'recent':None}]},{'eurbla'},now))
            self.assertIsNone(m.reusable_snapshot({**snapshot,'regions':[{**region,'nameDe':'<script>'*30}]},{'eurbla'},now))

if __name__=='__main__':unittest.main()
