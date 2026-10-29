#!/usr/bin/env python3
"""Fetch public regional species IDs in Actions; never publish credentials/observations."""
import datetime as dt
import json
import os
from pathlib import Path
import re
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
PREVIOUS = 'https://dg1tal.github.io/birdnamesde/regions.json'
API = 'https://api.ebird.org/v2/'
COUNTRIES=json.loads((ROOT/'data/region-countries.json').read_text())
COUNTRY_CODES={c['code'] for c in COUNTRIES}

def supported_region(code):
    return isinstance(code,str) and bool(re.fullmatch(r'[A-Z]{2}(?:-[A-Z0-9]{1,4}){0,2}',code)) and code.split('-')[0] in COUNTRY_CODES
GERMAN = {'DE-BW':'Baden-Württemberg','DE-BY':'Bayern','DE-BE':'Berlin','DE-BB':'Brandenburg','DE-HB':'Bremen','DE-HH':'Hamburg','DE-HE':'Hessen','DE-MV':'Mecklenburg-Vorpommern','DE-NI':'Niedersachsen','DE-NW':'Nordrhein-Westfalen','DE-RP':'Rheinland-Pfalz','DE-SL':'Saarland','DE-SN':'Sachsen','DE-ST':'Sachsen-Anhalt','DE-SH':'Schleswig-Holstein','DE-TH':'Thüringen'}

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

RATE_LOCK=threading.Lock()
LAST_REQUEST=0.0

def pace_api():
    global LAST_REQUEST
    with RATE_LOCK:
        delay=0.5-(time.monotonic()-LAST_REQUEST)
        if delay>0:time.sleep(delay)
        LAST_REQUEST=time.monotonic()

def request_json(url, token=None):
    headers = {'User-Agent':'BirdNames-DE-regional-learning/1.0', 'Accept':'application/json'}
    if token:
        if not url.startswith(API):
            raise ValueError('Credential destination rejected')
        headers['X-eBirdApiToken'] = token
        pace_api()
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.build_opener(NoRedirect).open(req, timeout=30) as response:
        raw = response.read(5_000_001)
        if len(raw) > 5_000_000:
            raise ValueError('Response too large')
        return json.loads(raw)

def make_list(payload, mode, known, now):
    if not isinstance(payload, list):
        raise ValueError('Expected list')
    if mode == 'all':
        if not all(isinstance(x,str) and re.fullmatch(r'[a-z0-9]+',x) for x in payload):
            raise ValueError('Unexpected species codes')
        codes = set(payload)
    else:
        if not all(isinstance(x,dict) and isinstance(x.get('speciesCode'),str) for x in payload):
            raise ValueError('Unexpected observation schema')
        codes = {x['speciesCode'] for x in payload}
    return {'ids':sorted(codes & known), 'reportedTaxa':len(codes), 'updatedAt':now}

def safe_previous(data, known):
    """Only allow whitelisted public fields back into an output snapshot."""
    if not isinstance(data,dict) or data.get('version') != 1:
        return {}
    result = {}
    for r in data.get('regions',[]):
        if not isinstance(r,dict) or not supported_region(r.get('code')):
            continue
        lists = {}
        for mode in ('all','recent'):
            item = r.get(mode)
            if not isinstance(item,dict):
                continue
            ids = item.get('ids'); stamp = item.get('updatedAt'); count = item.get('reportedTaxa')
            try:
                parsed = dt.datetime.fromisoformat(stamp.replace('Z','+00:00'))
                assert parsed.tzinfo and parsed <= dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=5)
                assert isinstance(ids,list) and all(isinstance(x,str) and x in known for x in ids)
                assert isinstance(count,int) and len(set(ids)) <= count <= 100000
            except (TypeError,ValueError,AssertionError,AttributeError):
                continue
            lists[mode] = {'ids':sorted(set(ids)), 'reportedTaxa':count, 'updatedAt':stamp}
        result[r['code']] = lists
    return result

