import openpyxl,csv,json,re,collections,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
w=openpyxl.load_workbook(root/'data/names.xlsx',read_only=True,data_only=True)
def rows(sheet):
 it=w[sheet].values; head=next(it)
 for row in it: yield dict(zip(head,row))
names={r['species_code']:r for r in rows('full_sparse') if r['category']=='species'}
codes={r['species_code']:r for r in rows('4_letter_codes') if r['category']=='species'}
groups={r['en']:r['de'] for r in rows('species_groups')}
json.dump({'names':names,'codes':codes,'groups':groups},open(root/'data/extracted.json','w'),ensure_ascii=False)
print('extracted',len(names))
