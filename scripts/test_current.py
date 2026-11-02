import importlib.util
from pathlib import Path
import unittest
import datetime as dt
spec=importlib.util.spec_from_file_location('current',Path(__file__).with_name('update-current.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class CurrentTests(unittest.TestCase):
 def test_only_valid_known_fresh_records(self):
  now=dt.datetime(2026,11,2,tzinfo=dt.timezone.utc)
  rows=[{'speciesCode':'a','obsDt':'2026-10-30 12:00','obsValid':True,'lat':1,'userDisplayName':'private'}, {'speciesCode':'a','obsDt':'2026-11-01','obsValid':True},{'speciesCode':'b','obsDt':'2026-11-02','obsValid':False},{'speciesCode':'unknown','obsDt':'2026-11-02','obsValid':True},{'speciesCode':'c','obsDt':'2026-10-01','obsValid':True},{'speciesCode':'d','obsDt':'2026-11-03','obsValid':True}]
  self.assertEqual(m.notable_records(rows,{'a','b','c','d'},now),[{'id':'a','observedOn':'2026-11-01','expiresOn':'2026-11-15'}])
 def test_failure_fallback_does_not_refresh_observation_or_snapshot(self):
  now=dt.datetime(2026,11,2,tzinfo=dt.timezone.utc)
  old={'updatedAt':'2026-10-25T00:00:00Z','records':[{'id':'a','observedOn':'2026-10-30','expiresOn':'2026-11-13','private':'omit'},{'id':'b','observedOn':'2026-10-01','expiresOn':'2026-10-15'}]}
  safe=m.sanitize(old,{'a','b'},now)
  self.assertEqual(safe['updatedAt'],old['updatedAt']);self.assertEqual(safe['records'],[{'id':'a','observedOn':'2026-10-30','expiresOn':'2026-11-13'}])
 def test_invalid_payload_rejected(self):
  with self.assertRaises(ValueError):m.notable_records({'error':'no'},set(),dt.datetime.now(dt.timezone.utc))
if __name__=='__main__':unittest.main()
