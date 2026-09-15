#!/usr/bin/env python3
"""Print an .xlsx sheet as TSV using only the stdlib (no openpyxl/pandas)."""
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

NS = {'a': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def col_to_num(col):
    n = 0
    for c in col:
        n = n * 26 + (ord(c) - ord('A') + 1)
    return n


def read_rows(path, sheet_file):
    with zipfile.ZipFile(path) as z:
        shared = ET.fromstring(z.read('xl/sharedStrings.xml'))
        sheet = ET.fromstring(z.read(f'xl/worksheets/{sheet_file}'))
    strings = [
        ''.join(t.text or '' for t in si.findall('.//a:t', NS))
        for si in shared.findall('a:si', NS)
    ]

    rows = []
    for row in sheet.findall('.//a:row', NS):
        cells = {}
        for c in row.findall('a:c', NS):
            col = col_to_num(re.match(r'([A-Z]+)', c.get('r')).group(1))
            v, is_el = c.find('a:v', NS), c.find('a:is', NS)
            if is_el is not None:
                cells[col] = ''.join(t.text or '' for t in is_el.findall('.//a:t', NS))
            elif v is not None:
                cells[col] = strings[int(v.text)] if c.get('t') == 's' else v.text
        rows.append(cells)
    return rows


def main():
    if len(sys.argv) < 2:
        print(
            'usage: read_xlsx.py <path-to-xlsx> [sheet-file, default sheet1.xml]',
            file=sys.stderr
        )
        sys.exit(1)

    path = sys.argv[1]
    sheet_file = sys.argv[2] if len(sys.argv) > 2 else 'sheet1.xml'
    rows = read_rows(path, sheet_file)
    max_col = max((max(r.keys()) for r in rows if r), default=0)

    for row in rows:
        cells = [(row.get(i) or '').replace('\t', ' ') for i in range(1, max_col + 1)]
        print('\t'.join(cells))


if __name__ == '__main__':
    main()
