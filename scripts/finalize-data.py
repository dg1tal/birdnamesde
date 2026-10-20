import json,re,pathlib,collections,hashlib
p=pathlib.Path(__file__).resolve().parents[1];d=json.load(open(p/'data/official-records.json'));sel=json.load(open(p/'data/selection.json'));ns=d['names'];cs=d['codes'];tax={r['SPECIES_CODE']:r for r in __import__('csv').DictReader(open(p/'data/taxonomy.csv',encoding='utf-8-sig'))}
extra={'Schwarzkopfmöwe':['Brutvogel','Rastvogel'],'Schilfrohrsänger':['Brutvogel','Durchzügler'],'Rosaflamingo':['Brutvogel','Etabliertes Neozoon'],'Felsentaube':['Brutvogel','Etabliertes Neozoon'],'Fischadler':['Brutvogel','Durchzügler'],'Großer Brachvogel':['Brutvogel','Rastvogel'],'Kernbeißer':['Brutvogel'],'Bergfink':['Durchzügler','Wintergast'],'Rotdrossel':['Durchzügler','Wintergast'],'Seidenschwanz':['Wintergast'],'Raufußbussard':['Durchzügler','Wintergast'],'Merlin':['Durchzügler','Wintergast'],'Raubwürger':['Brutvogel','Wintergast'],'Schneeammer':['Durchzügler','Wintergast'],'Spornammer':['Durchzügler','Wintergast'],'Ohrenlerche':['Durchzügler','Wintergast'],'Strandpieper':['Durchzügler','Wintergast'],'Berghänfling':['Durchzügler','Wintergast'],'Eistaucher':['Durchzügler','Wintergast'],'Sichelhuhn':None,'Tordalk':['Brutvogel','Rastvogel'],'Gelbbrauen-Laubsänger':['Durchzügler'],'Dunkler Sturmtaucher':['Durchzügler'],'Atlantiksturmtaucher':['Durchzügler'],'Wellenläufer':['Durchzügler'],'Spatelraubmöwe':['Durchzügler'],'Falkenraubmöwe':['Durchzügler']}
# Scientific names avoid vernacular mismatches; sourced regular passage additions explicitly editorial.
extra_en={"Leach's Storm-Petrel":['Durchzügler'],'Sooty Shearwater':['Durchzügler'],'Manx Shearwater':['Durchzügler'],'European Storm-Petrel':['Durchzügler'],'Pomarine Jaeger':['Durchzügler'],'Long-tailed Jaeger':['Durchzügler'],'Yellow-browed Warbler':['Durchzügler']}
for k,n in ns.items():
 status=extra.get(n['German']) or extra_en.get(n['primary_com_name'])
 if status:
  x=sel.setdefault(k,{'status':[],'sourceDe':n['German'],'row':'Redaktionelle Ergänzung: regelmäßiger Durchzug/Winter; DO-G Artenliste / DDA-Monitoring','note':''});x['status']=list(dict.fromkeys(x['status']+status))
# Species with formerly breeding populations remain as passage species.
for k,x in sel.items():
 if ns[k]['German'] in ['Seggenrohrsänger','Zwergmöwe']:
  x['status']=[v for v in x['status'] if v!='Brutvogel'];x['status']+=['Durchzügler'];x['note']='Als Brutvogel in Deutschland erloschen: '+('2023' if ns[k]['German']=='Seggenrohrsänger' else '2025')+' (DDA 2025).'
 if ns[k]['German']=='Felsentaube':x['note']='In Deutschland bezieht sich der Status auf verwilderte Haustauben (Straßentauben), nicht auf wilde Felsentauben. eBird führt sie unter Rock Pigeon (Columba livia).';x['sourceDe']='Straßentaube'
 if ns[k]['German']=='Birkenzeisig':x['note']='eBird/Clements v2025 fasst Alpen-, Taiga- und Polarbirkenzeisig als Redpoll (Acanthis flammea) zusammen. Der DDA-Brutstatus bezieht sich auf den Alpenbirkenzeisig.'
 if ns[k]['German']=='Zwergschwan':x['note']='In eBird als Tundra Swan (Cygnus columbianus) geführt; in Deutschland betrifft dies vor allem die Unterart bewickii.'
 if ns[k]['German']=='Rostgans':x['status']=list(dict.fromkeys(['Brutvogel','Etabliertes Neozoon']+x['status']))
 if ns[k]['German']=='Habichtskauz':x['note']='Die wiederangesiedelte Population im Bayerischen Wald gilt laut DDA 2025 als selbsterhaltend.'
