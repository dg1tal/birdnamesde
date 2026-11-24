#!/usr/bin/env python3
"""Reject personal absolute home-directory paths in tracked files."""
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PERSONAL_PATH = re.compile(
    rb'(?<![A-Za-z0-9_:/\\.-])(?:/(?:Users|home)/[^/\s]+/|[A-Za-z]:\\+Users\\+[^\\\s]+\\+)',
    re.IGNORECASE,
)


def personal_path_lines(content):
    return [number for number, line in enumerate(content.splitlines(), 1)
            if PERSONAL_PATH.search(line)]


def check():
    indexed = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT)
    rejected = []
    for name in indexed.split(b'\0'):
        if not name:
            continue
        path = ROOT / name.decode('utf-8')
        if path.is_file():
            rejected.extend(f'{path.relative_to(ROOT)}:{line}'
                            for line in personal_path_lines(path.read_bytes()))
    if rejected:
        raise SystemExit('Personal home-directory paths detected:\n' + '\n'.join(rejected))
    print('No personal absolute home-directory paths in tracked files.')


if __name__ == '__main__':
    check()
