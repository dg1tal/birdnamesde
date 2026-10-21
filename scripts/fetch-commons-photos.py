"""Restore missing licensed Commons thumbnails from the recorded provenance manifest."""
import hashlib,json,pathlib,time,urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
photos=json.loads((ROOT/'dist/photos.json').read_text())['photos']
for sid,p in photos.items():
    path=ROOT/'dist'/p['local']
    if path.exists():
        if hashlib.sha256(path.read_bytes()).hexdigest()!=p['localSha256']:
            raise SystemExit(f'Existing file differs; leaving it untouched: {path}')
        continue
    req=urllib.request.Request(p['downloadUrl'],headers={'User-Agent':'BirdNamesDE/1.0 (educational Commons image reuse)'})
    with urllib.request.urlopen(req,timeout=60) as response:blob=response.read()
    if hashlib.sha256(blob).hexdigest()!=p['localSha256']:
        raise SystemExit(f'Remote image changed; review source and license before updating: {sid}')
    path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(blob)
    time.sleep(.5)
print(f'All {len(photos)} Commons thumbnails present and verified.')
