#!/usr/bin/env python3
"""Reject private eBird archives/raw exports from the Git index and Pages tree."""
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
RAW = re.compile(r'(?:\.(?:zip|tar)(?:\..*)?$|(?:^|/)ebd_[^/]*\.txt$)', re.I)


def is_private(path):
    if RAW.search(path.name):
        return True
    if path.is_file():
        with path.open('rb') as stream:
            header = set(stream.readline(4096).strip().split(b'\t'))
        return {b'SAMPLING EVENT IDENTIFIER', b'OBSERVER ID', b'OBSERVATION DATE'} <= header
    return False


def check():
    indexed = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
    published = [str(p.relative_to(ROOT)) for p in (ROOT / 'dist').rglob('*') if p.is_file()]
    rejected = sorted({name for name in indexed + published if name and is_private(ROOT / name)})
    if rejected:
        raise SystemExit('Private archive/raw export detected: ' + ', '.join(rejected))
    print('No private archives or raw EBD exports in Git index or dist/.')


if __name__ == '__main__':
    check()
