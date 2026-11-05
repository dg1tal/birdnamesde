import json,pathlib,re,collections,csv,hashlib
p=pathlib.Path(__file__).resolve().parents[1];data=json.load(open(p/'dist/species.json'));birds=data['species'];raw=json.load(open(p/'data/official-records.json'));tax={r['SPECIES_CODE']:r for r in csv.DictReader(open(p/'data/taxonomy.csv',encoding='utf-8-sig'))}
baseline=json.loads((p/'data/catalog-baseline.json').read_text())['species']
assert len(birds)>=len(baseline)
assert data['meta']['catalog']['taxonomy']=='v2025'
assert set(data['meta']['catalog']['countries'])=={'DE','NL','GB'}
by_id={s['id']:s for s in birds}
for original in baseline:
 assert all(by_id[original['id']].get(k)==v for k,v in original.items()),original['id']
assert len({b['id'] for b in birds})==len(birds)
for b in birds:
 t=tax[b['id']];n=raw['names'][b['id']];c=raw['codes'][b['id']]
 assert t['CATEGORY']=='species'
 assert b['en']==t['PRIMARY_COM_NAME'] and b['sci']==t['SCI_NAME']
 gb=n['English, United Kingdom'] or n['English']
 assert b['enGB']==(gb if gb!=b['en'] else '')
 assert b['de']==n['German']
 assert b['sci']==n['sci_name'],(b['id'],'cross-version sci')
 assert all(re.fullmatch('[A-Z]{4}',code) for code in b['codes'])
 allowed=re.findall(r'\b[A-Z]{4}\b',c['com_quick_codes'] or '')+[c['banding_code']]
 assert all(code in allowed for code in b['codes'])
 assert b['group'] and isinstance(b['status'],list)
 assert not b['status'] or b.get('statusCountry')=='DE'
 assert re.fullmatch('[a-z0-9]+',b['id'])
code_map=collections.defaultdict(list)
for b in birds:
 for c in b['codes']:code_map[c].append(b['de'])
report={'result':'passed','species':len(birds),'taxonomy':'eBird/Clements v2025 / CSV v2025-4 (April 2026)','names_source':'eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx','checks':['unique species IDs','species category only','all scientific and English names match v2025-4 official CSV','all German names match official XLSX','all codes are literal official table entries','all codes exactly four uppercase letters','groups present; existing German status retained without inventing international status','all direct eBird paths use verified species IDs'],'levels':dict(collections.Counter(b['level'] for b in birds if 'level' in b)),'catalog':data['meta']['catalog'],'code_collisions':{c:a for c,a in code_map.items() if len(a)>1},'banding_column_fallbacks':[b['de'] for b in birds if b['codeSource']=='banding_code'],'data_sha256':hashlib.sha256((p/'dist/species.json').read_bytes()).hexdigest(),'verification_limits':['No live HTTP test of every eBird species page; IDs validated against official taxonomy.','Occurrence selection and learning levels are editorial; no independent ornithological peer review.','Desktop and mobile visual browser QA unavailable in this environment.']}
json.dump(report,open(p/'dist/validation.json','w'),ensure_ascii=False,indent=2);print(f"PASS: validated {len(birds)} species against pinned taxonomy, official names/codes and retained baseline.")
