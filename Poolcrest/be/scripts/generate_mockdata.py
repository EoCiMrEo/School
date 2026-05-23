"""Generate and optionally execute mock data SQL with valid UUIDs.

Usage:
  python scripts/generate_mockdata.py [--input PATH] [--out PATH] [--map PATH] [--execute]

Behavior:
- Scans the input SQL file for 36-char quoted tokens that look like your custom IDs
  (e.g. 'p0000001-0000-...').
- For tokens that are NOT valid hex UUIDs, it generates a deterministic UUIDv5 based
  on a stable namespace so replacements are reproducible.
- Writes a fixed SQL file and a mapping JSON file.
- If --execute is provided, the script will attempt to load Django (using
  DJANGO_SETTINGS_MODULE='core.settings') and execute the SQL statements inside a
  single transaction. Execution is optional and off by default.

Notes:
- Run this from the `be` directory (project root for Django settings):
    # from d:\Projects\Webapp\Poolcrest\be
    python scripts/generate_mockdata.py --input ../mockdata.sql

- The script is conservative: it does not execute SQL by default. Review the
  generated mapping file before executing.
"""

import argparse
from pathlib import Path
import re
import uuid
import json
import sys

HEX_UUID_RE = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
QUOTE_TOKEN_RE = re.compile(r"'([A-Za-z0-9\-]{36})'")

NAMESPACE_UUID = uuid.UUID('11111111-1111-1111-1111-111111111111')


def build_mapping(text):
    tokens = set(QUOTE_TOKEN_RE.findall(text))
    mapping = {}
    for t in sorted(tokens):
        if not HEX_UUID_RE.match(t):
            # deterministic uuid5 based on token so runs are reproducible
            mapping[t] = str(uuid.uuid5(NAMESPACE_UUID, t))
    return mapping


def apply_mapping(text, mapping):
    if not mapping:
        return text

    def repl(m):
        v = m.group(1)
        if v in mapping:
            return "'%s'" % mapping[v]
        return m.group(0)

    return QUOTE_TOKEN_RE.sub(repl, text)


def split_statements(sql_text):
    # Conservative split on semicolon at line end. This won't be perfect for
    # every SQL file but works with typical dump files that end statements with ;\n
    parts = []
    cur = []
    for line in sql_text.splitlines(True):
        cur.append(line)
        if line.strip().endswith(';'):
            parts.append(''.join(cur))
            cur = []
    # add remainder
    if cur:
        parts.append(''.join(cur))
    return parts


def execute_sql_via_django(sql_text):
    try:
        import django
        from django.db import connection
    except Exception as e:
        print('Failed to import Django. Make sure you run this from the project `be` dir and')
        print('your virtualenv is activated. Exception:', e)
        return False

    django.setup()

    stmts = split_statements(sql_text)
    print(f'Executing {len(stmts)} SQL statements...')
    with connection.cursor() as cur:
        try:
            with connection.atomic():
                for i, s in enumerate(stmts, 1):
                    s_strip = s.strip()
                    if not s_strip:
                        continue
                    cur.execute(s)
                    if i % 50 == 0:
                        print(f'  executed {i}/{len(stmts)}')
        except Exception as exc:
            print('Execution failed, transaction will be rolled back. Error:')
            print(exc)
            return False
    return True


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', '-i', default='../mockdata.sql', help='Input SQL file path')
    parser.add_argument('--out', '-o', default='mockdata_fixed_deterministic.sql', help='Output fixed SQL file')
    parser.add_argument('--map', '-m', default='mockdata_uuid_map_deterministic.json', help='Mapping file')
    parser.add_argument('--execute', action='store_true', help='Execute SQL via Django DB (optional)')
    args = parser.parse_args(argv)

    inp = Path(args.input)
    if not inp.exists():
        print('Input SQL not found:', inp)
        print('Try providing the path to your original mockdata.sql (e.g. --input ../mockdata.sql)')
        sys.exit(1)

    text = inp.read_text(encoding='utf-8')
    mapping = build_mapping(text)
    if not mapping:
        print('No non-hex-UUID tokens found. No changes necessary.')
        out_path = Path(args.out)
        out_path.write_text(text, encoding='utf-8')
        print('Wrote (unchanged):', out_path)
        return

    fixed = apply_mapping(text, mapping)

    out_path = Path(args.out)
    out_path.write_text(fixed, encoding='utf-8')

    map_path = Path(args.map)
    map_path.write_text(json.dumps(mapping, indent=2), encoding='utf-8')

    print(f'Generated mapping for {len(mapping)} tokens')
    print('Fixed SQL written to:', out_path)
    print('Mapping written to:', map_path)

    if args.execute:
        print('\nExecution requested. Attempting to execute SQL via Django DB...')
        # Ensure DJANGO_SETTINGS_MODULE exists or set default
        import os
        if 'DJANGO_SETTINGS_MODULE' not in os.environ:
            os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
            print("Set DJANGO_SETTINGS_MODULE=core.settings (you can override via env)")
        ok = execute_sql_via_django(fixed)
        if ok:
            print('SQL executed successfully.')
        else:
            print('SQL execution failed. See error above.')


if __name__ == '__main__':
    main()
