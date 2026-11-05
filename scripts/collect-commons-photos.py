#!/usr/bin/env python3
"""Collect licensed, taxon-checked Commons candidates; cache/resume all requests.

Discovery produces a review file, not a publication. Species article/Wikidata
identity and explicit source sex labels are retained alongside file metadata.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import struct
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT=Path(__file__).resolve().parents[1]
TITLE_OVERRIDES={'stonec7':'Amur stonechat'}
AGENT='BirdNamesDE/1.0 (educational bird-name app; https://github.com/dg1tal/birdnamesde)'
WIKI='https://en.wikipedia.org/w/api.php'
COMMONS='https://commons.wikimedia.org/w/api.php'
DATA='https://www.wikidata.org/w/api.php'
LOCK=threading.Lock()
LAST=0


class Plain(HTMLParser):
    def __init__(self):super().__init__();self.parts=[]
    def handle_data(self,data):self.parts.append(data)


def plain(value):
    parser=Plain();parser.feed(value or '')
    return ' '.join(html.unescape(' '.join(parser.parts)).split())


def request(url,cache,binary=False):
    global LAST
    path=cache/(hashlib.sha256(url.encode()).hexdigest()+('.bin' if binary else '.json'))
    if path.exists():return path.read_bytes() if binary else json.loads(path.read_text())
    for attempt in range(5):
        with LOCK:
            delay=0.65-(time.monotonic()-LAST)
            if delay>0:time.sleep(delay)
            LAST=time.monotonic()
        try:
            req=urllib.request.Request(url,headers={'User-Agent':AGENT})
            with urllib.request.urlopen(req,timeout=45) as response:raw=response.read(30_000_001)
            if len(raw)>30_000_000:raise ValueError('Response too large')
            value=raw if binary else json.loads(raw)
            if not binary and value.get('error'):
                raise ValueError(str(value['error']))
            path.write_bytes(raw)
            return value
        except (urllib.error.URLError,TimeoutError,ValueError) as error:
            if attempt==4:raise
            time.sleep(min(3*2**attempt,30))


def dimensions(blob):
    if blob.startswith(b'\x89PNG'):return struct.unpack('>II',blob[16:24])
    if not blob.startswith(b'\xff\xd8'):raise ValueError('Expected JPEG/PNG photo')
    i=2
    while i<len(blob):
        if blob[i]!=255:i+=1;continue
        while blob[i]==255:i+=1
        marker=blob[i];i+=1
        if marker in (0,1,*range(208,218)):continue
        size=int.from_bytes(blob[i:i+2],'big')
        if marker in (192,193,194,195,197,198,199,201,202,203,205,206,207):
            height,width=struct.unpack('>HH',blob[i+3:i+7]);return width,height
        i+=size
    raise ValueError('No JPEG dimensions')



def api(endpoint,cache,**params):
    return request(endpoint+'?'+urllib.parse.urlencode({'format':'json','formatversion':2,'maxlag':5,**params}),cache)


def batches(items,size):
    for i in range(0,len(items),size):yield items[i:i+size]


def article_files(page):
    text=page.get('revisions',[{}])[0].get('slots',{}).get('main',{}).get('content','')
    result={}
    primary=page.get('pageprops',{}).get('page_image_free')
    if primary:result[primary]={'origin':'species article lead image','caption':''}
    fields=dict(re.findall(r'^\s*\|\s*(image\d*|image\d*_caption|image_caption\d*|caption\d*)\s*=\s*(.*?)\s*$',text,re.M))
    for key,value in fields.items():
        if not re.fullmatch(r'image\d*',key):continue
        number=key[5:]
        filename=value.strip().removeprefix('File:').removeprefix('Image:')
        if re.search(r'\.(?:jpe?g|png|webp)$',filename,re.I):
            result[filename]={'origin':'species article infobox','caption':fields.get('image'+number+'_caption',fields.get('image_caption'+number,fields.get('caption'+number,'')))}
    for match in re.finditer(r'(?:\[\[|^\s*)(?:File|Image):([^|\]\n]+)([^\n]*)',text,re.M):
        filename=match[1].strip()
        caption=match[2][:650]
        if re.search(r'\.(?:jpe?g|png|webp)$',filename,re.I) and re.search(r'\b(?:male|female|sexes|pair)\b',caption,re.I):
            result.setdefault(filename,{'origin':'species article caption','caption':caption})
    for gallery in re.findall(r'<gallery\b[^>]*>(.*?)</gallery>',text,re.S|re.I):
        for line in gallery.splitlines():
            match=re.match(r'\s*(?:(?:File|Image):)?([^|]+\.(?:jpe?g|png|webp))\s*\|(.*)',line,re.I)
            if match and re.search(r'\b(?:male|female|sexes|pair)\b',match[2],re.I):
                result.setdefault(match[1].strip(),{'origin':'species article caption','caption':match[2][:650]})
    return result


def sex_evidence(filename,metadata,caption=''):
    categories=[x for x in metadata.get('Categories',{}).get('value','').split('|') if re.search(r'^(?:Males?|Females?|Männchen|Weibchen)\b|\((?:male|female)\)$',x,re.I)]
    text=' '.join([filename,plain(metadata.get('ImageDescription',{}).get('value','')),
                   ' '.join(categories),plain(caption)]).replace('_',' ')
    if re.search(r'\b(?:juvenile|immature|subadult|chick|fledgling|nestling|young male|young female|jeune)\b|幼鳥|幼鸟',text,re.I):return [],''
    sexes=[]
    if re.search(r'\b(?:male|males|männchen|mâle|macho|maschio)\b|♂|雄|オス',text,re.I):sexes.append('male')
    if re.search(r'\b(?:female|females|weibchen|femelle|hembra|femmina|fêmea)\b|♀|雌|メス',text,re.I):sexes.append('female')
    if len(sexes)==2 and not re.search(r'\b(?:pair|couple|both|male and female|male.*(?:left|right|above|below)|männchen.*weibchen)\b',text,re.I):return [],''
    return sexes,text[:1800] if sexes else ''


def license_info(info):
    ext=info.get('extmetadata',{})
    url=html.unescape(ext.get('LicenseUrl',{}).get('value','')).replace('http://','https://')
    short=ext.get('LicenseShortName',{}).get('value','')
    match=re.search(r'https://creativecommons.org/licenses/(by(?:-sa)?)/(2\.0|2\.5|3\.0|4\.0)(/de)?/?',url)
    if match:return 'CC '+match[1].upper()+' '+match[2]+(' de' if match[3] else ''),match[0]
    if 'creativecommons.org/publicdomain/zero/' in url:return 'CC0',url
    if 'creativecommons.org/publicdomain/mark/' in url:return 'Public domain',url
    if short=='Public domain':return 'Public domain','https://creativecommons.org/publicdomain/mark/1.0/'
    return None


def usable(page):
    info=page.get('imageinfo',[{}])[0]
    if not license_info(info) or not plain(info.get('extmetadata',{}).get('Artist',{}).get('value','')):return False
    if info.get('mime') not in ('image/jpeg','image/png'):return False
    if min(info.get('width',0),info.get('height',0))<240:return False
    if re.search(r'\b(?:map|range|distribution|eggs?|skeleton|skull|logo|icon|diagram)\b',page.get('title',''),re.I):return False
    categories=info.get('extmetadata',{}).get('Categories',{}).get('value','')
    if 'with other species' in categories:return False
    if re.search(r'\beggs?\b',categories,re.I):return False
    description=plain(info.get('extmetadata',{}).get('ImageDescription',{}).get('value',''))
    if re.match(r'^\s*(?:Eggs?|Oeufs?|Œufs?)\b',description,re.I):return False
    if page.get('title')=='File:Dusky Thrush female.jpg':return False # contradictory description/category taxon
    # General artwork and multi-species plates can mention the taxon and a
    # human/other bird's sex. They are not identification photographs. The
    # explicitly numbered Audubon Eskimo Curlew plate is reviewed separately.
    if image_kind(page)=='illustration' and not (re.search(r'Esquimaux curlew Numenius borealis.*plate 208',page.get('title',''),re.I) or page.get('title')=='File:OceanodromaMonorhisSmit.jpg'):return False
    return bool(info.get('thumburl') or info.get('url'))


def dimorphism(page):
    text=page.get('revisions',[{}])[0].get('slots',{}).get('main',{}).get('content','') or page.get('extract','')
    text=re.sub(r'<ref\b[^>]*>.*?</ref>|<ref\b[^>]*/>', '', text, flags=re.S)
    text=re.sub(r'\[\[([^\]|]+)\|([^\]]+)\]\]',r'\2',text)
    text=text.replace('[[','').replace(']]','').replace("'''",'').replace("''",'')
    paragraphs=[p for p in text.split('\n') if re.search(r'\b(?:sexes|dimorph|dichrom|male|female)\b',p,re.I) and not re.match(r'\s*[|!]',p)]
    same=r'sexes (?:are |look |appear )?(?:very |quite |superficially |almost |essentially )?(?:similar|alike|identical)|sexually monomorphic|sexes (?:have|share) (?:similar|identical) plumage|males and females (?:are |look )?(?:similar|alike|identical)|no (?:apparent )?sexual dimorphism'
    different=r'sexually dichromatic|sexual dichromatism|female.{0,50}(?:duller|paler|browner|drabber|less colourful|less colorful)|male.{0,80}(?:more colourful|more colorful)|sexually dimorphic.{0,100}(?:plumage|colour|color)|male and female.{0,80}(?:plumage|colou?r).{0,40}differ'
    if any(re.search(same,p,re.I) for p in paragraphs):kind='similar'
    elif any(re.search(different,p,re.I) for p in paragraphs):kind='dimorphic'
    else:kind='not-established'
    relevant=[p for p in paragraphs if re.search(same if kind=='similar' else different,p,re.I)]
    return {'assessment':kind,'articleEvidence':(relevant or paragraphs)[:5]}


def discover(args,cache,birds):
    articles={}
    for chunk in batches(birds,15):
        result=api(WIKI,cache,action='query',titles='|'.join(TITLE_OVERRIDES.get(s['id'],s['sci']) for s in chunk),redirects=1,
                   prop='pageprops|extracts|revisions',explaintext=1,exlimit=20,rvprop='content',rvslots='main')
        pages={p['title']:p for p in result.get('query',{}).get('pages',[])}
        redirects={p['from']:p['to'] for k in ('normalized','redirects') for p in result.get('query',{}).get(k,[])}
        for s in chunk:
            title=TITLE_OVERRIDES.get(s['id'],s['sci']);seen=set()
            while title in redirects and title not in seen:seen.add(title);title=redirects[title]
            if title in pages and not pages[title].get('missing'):articles[s['id']]=pages[title]
        print(f'Articles: {len(articles)}/{len(birds)}',flush=True)
    entities={}
    qids=sorted({p.get('pageprops',{}).get('wikibase_item') for p in articles.values()}-{None})
    for chunk in batches(qids,40):
        entities.update(api(DATA,cache,action='wbgetentities',ids='|'.join(chunk),props='claims').get('entities',{}))
    selections={};files={}
    for s in birds:
        p=articles.get(s['id'])
        if not p:selections[s['id']]={'error':'No scientific-name species article'};continue
        q=p.get('pageprops',{}).get('wikibase_item')
        claims=entities.get(q,{}).get('claims',{})
        names=[c.get('mainsnak',{}).get('datavalue',{}).get('value') for c in claims.get('P225',[])]
        text=p.get('revisions',[{}])[0].get('slots',{}).get('main',{}).get('content','')
        fields=dict(re.findall(r'^\s*\|\s*(taxon|genus|species|binomial|synonyms)\s*=\s*(.*?)\s*$',text,re.M|re.I))
        article_names=[v for k,v in fields.items() if k.lower() in ('taxon','binomial')]
        if fields.get('genus') and fields.get('species'):article_names.append(fields['genus']+' '+fields['species'])
        # An explicitly documented synonym is evidence; a redirect or matching
        # vernacular name alone is not (e.g. Amur versus Siberian stonechat).
        if s['sci'] in re.sub(r"'{2,3}",'',fields.get('synonyms','')):article_names.append(s['sci'])
        names=list(dict.fromkeys([*names,*article_names]))
        candidates=article_files(p)
        assessment=dimorphism(p)
        identity='exact' if s['sci'] in names else 'review'
        selections[s['id']]={'wikiTitle':p['title'],'wikidata':q,'taxonNames':names,'identity':identity,
                              'articleUrl':'https://en.wikipedia.org/wiki/'+urllib.parse.quote(p['title'].replace(' ','_')),
                              'assessment':assessment,'candidates':candidates}
        for filename in candidates:files[filename]=None
    print(f'Checking {len(files)} candidate files',flush=True)
    for n,chunk in enumerate(batches(list(files),40)):
        data=api(COMMONS,cache,action='query',titles='|'.join('File:'+x for x in chunk),redirects=1,
                 prop='imageinfo',iiprop='url|size|mime|extmetadata|sha1',iiurlwidth=960)
        normalized={p['from'].removeprefix('File:'):p['to'].removeprefix('File:') for k in ('normalized','redirects') for p in data.get('query',{}).get(k,[])}
        pages={p['title'].removeprefix('File:'):p for p in data.get('query',{}).get('pages',[])}
        for filename in chunk:
            key=filename
            for _ in range(5):key=normalized.get(key,key)
            if key in pages:files[filename]=pages[key]
        if n%5==0:print(f'File metadata: {min((n+1)*40,len(files))}/{len(files)}',flush=True)
    output={'retrieved':time.strftime('%Y-%m-%d'),'species':selections,'files':files}
    args.output.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
    print(f'Saved {len(selections)} species candidates to {args.output}',flush=True)


def search_sexes(args,cache,birds):
    data=json.loads(args.output.read_text())
    todo=[]
    for s in birds:
        entry=data['species'].get(s['id'],{})
        if entry.get('identity')!='exact':continue
        available=set()
        for name,caption in entry['candidates'].items():
            file=data['files'].get(name)
            if not file or not usable(file) or not belongs(name,file,caption,entry):continue
            sexes,_=sex_evidence(name,file['imageinfo'][0].get('extmetadata',{}),caption['caption'])
            available.update(sexes)
        # Seek explicit sex photographs for every new taxon; overlapping-looking
        # sexes still require source evidence, never an appearance-based guess.
        for sex in ('male','female'):
            if sex not in available:todo.append((s,sex))
    print(f'Sex-image searches: {len(todo)}',flush=True)
    def work(item):
        s,sex=item
        result=api(COMMONS,cache,action='query',generator='search',gsrsearch=f'"{s["sci"]}" {sex}',gsrnamespace=6,gsrlimit=6,
                   prop='imageinfo',iiprop='url|size|mime|extmetadata|sha1',iiurlwidth=960)
        return s['id'],sex,result.get('query',{}).get('pages',[])
    with ThreadPoolExecutor(max_workers=3) as pool:
        for n,future in enumerate(as_completed([pool.submit(work,item) for item in todo]),1):
            sid,sex,pages=future.result()
            entry=data['species'][sid]
            for page in pages:
                if not usable(page):continue
                name=page['title'].removeprefix('File:')
                ext=page['imageinfo'][0].get('extmetadata',{})
                text=plain(ext.get('ImageDescription',{}).get('value',''))+' '+ext.get('Categories',{}).get('value','')+' '+name
                # Search ranking alone is not species evidence.
                sci=next(s['sci'] for s in birds if s['id']==sid)
                if sci.casefold() not in text.replace('_',' ').casefold():continue
                sexes,basis=sex_evidence(name,ext)
                if sex not in sexes:continue
                data['files'][name]=page
                entry['candidates'].setdefault(name,{'origin':'Commons explicit species and sex description','caption':''})
            if n%25==0:
                args.output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
                print(f'Sex searches complete: {n}/{len(todo)}',flush=True)
    args.output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')


def image_kind(page):
    info=page['imageinfo'][0];ext=info.get('extmetadata',{})
    text=page['title']+' '+ext.get('Categories',{}).get('value','')+' '+plain(ext.get('ImageDescription',{}).get('value',''))
    return 'illustration' if re.search(r'\b(?:illustration|illustrations|lithograph|lithographs|engraving|engravings|painting|paintings|drawings|Keulemans|Gould birds)\b',text,re.I) else 'photo'


def belongs(name,page,caption,entry):
    ext=page['imageinfo'][0].get('extmetadata',{})
    text=(name+' '+plain(ext.get('ImageDescription',{}).get('value',''))+' '+ext.get('Categories',{}).get('value','')).replace('_',' ').casefold()
    if any(taxon.casefold() in text for taxon in entry['taxonNames']):return True
    # A source's full species vernacular name may document a genus synonym;
    # article membership or a picture's caption alone cannot establish identity.
    normalized=re.sub(r'[^a-z0-9]','',text)
    title=re.sub(r'[^a-z0-9]','',entry['wikiTitle'].casefold())
    return len(title)>9 and title in normalized


def enrich_articles(args,cache):
    data=json.loads(args.output.read_text());pages={}
    for path in cache.glob('*.json'):
        value=json.loads(path.read_text())
        for p in value.get('query',{}).get('pages',[]):
            if p.get('revisions'):pages[p['title']]=p
    pending=[]
    for sid,entry in data['species'].items():
        page=pages.get(entry.get('wikiTitle'))
        if not page or sid=='stonec7':continue
        entry['assessment']=dimorphism(page)
        for name,caption in article_files(page).items():
            old=entry['candidates'].get(name)
            if not old or (not old['caption'] and caption['caption']):entry['candidates'][name]=caption
            if name not in data['files']:pending.append(name)
    for chunk in batches(sorted(set(pending)),40):
        result=api(COMMONS,cache,action='query',titles='|'.join('File:'+n for n in chunk),redirects=1,
                   prop='imageinfo',iiprop='url|size|mime|extmetadata|sha1',iiurlwidth=960)
        normalized={p['from'].removeprefix('File:'):p['to'].removeprefix('File:') for k in ('normalized','redirects') for p in result.get('query',{}).get(k,[])}
        found={p['title'].removeprefix('File:'):p for p in result.get('query',{}).get('pages',[])}
        for name in chunk:
            key=name
            for _ in range(5):key=normalized.get(key,key)
            data['files'][name]=found.get(key)
    args.output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(f'Enriched source captions: {len(set(pending))} additional files',flush=True)


def fill_gaps(args,cache,birds):
    data=json.loads(args.output.read_text())
    todo=[]
    for s in birds:
        e=data['species'][s['id']]
        available=[(n,data['files'][n],c) for n,c in e.get('candidates',{}).items() if data['files'].get(n) and usable(data['files'][n]) and belongs(n,data['files'][n],c,e)]
        sexes={sex for n,p,c in available for sex in sex_evidence(n,p['imageinfo'][0].get('extmetadata',{}),c['caption'])[0]}
        if not available or e.get('identity')!='exact' or (e.get('assessment',{}).get('assessment')=='dimorphic' and len(sexes)!=2):todo.append(s)
    print(f'Focused source review: {len(todo)} species',flush=True)
    for s in todo:
        e=data['species'][s['id']]
        terms=[s['sci'],*[n for n in e.get('taxonNames',[]) if re.fullmatch('[A-Z][a-z]+ [a-z]+',n) and n!=s['sci']]]
        if s['id']=='stonec7':terms=['Saxicola stejnegeri','Saxicola maurus stejnegeri']
        for term in terms[:2]:
            result=api(COMMONS,cache,action='query',generator='search',gsrsearch='"'+term+'"',gsrnamespace=6,gsrlimit=30,
                       prop='imageinfo',iiprop='url|size|mime|extmetadata|sha1',iiurlwidth=960)
            for page in result.get('query',{}).get('pages',[]):
                if not usable(page):continue
                name=page['title'].removeprefix('File:');ext=page['imageinfo'][0].get('extmetadata',{})
                text=(plain(ext.get('ImageDescription',{}).get('value',''))+' '+ext.get('Categories',{}).get('value','')+' '+name).replace('_',' ')
                if term.casefold() not in text.casefold():continue
                data['files'][name]=page
                e['candidates'].setdefault(name,{'origin':'Commons explicit species description','caption':''})
                if s['id']=='stonec7':
                    e['identity']='exact';e['taxonNames']=[s['sci']]
                    e['identityEvidence']='Only files explicitly labelled Saxicola stejnegeri or Saxicola maurus stejnegeri; the broader Siberian stonechat article image is excluded.'
                    e['candidates']={k:v for k,v in e['candidates'].items() if 'Commons explicit species' in v['origin']}
        print(s['id']+' source review complete',flush=True)
    args.output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')


def compare_gaps(args,cache,birds):
    data=json.loads(args.output.read_text())
    for s in birds:
        entry=data['species'][s['id']]
        if entry.get('identity')!='exact' or entry['assessment']['assessment']!='dimorphic':continue
        available=set()
        for name,caption in entry['candidates'].items():
            page=data['files'].get(name)
            if page and usable(page) and belongs(name,page,caption,entry):available.update(sex_evidence(name,page['imageinfo'][0].get('extmetadata',{}),caption['caption'])[0])
        for sex in ('male','female'):
            if sex in available:continue
            result=api(COMMONS,cache,action='query',generator='search',gsrsearch='"'+entry['wikiTitle']+'" '+sex,gsrnamespace=6,gsrlimit=20,
                       prop='imageinfo',iiprop='url|size|mime|extmetadata|sha1',iiurlwidth=960)
            for page in result.get('query',{}).get('pages',[]):
                name=page['title'].removeprefix('File:');caption={'origin':'Commons explicit species and sex description','caption':''}
                if usable(page) and belongs(name,page,caption,entry) and sex in sex_evidence(name,page['imageinfo'][0].get('extmetadata',{}))[0]:
                    data['files'][name]=page;entry['candidates'].setdefault(name,caption)
        print('Comparison review: '+s['id'],flush=True)
    args.output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')


def score(name,page,caption):
    info=page['imageinfo'][0];ext=info.get('extmetadata',{})
    text=name+' '+plain(ext.get('ImageDescription',{}).get('value',''))+' '+caption.get('caption','')
    value={'species article lead image':100,'species article infobox':90,'species article caption':35}.get(caption['origin'],30)
    if image_kind(page)=='photo':value+=30
    if re.search(r'\b(?:juvenile|immature|subadult|chick|fledgling|nestling|hybrid|museum|specimen|mounted|skin|albino|leucistic|lutino|mutation)\b',text,re.I):value-=85
    if re.search(r'\badult\b',text,re.I):value+=10
    value+=min(20,min(info['width'],info['height'])/100)
    return value


def limit_comparison_images(chosen):
    # Once both labelled sexes are available, the unlabelled lead is redundant.
    if len(chosen)>2:
        labelled=[item for item in chosen if sex_evidence(item[0],item[1]['imageinfo'][0].get('extmetadata',{}),item[2]['caption'])[0]]
        coverage={sex for item in labelled for sex in sex_evidence(item[0],item[1]['imageinfo'][0].get('extmetadata',{}),item[2]['caption'])[0]}
        if len(labelled)==2 and coverage=={'male','female'}:return labelled
        raise ValueError('Image selection exceeds two without a complete labelled comparison')
    return chosen


def stage(args,cache,birds):
    data=json.loads(args.output.read_text());destination=args.destination
    if destination is None:raise ValueError('--destination is required for staging')
    (destination/'images').mkdir(parents=True,exist_ok=True)
    selected={};missing=[]
    for s in birds:
        entry=data['species'].get(s['id'],{})
        if entry.get('identity')!='exact':missing.append(s['id']);continue
        canonical={}
        for name,caption in entry['candidates'].items():
            page=data['files'].get(name)
            if not page or not usable(page) or not belongs(name,page,caption,entry):continue
            key=page['title'];old=canonical.get(key)
            if old:
                merged={**old[2]}
                if len(sex_evidence(name,page['imageinfo'][0].get('extmetadata',{}),caption['caption'])[0])>len(sex_evidence(old[0],page['imageinfo'][0].get('extmetadata',{}),merged['caption'])[0]):merged['caption']=caption['caption']
                canonical[key]=(old[0],page,merged)
            else:canonical[key]=(name,page,dict(caption))
        candidates=list(canonical.values())
        candidates.sort(key=lambda item:-score(*item))
        if not candidates:missing.append(s['id']);continue
        chosen=[candidates[0]]
        covered=set(sex_evidence(chosen[0][0],chosen[0][1]['imageinfo'][0].get('extmetadata',{}),chosen[0][2]['caption'])[0])
        if entry['assessment']['assessment']!='similar':
            for sex in ('male','female'):
                if sex in covered:continue
                candidate=next((x for x in candidates if sex in sex_evidence(x[0],x[1]['imageinfo'][0].get('extmetadata',{}),x[2]['caption'])[0]),None)
                if candidate and candidate[1]['title'] not in {x[1]['title'] for x in chosen}:
                    chosen.append(candidate)
                    covered.update(sex_evidence(candidate[0],candidate[1]['imageinfo'][0].get('extmetadata',{}),candidate[2]['caption'])[0])
        selected[s['id']]={'species':s,'entry':entry,'chosen':limit_comparison_images(chosen)}
    print(f'Staging {sum(len(x["chosen"]) for x in selected.values())} images for {len(selected)} species; {len(missing)} unresolved species',flush=True)
    output={};source_files={}
    def work(item):
        sid,selection=item;s=selection['species'];entry=selection['entry'];records=[];evidence=[]
        used=set()
        for index,(name,page,caption) in enumerate(selection['chosen']):
            info=page['imageinfo'][0];ext=info.get('extmetadata',{})
            sexes,basis=sex_evidence(name,ext,caption['caption'])
            suffix='' if index==0 else '-'+('pair' if len(sexes)==2 else sexes[0] if sexes else 'pair')
            if suffix in used:continue
            used.add(suffix)
            extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[info['mime']]
            filename=sid+suffix+'.'+extension
            url=info.get('thumburl') or info['url']
            blob=request(url,cache,binary=True)
            if not (blob.startswith(b'\xff\xd8') or blob.startswith(b'\x89PNG') or blob[:4]==b'RIFF'):
                raise ValueError('Downloaded content is not a supported image: '+sid)
            (destination/'images'/filename).write_bytes(blob)
            width,height=dimensions(blob)
            license_name,license_url=license_info(info)
            record={'sci':s['sci'],'local':'images/'+filename,'title':page['title'].removeprefix('File:'),
                    'credit':plain(ext['Artist']['value']),'attribution':plain(ext.get('Attribution',{}).get('value','')),
                    'license':license_name,'licenseUrl':license_url,'source':info['descriptionurl'].replace('http://','https://'),
                    'originalUrl':info['url'],'downloadUrl':url,'width':width,
                    'height':height,'wikiTitle':entry['wikiTitle'],'wikidata':entry['wikidata'],
                    'taxonNames':entry['taxonNames'],'sha1':info['sha1'],'localSha256':hashlib.sha256(blob).hexdigest()}
            if sexes:
                record['sexes']=sexes;record['label']='Männchen und Weibchen' if len(sexes)==2 else 'Männchen' if sexes==['male'] else 'Weibchen'
                if len(sexes)==1:
                    if re.search(r'non[- ]breeding|eclipse plumage|Schlichtkleid',basis,re.I):record['label']+=' · Schlichtkleid'
                    elif re.search(r'breeding plumage|nuptial plumage|Brutkleid',basis,re.I):record['label']+=' · Brutkleid'
                evidence.append({'source':record['source'],'sexes':sexes,'basis':basis,'captionSource':entry['articleUrl'] if caption['caption'] else record['source']})
            if image_kind(page)=='illustration':
                record.update({'mediaType':'illustration','illustrationDate':plain(ext.get('DateTimeOriginal',{}).get('value','')) or 'Historisch; siehe Quelle',
                               'comparisonDescription':'Historische Darstellung; Farbgebung und Proportionen können idealisiert sein.','verificationUrl':record['source']})
            records.append(record)
        coverage={sex for p in records for sex in p.get('sexes',[])}
        review={'status':'covered' if coverage=={'male','female'} else 'similar' if entry['assessment']['assessment']=='similar' else 'unresolved' if entry['assessment']['assessment']=='dimorphic' else 'single-image',
                'evidence':evidence,'articleSource':entry['articleUrl'],'assessment':entry['assessment']}
        if review['status']=='unresolved':records[0]['comparisonMissing']=True
        main=records[0]
        if len(records)>1:main['additional']=records[1:]
        return sid,main,review,{p['title'].removeprefix('File:'):p for _,p,_ in selection['chosen']}
    reviews={}
    with ThreadPoolExecutor(max_workers=3) as pool:
        for n,future in enumerate(as_completed([pool.submit(work,item) for item in selected.items()]),1):
            sid,main,review,files=future.result();output[sid]=main;reviews[sid]=review;source_files.update(files)
            if n%25==0:print(f'Staged species: {n}/{len(selected)}',flush=True)
    bundle={'photos':output,'review':reviews,'files':source_files,'missing':missing}
    (destination/'staged.json').write_text(json.dumps(bundle,ensure_ascii=False,indent=2)+'\n')
    print('Staging complete; no repository image manifest changed.',flush=True)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--phase',choices=['discover','sex-search','fill-gaps','compare-gaps','enrich-articles','stage'],required=True)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--cache',type=Path,required=True)
    parser.add_argument('--destination',type=Path)
    parser.add_argument('--baseline-manifest',type=Path,default=ROOT/'dist/photos.json',help='Only acquire species absent from this manifest; use data/photo-baseline-20261105.json to reproduce the expansion')
    args=parser.parse_args();args.cache.mkdir(parents=True,exist_ok=True)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    photos=json.loads(args.baseline_manifest.read_text())['photos']
    birds=[s for s in json.loads((ROOT/'dist/species.json').read_text())['species'] if s['id'] not in photos]
    if args.phase=='discover':discover(args,args.cache,birds)
    elif args.phase=='sex-search':search_sexes(args,args.cache,birds)
    elif args.phase=='fill-gaps':fill_gaps(args,args.cache,birds)
    elif args.phase=='compare-gaps':compare_gaps(args,args.cache,birds)
    elif args.phase=='enrich-articles':enrich_articles(args,args.cache)
    else:stage(args,args.cache,birds)


if __name__=='__main__':main()
