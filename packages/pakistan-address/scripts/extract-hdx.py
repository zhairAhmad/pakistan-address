"""Extract admin 1-3 names and p-codes from the HDX COD-AB workbook.

    pip install openpyxl
    python scripts/extract-hdx.py

Reads data-sources/hdx/pak_admin_boundaries.xlsx, writes data-sources/hdx/hdx-admin.json.
"""
import json
import pathlib

import openpyxl

root = pathlib.Path(__file__).resolve().parent.parent / "data-sources" / "hdx"
wb = openpyxl.load_workbook(root / "pak_admin_boundaries.xlsx", read_only=True)


def rows(sheet, cols):
    it = wb[sheet].iter_rows(values_only=True)
    header = list(next(it))
    return [{c: r[header.index(c)] for c in cols} for r in it]


out = {
    "provinces": rows("pak_admin1", ["adm1_name", "adm1_pcode"]),
    "districts": rows("pak_admin2", ["adm2_name", "adm2_pcode", "adm1_pcode"]),
    "tehsils": rows("pak_admin3", ["adm3_name", "adm3_pcode", "adm2_pcode", "adm1_pcode"]),
}
(root / "hdx-admin.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
print({k: len(v) for k, v in out.items()})
