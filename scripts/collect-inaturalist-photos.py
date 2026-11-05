#!/usr/bin/env python3
"""Stage explicitly CC0/BY/BY-SA observation photos and sex annotations.

Only selected photo licensing, taxon and annotation evidence is exported; no
coordinates, observation descriptions or other observation records are published.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import urllib.parse

spec=importlib.util.spec_from_file_location('commons',Path(__file__).with_name('collect-commons-photos.py'))
commons=importlib.util.module_from_spec(spec);spec.loader.exec_module(commons)
ROOT=Path(__file__).resolve().parents[1]
API='https://api.inaturalist.org/v1/'


def get(path,cache,**params):return commons.request(API+path+('?'+urllib.parse.urlencode(params) if params else ''),cache)


dimensions=commons.dimensions


def usable_observation(observation,taxon_id,sex_id=None):
    if observation.get('quality_grade')!='research' or observation.get('taxon',{}).get('id')!=taxon_id:return False
    annotations=[a for a in observation.get('annotations',[]) if a.get('vote_score',0)>=0]
    if any(a.get('controlled_attribute_id')==1 and a.get('controlled_value_id')!=2 for a in annotations):return False
    if sex_id is not None and not any(a.get('controlled_attribute_id')==9 and a.get('controlled_value_id')==sex_id for a in annotations):return False
    return True


def eligible_photo(photo):
    return photo.get('license_code') in ('cc0','cc-by','cc-by-sa') and min(photo.get('original_dimensions',{}).values(),default=0)>=400


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--staged',type=Path,required=True)
    parser.add_argument('--candidates',type=Path,required=True)
    parser.add_argument('--cache',type=Path,required=True)
    args=parser.parse_args();args.cache.mkdir(parents=True,exist_ok=True)
    stage=json.loads((args.staged/'staged.json').read_text())
    candidates=json.loads(args.candidates.read_text())
    birds={s['id']:s for s in json.loads((ROOT/'dist/species.json').read_text())['species']}
    terms=get('controlled_terms',args.cache)['results']
    sex_term=next(t for t in terms if t['label']=='Sex')
    sexes={v['label'].lower():v['id'] for v in sex_term['values'] if v['label'] in ('Male','Female')}
    if sex_term['id']!=9:raise ValueError('Annotation schema changed')
    todo=[]
    for sid in stage['missing']:todo.append((sid,None))
    for sid,review in stage['review'].items():
        if review['status']!='unresolved':continue
        photo=stage['photos'][sid]
        covered={sex for p in [photo,*photo.get('additional',[])] for sex in p.get('sexes',[])}
        todo.extend((sid,sex) for sex in ('male','female') if sex not in covered)
    result={'source':'iNaturalist API v1','retrieved':'2026-11-05','sexAnnotation':{'attribute':9,'values':sexes},'options':{},'missing':[]}
    for sid,sex in todo:
        bird=birds[sid];entry=candidates['species'][sid]
        taxa=get('taxa',args.cache,q=bird['sci'],rank='species',per_page=30)['results']
        allowed=set(entry['taxonNames'])|{bird['sci']}
        taxon=next((t for t in taxa if t['name'] in allowed and t.get('is_active',True)),None)
        if taxon is None:result['missing'].append([sid,sex,'taxon mismatch']);continue
        params={'taxon_id':taxon['id'],'quality_grade':'research','photos':'true','photo_license':'cc0,cc-by,cc-by-sa','per_page':20,'order_by':'votes'}
        if sex:params.update(term_id=9,term_value_id=sexes[sex])
        observations=get('observations',args.cache,**params)['results']
        options=[]
        for observation in observations:
            if not usable_observation(observation,taxon['id'],sexes.get(sex)):continue
            photos=[p for p in observation.get('photos',[]) if eligible_photo(p)]
            if not photos:continue
            # One option per independently identified observation.
            p=photos[0];url=p['url'].replace('/square.','/large.')
            blob=commons.request(url,args.cache,binary=True);width,height=dimensions(blob)
            extension='png' if blob.startswith(b'\x89PNG') else 'jpg'
            key=sid+('-'+sex if sex else '')+'-option'+str(len(options)+1)
            filename=key+'.'+extension;(args.staged/'images'/filename).write_bytes(blob)
            label='Männchen' if sex=='male' else 'Weibchen' if sex=='female' else ''
            license_name={'cc0':'CC0','cc-by':'CC BY 4.0','cc-by-sa':'CC BY-SA 4.0'}[p['license_code']]
            license_url={'cc0':'https://creativecommons.org/publicdomain/zero/1.0/','cc-by':'https://creativecommons.org/licenses/by/4.0/','cc-by-sa':'https://creativecommons.org/licenses/by-sa/4.0/'}[p['license_code']]
            attribution=commons.html.unescape(p.get('attribution',''))
            name=re.sub(r'^\(c\)\s*','',attribution).split(', some rights reserved')[0]
            if p['license_code']=='cc0':attribution='';name='iNaturalist: '+(observation['user'].get('name') or observation['user']['login'])
            record={'sci':bird['sci'],'local':'images/'+filename,'title':bird['en']+(' — '+sex if sex else ''),
                    'credit':name,'attribution':attribution,'license':license_name,'licenseUrl':license_url,
                    'source':f'https://www.inaturalist.org/photos/{p["id"]}','sourceLabel':'iNaturalist',
                    'originalUrl':p['url'].replace('/square.','/original.'),'downloadUrl':url,'width':width,'height':height,
                    'taxonNames':[bird['sci'],taxon['name']],'localSha256':hashlib.sha256(blob).hexdigest()}
            if sex:record.update(sexes=[sex],label=label)
            evidence={'observation':f'https://www.inaturalist.org/observations/{observation["id"]}',
                      'taxon':{'id':taxon['id'],'name':taxon['name']},'qualityGrade':'research',
                      'photo':{k:p[k] for k in ('id','license_code','attribution','original_dimensions')},
                      'annotations':[{k:a.get(k) for k in ('controlled_attribute_id','controlled_value_id','vote_score')} for a in observation.get('annotations',[])],
                      'sex':sex,'basis':'Research-grade species identification; explicit non-disagreed sex annotation' if sex else 'Research-grade species identification'}
            options.append({'record':record,'evidence':evidence})
            if len(options)>=2:break
        result['options'][sid+(':'+sex if sex else '')]=options
        if not options:result['missing'].append([sid,sex,'no compatible licensed annotated observation'])
        print(f'{sid}/{sex or "primary"}: {len(options)} licensed options',flush=True)
    (args.staged/'inaturalist-options.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')


if __name__=='__main__':main()
