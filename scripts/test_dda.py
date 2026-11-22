import copy
import datetime as dt
import importlib.util
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch, Mock

spec = importlib.util.spec_from_file_location('dda', Path(__file__).with_name('update-dda.py'))
dda = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dda)
source = json.loads(dda.SOURCE.read_text())
ids = {b['id'] for b in json.loads((dda.ROOT / 'dist/species.json').read_text())['species']}


class DdaTests(unittest.TestCase):
    def build(self, rows=None):
        return dda.snapshot(rows if rows is not None else source['records'], source['meta'], source['mapping'], ids)

    def test_full_reviewed_source(self):
        result = self.build()
        self.assertEqual(len(result['species']), 261)
        self.assertEqual(len(result['meta']['deprecated']), 1)
        self.assertEqual(result['meta']['review'], [])
        self.assertEqual(result, json.loads(dda.OUTPUT.read_text()))

    def test_known_code_and_label_changes(self):
        rows = copy.deepcopy(source['records'])
        rows[0].update(abbrev='Ax', germanName='Changed display name')
        self.assertEqual(self.build(rows)['species']['alepar2']['code'], 'Ax')

    def test_new_and_changed_concepts_require_review(self):
        rows = copy.deepcopy(source['records'])
        rows[0]['scientificName'] = 'Different concept'
        rows.append({**rows[1], 'speciesPKID': 99999999})
        result = self.build(rows)
        self.assertEqual(len(result['meta']['review']), 2)
        self.assertNotIn('alepar2', result['species'])

    def test_deprecated_and_removed_entries_are_not_active(self):
        rows = copy.deepcopy(source['records'])
        rows[0]['germanName'] = 'VERALTET: Alexandersittich'
        self.assertNotIn('alepar2', self.build(rows)['species'])
        self.assertNotIn('alepar2', self.build(rows[1:])['species'])

    def test_reject_malformed_and_duplicate_source(self):
        for rows in [[], {}, source['records'] + [source['records'][0]], [{**source['records'][0], 'abbrev': '<b>A</b>'}]]:
            with self.assertRaises(ValueError):
                self.build(rows)

    def test_last_good_snapshot_is_revalidated(self):
        previous = self.build()
        now = dt.datetime.now(dt.timezone.utc)
        validated = dda.validate_previous(previous, source['mapping'], ids, now)
        self.assertEqual(validated['species'], previous['species'])
        previous['meta']['fetchedAt'] = (now + dt.timedelta(days=1)).isoformat()
        with self.assertRaises(ValueError):
            dda.validate_previous(previous, source['mapping'], ids, now)

    def run_refresh(self, responses, args=()):
        out = Mock()
        with patch.object(dda, 'OUTPUT', out), patch.object(sys, 'argv', ['update-dda.py', *args]), patch.object(dda, 'request', side_effect=responses) as request:
            dda.main()
        return json.loads(out.write_text.call_args.args[0]), request.call_count

    def test_fresh_snapshot_avoids_second_request(self):
        previous = self.build()
        previous['meta']['fetchedAt'] = dt.datetime.now(dt.timezone.utc).isoformat()
        result, count = self.run_refresh([json.dumps(previous).encode()], ['--if-due'])
        self.assertEqual(count, 1)
        self.assertEqual(result['meta']['fetchedAt'], previous['meta']['fetchedAt'])

    def test_failed_refresh_retains_previous_timestamp_and_codes(self):
        previous = self.build()
        previous['records'][0]['abbrev'] = 'Ax'
        result, count = self.run_refresh([json.dumps(previous).encode(), OSError('down')])
        self.assertEqual(count, 2)
        self.assertEqual(result['species']['alepar2']['code'], 'Ax')
        self.assertEqual(result['meta']['fetchedAt'], previous['meta']['fetchedAt'])

    def test_failed_first_fetch_uses_bootstrap(self):
        result, _ = self.run_refresh([OSError('no previous'), OSError('down')])
        self.assertEqual(result, self.build())

    def test_forced_refresh_and_malformed_response(self):
        previous = self.build()
        rows = copy.deepcopy(source['records']); rows[0]['abbrev'] = 'Ax'
        result, count = self.run_refresh([json.dumps(previous).encode(), json.dumps(rows).encode()])
        self.assertEqual(count, 2)
        self.assertEqual(result['species']['alepar2']['code'], 'Ax')
        bad, _ = self.run_refresh([json.dumps(previous).encode(), b'{}'])
        self.assertEqual(bad['species'], previous['species'])


if __name__ == '__main__':
    unittest.main()