def discover_regions(fetch):
    """Retain the upstream hierarchy; never invent county boundaries or region IDs."""
    regions=[]
    for country in COUNTRIES:
        code=country['code']
        states=fetch(f'ref/region/list/subnational1/{code}?fmt=json')
        assert isinstance(states,list) and len(states)==country['expectedSubregions']
        assert len({r['code'] for r in states})==len(states)
        assert all(supported_region(r['code']) and r['code'].startswith(code+'-') and r['code'].count('-')==1 and isinstance(r.get('name'),str) and 0<len(r['name'])<=150 for r in states)
        if code=='DE':assert {r['code'] for r in states}==set(GERMAN)
        if country.get('subregionNamesDe'):assert {r['code'] for r in states}==set(country['subregionNamesDe'])
        regions.append({'code':code,'country':code,'parentCode':None,'nameDe':country['nameDe'],'nameEn':country['nameEn']})
        for state in sorted(states,key=lambda r:r['name']):
            parent=state['code']
            regions.append({'code':parent,'country':code,'parentCode':code,'nameDe':country.get('subregionNamesDe',{}).get(parent,GERMAN.get(parent,state['name'])),'nameEn':state['name']})
            if country.get('includeLocalRegions'):
                local=fetch(f'ref/region/list/subnational2/{parent}?fmt=json')
                assert isinstance(local,list) and len(local)<=400
                assert len({r['code'] for r in local})==len(local)
                assert all(supported_region(r['code']) and r['code'].startswith(parent+'-') and r['code'].count('-')==2 and isinstance(r.get('name'),str) and 0<len(r['name'])<=150 for r in local)
                regions.extend({'code':r['code'],'country':code,'parentCode':parent,'nameDe':r['name'],'nameEn':r['name']} for r in sorted(local,key=lambda r:r['name']))
    assert len(regions)<=512 and len({r['code'] for r in regions})==len(regions)
    return regions

def main():
    token = os.environ.get('EBIRD_API_KEY','').strip()
    if not token or any(c.isspace() for c in token):
        print('EBIRD_API_KEY is missing or malformed; no output generated.',file=sys.stderr)
        return 1
    known = {s['id'] for s in json.loads((ROOT/'dist/species.json').read_text())['species']}
    previous = {}
    # Previous Pages snapshot is read without any credential. Failed fetches leave local fallback available.
    candidates = []
    local = ROOT/'dist/regions.json'
    if local.exists():
        try: candidates.append(json.loads(local.read_text()))
        except ValueError: pass
    try: candidates.append(request_json(PREVIOUS))
    except (urllib.error.URLError,ValueError): pass
    for candidate in candidates:
        for code, lists in safe_previous(candidate, known).items():
            for mode,item in lists.items():
                old = previous.setdefault(code,{}).get(mode)
                if not old or item['updatedAt'] > old['updatedAt']:
                    previous[code][mode] = item
    now = dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')
    try:
        regions=discover_regions(lambda path:request_json(API+path,token))
    except (urllib.error.URLError,ValueError,AssertionError,KeyError,TypeError):
        print('Could not verify configured eBird regions; leaving the existing deployment untouched.',file=sys.stderr)
        return 1
    failures=0
    print(f'Discovered {len(regions)} regions, including {sum(r["code"].count("-")==2 for r in regions)} local regions. Refreshing with at most 3 workers and 2 request starts/second.',flush=True)
    def refresh(region,mode,path):
        try:
            return region,mode,make_list(request_json(API+path,token),mode,known,now),False
        except (urllib.error.URLError,ValueError,TypeError,TimeoutError):
            return region,mode,previous.get(region['code'],{}).get(mode),True
    with ThreadPoolExecutor(max_workers=3) as executor:
        tasks=[]
        for region in regions:
            code=region['code']
            for mode,path in [('all',f'product/spplist/{code}'),('recent',f'data/obs/{code}/recent?back=30&cat=species&includeProvisional=false')]:
                tasks.append(executor.submit(refresh,region,mode,path))
        completed=0
        for task in as_completed(tasks):
            region,mode,item,failed=task.result()
            region[mode]=item;completed+=1
            if failed:
                failures+=1
                print(f'Warning: {region["code"]}/{mode} refresh failed; '+('retaining previous snapshot.' if item else 'list unavailable.'),flush=True)
            if completed%50==0:print(f'Refreshed {completed}/{len(tasks)} lists.',flush=True)
    if not any(r.get('all') or r.get('recent') for r in regions):
        print('No usable regional lists; leaving the existing deployment untouched.',file=sys.stderr)
        return 1
    output = {'version':1,'generatedAt':now,'recentDays':30,'countries':[{k:c[k] for k in ('code','nameDe','nameEn')} for c in COUNTRIES],'regions':regions}
    encoded = json.dumps(output,ensure_ascii=False,indent=2)+'\n'
    if token in encoded:
        print('Refusing to output credential material.',file=sys.stderr)
        return 1
    temporary = ROOT/'dist/regions.json.tmp'
    temporary.write_text(encoded)
    temporary.replace(local)
    print(f'Prepared {len(regions)} regions; {len(regions)*2-failures}/{len(regions)*2} lists refreshed. Only species IDs, labels, counts and timestamps are published.')
    return 0

if __name__ == '__main__':
    sys.exit(main())