# Core wordlist: widespread familiar species, not automatically taxonomic order.
core='Amsel|Buchfink|Kohlmeise|Blaumeise|Rotkehlchen|Haussperling|Feldsperling|Star|Ringeltaube|Türkentaube|Elster|Eichelhäher|Dohle|Saatkrähe|Rabenkrähe|Nebelkrähe|Kolkrabe|Zaunkönig|Heckenbraunelle|Mönchsgrasmücke|Gartengrasmücke|Dorngrasmücke|Klappergrasmücke|Zilpzalp|Fitis|Singdrossel|Wacholderdrossel|Misteldrossel|Rotdrossel|Buntspecht|Grünspecht|Schwarzspecht|Kleiber|Gartenbaumläufer|Waldbaumläufer|Tannenmeise|Haubenmeise|Sumpfmeise|Weidenmeise|Schwanzmeise|Wintergoldhähnchen|Sommergoldhähnchen|Grünfink|Stieglitz|Gimpel|Kernbeißer|Girlitz|Erlenzeisig|Bluthänfling|Goldammer|Rohrammer|Feldlerche|Rauchschwalbe|Mehlschwalbe|Uferschwalbe|Mauersegler|Hausrotschwanz|Gartenrotschwanz|Grauschnäpper|Trauerschnäpper|Nachtigall|Bachstelze|Gebirgsstelze|Schafstelze|Wiesenpieper|Baumpieper|Mäusebussard|Rotmilan|Schwarzmilan|Sperber|Habicht|Turmfalke|Wanderfalke|Seeadler|Fischadler|Rohrweihe|Graureiher|Silberreiher|Weißstorch|Kormoran|Kranich|Stockente|Reiherente|Tafelente|Schnatterente|Krickente|Löffelente|Höckerschwan|Graugans|Kanadagans|Nilgans|Brandgans|Blässhuhn|Teichhuhn|Haubentaucher|Zwergtaucher|Lachmöwe|Silbermöwe|Sturmmöwe|Kiebitz|Austernfischer|Kuckuck|Eisvogel|Waldkauz|Waldohreule|Schleiereule'.split('|')
core=set(core)
special='Haselhuhn|Auerhuhn|Birkhuhn|Alpenschneehuhn|Steinhuhn|Nandu|Truthuhn|Streifengans|Schneegans|Schwarzschwan|Rotschulterente|Chileflamingo|Großtrappe|Triel|Stelzenläufer|Kleinsumpfhuhn|Zwergsumpfhuhn|Schreiadler|Steinadler|Kornweihe|Wiesenweihe|Zwergohreule|Habichtskauz|Sperlingskauz|Raufußkauz|Dreizehenspecht|Weißrückenspecht|Gelbkopfamazone|Alexandersittich|Alpendohle|Bartmeise|Beutelmeise|Haubenlerche|Felsenschwalbe|Seidensänger|Berglaubsänger|Grünlaubsänger|Seggenrohrsänger|Orpheusspötter|Schlagschwirl|Rohrschwirl|Sperbergrasmücke|Mauerläufer|Halsbandschnäpper|Zwergschnäpper|Steinrötel|Schneesperling|Alpenbraunelle|Brachpieper|Zitronenzeisig|Zippammer|Zaunammer|Rothalsgans|Zwerggans|Sumpfläufer|Temminckstrandläufer|Meerstrandläufer|Skua|Gryllteiste|Papageitaucher|Ohrenlerche|Strandpieper|Spornammer|Gelbbrauen-Laubsänger|Dunkler Sturmtaucher|Atlantiksturmtaucher|Wellenläufer|Spatelraubmöwe|Falkenraubmöwe|Eistaucher|Sprosser|Nachtreiher|Purpurreiher|Zwergdommel|Moorente|Bergente|Singschwan|Weißflügel-Seeschwalbe|Lachseeschwalbe|Rostgans|Brautente|Schwarzhalstaucher|Ohrentaucher|Ringdrossel|Bergpieper|Karmingimpel|Ortolan|Tannenhäher|Bienenfresser|Wiedehopf|Sumpfohreule|Raubwürger|Mornellregenpfeifer|Regenbrachvogel|Raubseeschwalbe|Dreizehenmöwe|Eissturmvogel|Basstölpel|Zwergschwan|Kurzschnabelgans|Waldsaatgans|Tundrasaatgans|Samtente|Eisente|Schneeammer'.split('|');special=set(special)
birds=[]
for id,x in sel.items():
 n=ns[id];c=cs[id];t=tax[id];de=n['German'];assert de
 codes=re.findall(r'\b[A-Z]{4}\b',c['com_quick_codes'] or '')
 # Official table separates banding codes; these are also eBird data-entry shortcuts.
 banding=c['banding_code'] or ''
 if not codes and banding:codes=[banding]
 if id=='eurbla':codes=['EUBL','COBL']
 assert codes,(id,de,c)
 aliases_en=[]
 for loc in [field for field in n if field.startswith('English')]:
  v=n.get(loc)
  if v and v!=t['PRIMARY_COM_NAME'] and '(' not in v and '/' not in v:aliases_en.append(v)
 aliases_de=[x['sourceDe']] if x['sourceDe']!=de else []
 if de=='Nachtschwalbe':aliases_de+=['Ziegenmelker']
 if de=='Sturmschwalbe':aliases_de+=['Europäische Sturmschwalbe']
 if de=='Jagdfasan':aliases_de+=['Fasan']
 if de=='Birkenzeisig':aliases_de+=['Alpenbirkenzeisig','Taigabirkenzeisig','Polarbirkenzeisig']
 group=d['groups'].get(n['species_group']) or n['species_group']
 if n['order1']=='Accipitriformes' or n['order1']=='Falconiformes':group='Greifvögel'
 if n['order1']=='Strigiformes':group='Eulen'
 if n['order1']=='Charadriiformes' and any(z in n['family'] for z in ['Scolopacidae','Charadriidae','Haematopodidae','Recurvirostridae','Burhinidae']):group='Limikolen'
 birds.append(dict(id=id,de=de,en=t['PRIMARY_COM_NAME'],sci=t['SCI_NAME'],codes=list(dict.fromkeys(codes)),bandingCode=banding,codeSource='com_quick_codes' if c['com_quick_codes'] else 'banding_code',aliases={'de':list(dict.fromkeys(aliases_de)),'en':list(dict.fromkeys(aliases_en))},group=group,level=1 if de in core else 3 if de in special else 2,status=x['status'],note=x['note'],selectionSource=x['row']))
