#!/usr/bin/env python3
"""Publish only species IDs and dates from valid recent notable eBird records."""
import datetime as dt
import importlib.util
import json
import os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
spec=importlib.util.spec_from_file_location('regions',Path(__file__).with_name('update-regions.py'))
regions=importlib.util.module_from_spec(spec);spec.loader.exec_module(regions)
ROOT=Path(__file__).resolve().parents[1]

def sanitize(item,known,now):
    if not isinstance(item,dict):return None
    try:
        stamp=dt.datetime.fromisoformat(item['updatedAt'].replace('Z','+00:00'))
        if not stamp.tzinfo or stamp>now+dt.timedelta(minutes=5):return None
        records=[]
        for r in item['records']:
            observed=dt.date.fromisoformat(r['observedOn']);expires=dt.date.fromisoformat(r['expiresOn'])
            if r['id'] in known and observed<=now.date() and expires==observed+dt.timedelta(days=14) and expires>now.date():
                records.append({'id':r['id'],'observedOn':observed.isoformat(),'expiresOn':expires.isoformat()})
        return {'updatedAt':stamp.isoformat(timespec='seconds').replace('+00:00','Z'),'records':records}
    except (KeyError,TypeError,ValueError,AttributeError):return None

def notable_records(payload,known,now):
    if not isinstance(payload,list):raise ValueError('Invalid notable response')
    latest={}
    for row in payload:
        if not isinstance(row,dict):raise ValueError('Invalid notable record')
        key=row.get('speciesCode')
        if key not in known or row.get('obsValid') is not True:continue
        try:observed=dt.date.fromisoformat(row['obsDt'][:10])
        except (KeyError,TypeError,ValueError):continue
        if not now.date()-dt.timedelta(days=13)<=observed<=now.date():continue
        if key not in latest or observed>latest[key]:latest[key]=observed
    return [{'id':key,'observedOn':date.isoformat(),'expiresOn':(date+dt.timedelta(days=14)).isoformat()} for key,date in sorted(latest.items())]

def main():
    now=dt.datetime.now(dt.timezone.utc);known={s['id'] for s in json.loads((ROOT/'dist/species.json').read_text())['species']}
    previous={}
    local=ROOT/'dist/current-notable.json'
    for data in [json.loads(local.read_text())] if local.exists() else []:
        previous.update({r['code']:r for r in data.get('regions',[])})
    try:
        data=regions.request_json('https://dg1tal.github.io/birdnamesde/current-notable.json')
        if data.get('version')==1:previous.update({r['code']:r for r in data.get('regions',[])})
    except Exception:pass
    codes=[r['code'] for r in json.loads((ROOT/'dist/regions.json').read_text())['regions']]
    token=os.environ.get('EBIRD_API_KEY','').strip();output=[]
    def refresh(code):
        old=sanitize(previous.get(code),known,now)
        if old and now-dt.datetime.fromisoformat(old['updatedAt'].replace('Z','+00:00'))<dt.timedelta(hours=24):return {'code':code,**old}
        if token:
            try:
                data=regions.request_json(regions.API+f'data/obs/{code}/recent/notable?back=14&includeProvisional=false&detail=simple',token)
                return {'code':code,'updatedAt':now.isoformat(timespec='seconds').replace('+00:00','Z'),'records':notable_records(data,known,now)}
            except Exception:print(f'Warning: notable records unavailable for {code}; retained dated fallback.',flush=True)
        return {'code':code,**old} if old else None
    with ThreadPoolExecutor(max_workers=3) as executor:
        for future in as_completed([executor.submit(refresh,c) for c in codes]):
            item=future.result()
            if item:output.append(item)
    encoded=json.dumps({'version':1,'source':'eBird recent notable observations','terms':'https://www.birds.cornell.edu/home/ebird-data-access-terms-of-use/','regions':sorted(output,key=lambda r:r['code'])},ensure_ascii=False,indent=2)+'\n'
    if token and token in encoded:raise ValueError('Credential material rejected')
    temporary=local.with_suffix('.json.tmp');temporary.write_text(encoded);temporary.replace(local)
    print(f'Prepared dated notable records for {len(output)}/{len(codes)} regions; no locations or observer data published.')
if __name__=='__main__':main()
