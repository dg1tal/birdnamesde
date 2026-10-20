import json,re,pathlib,collections
p=pathlib.Path(__file__).resolve().parents[1];d=json.load(open(p/'data/extracted.json'));ns=d['names'];cs=d['codes'];lines=(p/'data/status.txt').read_text().splitlines()
by_sci={v['sci_name']:k for k,v in ns.items()};by_de={v['German']:k for k,v in ns.items() if v['German']}
selected={};unmatched=[]
def find(de,sci):
 if sci in by_sci:return by_sci[sci]
 if de in by_de:return by_de[de]
 overrides={'Alpenbirkenzeisig':'Redpoll','Zwergschwan':'Tundra Swan','Habicht':'Eurasian Goshawk','Saatkrähe':'Rook','Rabenkrähe':'Carrion Crow','Nebelkrähe':'Hooded Crow'}
 en=overrides.get(de)
 return next((k for k,v in ns.items() if v['primary_com_name']==en),None)
for i,line in enumerate(lines):
 # All breeding table rows; only regular native and established nonnative
 if True:
  m=re.match(r'^\s{3,}([A-ZÄÖÜ][\wäöüßÄÖÜ -]+?)\s{2,}([A-Z][a-z]+\s+[a-z]+)(?:[^\s]*|\s+\(I\))?\s+(I(?:II)?|II)(\s+.*)$',line)
  if m:
   de,sci,stat,tail=m.groups()
   if stat not in ['I','III'] or 'ex.' in tail:continue
   id=find(de.strip(),sci)
   if not id:unmatched.append((de,sci,stat));continue
   selected[id]={'status':['Brutvogel']+(['Etabliertes Neozoon'] if stat=='III' else []),'sourceDe':de.strip(),'row':line.strip(),'note':''}
 # Winter waterbird estimates table, captures regular documented resting species
 if 'Bestandsgröße 2016/17–2021/22' in '\n'.join(lines[:i]) and i< len(lines):
  m=re.match(r'^\s{3,}([A-ZÄÖÜ][\wäöüßÄÖÜ -]+?)\s{2,}([A-Z][a-z]+\s+[a-z]+)',line)
  if m:
   de,sci=m.groups();id=find(de.strip(),sci)
   if not id:unmatched.append((de,sci,'Rast'));continue
   x=selected.setdefault(id,{'status':[],'sourceDe':de.strip(),'row':line.strip(),'note':''})
   if 'Rastvogel' not in x['status']:x['status'].append('Rastvogel')
print('SELECTED',len(selected),'UNMATCHED',unmatched)
json.dump(selected,open(p/'data/selection.json','w'),ensure_ascii=False,indent=2)
print([(ns[k]['German'],ns[k]['primary_com_name'],cs[k]['com_quick_codes']) for k in selected][:15])