print('TOTAL',len(birds),'LEVELS',collections.Counter(b['level'] for b in birds));print('groups',sorted(set(b['group'] for b in birds)))
meta={'taxonomy':'v2025','built':'20.10.2026','selection':'Regelmäßige heimische Brutvögel (Status I, ohne erloschene Bestände), etablierte Neozoen (Status III) und dokumentierte Wasservogel-Rastbestände aus DDA „Vögel in Deutschland – Bestandssituation 2025“, ergänzt um regelmäßige Landvogel-Wintergäste und Küstendurchzügler. Sehr lokale regelmäßige Brutvögel sind eingeschlossen. Seltene Ausnahmegäste sind kein eigener Lernschwerpunkt. Die Auswahl ist redaktionell; bei zusammengefassten eBird-Taxa werden DDA-Arten gemeinsam geführt.','validation':'Alle Arten-IDs, englischen und wissenschaftlichen Namen gegen die offizielle v2025-4 CSV geprüft; deutsche Namen und Codes gegen die offizielle mehrsprachige XLSX.','sources':[{'title':'eBird: Bird Names – Namensmatrix und 4-letter codes (30.10.2025)','url':'https://support.ebird.org/en/support/solutions/articles/48000804865'},{'title':'Cornell: eBird/Clements v2025 – Taxonomie-Downloads','url':'https://www.birds.cornell.edu/clementschecklist/download/'},{'title':'DDA: Vögel in Deutschland – Bestandssituation 2025 (Brutvögel S. 36–44, Wasservögel S. 66–68)','url':'https://www.dda-web.de/downloads/publications/statusreports/vid_bestandssituation_2025.pdf'},{'title':'DO-G: Liste der Vögel Deutschlands, Version 3.2 (2019), Statuscodes für regelmäßige Winter- und Zugvögel','url':'https://www.do-g.de/fileadmin/Ablage/DOG/Fachkommissionen/Kommission_Artenliste/Dokumente/Barthel_Kr%C3%BCger_2019_Liste_der_V%C3%B6gel_Deutschlands_3.2.pdf'}]}
json.dump({'meta':meta,'species':sorted(birds,key=lambda b:b['de'])},open(p/'dist/species.json','w'),ensure_ascii=False,indent=2)
