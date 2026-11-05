"""Read the official XLSX with the Python standard library (no Excel dependency)."""
import posixpath
import re
import xml.etree.ElementTree as ET
import zipfile

NS = {'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def workbook_rows(path, sheet_name):
    with zipfile.ZipFile(path) as archive:
        strings = []
        if 'xl/sharedStrings.xml' in archive.namelist():
            with archive.open('xl/sharedStrings.xml') as stream:
                for _, element in ET.iterparse(stream, events=('end',)):
                    if element.tag == '{'+NS['m']+'}si':
                        strings.append(''.join(x.text or '' for x in element.iter('{'+NS['m']+'}t')))
                        element.clear()
        workbook = ET.fromstring(archive.read('xl/workbook.xml'))
        relationships = ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))
        targets = {r.attrib['Id']:r.attrib['Target'] for r in relationships}
        sheet = next((s for s in workbook.find('m:sheets', NS) if s.attrib['name']==sheet_name), None)
        if sheet is None:
            raise ValueError('Missing official workbook sheet: '+sheet_name)
        rid = sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
        target = targets[rid]
        member = target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/'+target)
        header = None
        with archive.open(member) as stream:
            for _, element in ET.iterparse(stream, events=('end',)):
                if element.tag != '{'+NS['m']+'}row':
                    continue
                row = {}
                for cell in element.findall('m:c', NS):
                    column = re.match('[A-Z]+', cell.attrib['r'])[0]
                    value = cell.find('m:v', NS)
                    text = value.text if value is not None else ''
                    if cell.attrib.get('t') == 's':
                        text = strings[int(text)] if text else ''
                    elif cell.attrib.get('t') == 'inlineStr':
                        text = ''.join(x.text or '' for x in cell.iter('{'+NS['m']+'}t'))
                    row[column] = text or ''
                if header is None:
                    header = row
                else:
                    yield {name:row.get(column, '') for column,name in header.items() if name}
                element.clear()
