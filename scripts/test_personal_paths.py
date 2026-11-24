import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location(
    'personal_paths', Path(__file__).with_name('check-personal-paths.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class PersonalPathTests(unittest.TestCase):
    def test_tracked_files_have_no_personal_home_paths(self):
        m.check()

    def test_rejects_home_paths_in_prose_commands_and_json(self):
        for directory in ['Users', 'home']:
            path = '/'.join(['', directory, 'example', 'project', 'helper.py'])
            content = f'Safe line\nRun `{path}`.\n'.encode()
            self.assertEqual(m.personal_path_lines(content), [2])
        path = '\\'.join(['C:', 'Users', 'example', 'project', 'helper.py'])
        for value in [path, path.replace('\\', '\\\\')]:
            self.assertEqual(m.personal_path_lines(f'"{value}"'.encode()), [1])

    def test_allows_portable_paths_and_source_urls(self):
        content = b'\n'.join([
            b'python3 scripts/helper.py',
            b'"$HOME/EBD/downloads/archive.zip"',
            b'https://example.org/home/project/page',
            b'https://example.org/users/123/photos',
        ])
        self.assertEqual(m.personal_path_lines(content), [])


if __name__ == '__main__':
    unittest.main()
