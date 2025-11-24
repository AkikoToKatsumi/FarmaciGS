#!/usr/bin/env python3
"""
create_db.py

Creates `database/farmacia.db` from `database/farmacia_sqlite.sql` and
prints a summary (tables and row counts). Run from project `desktop-app` folder:

  python scripts/create_db.py

Requires Python (>=3.7). This script uses the standard library `sqlite3`.
"""
import sqlite3
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
DB_DIR = ROOT / 'database'
SQL_FILE = DB_DIR / 'farmacia_sqlite.sql'
DB_FILE = DB_DIR / 'farmacia.db'
SEED_FILE = DB_DIR / 'seed_data.sql'


def create_db_from_sql(sql_path: Path, db_path: Path):
    sql = sql_path.read_text(encoding='utf8')
    conn = sqlite3.connect(str(db_path))
    try:
        conn.executescript(sql)
    finally:
        conn.close()


def summarize_db(db_path: Path):
    conn = sqlite3.connect(str(db_path))
    try:
        cur = conn.cursor()
        cur.execute("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name;")
        rows = cur.fetchall()
        print(f"Database: {db_path}\nFound {len(rows)} tables/views:")
        for name, typ in rows:
            print(f" - {typ}: {name}")
            try:
                cur2 = conn.cursor()
                cur2.execute(f"SELECT COUNT(*) FROM '{name}'")
                count = cur2.fetchone()[0]
                print(f"    rows: {count}")
            except Exception as e:
                print(f"    (could not count rows: {e})")
    finally:
        conn.close()


def main():
    if not SQL_FILE.exists():
        print(f"SQL file not found: {SQL_FILE}")
        sys.exit(1)

    if not DB_DIR.exists():
        DB_DIR.mkdir(parents=True)

    if DB_FILE.exists():
        print(f"{DB_FILE} already exists — summarizing contents...")
        summarize_db(DB_FILE)
        return

    print(f"Creating database {DB_FILE} from {SQL_FILE}...")
    try:
        create_db_from_sql(SQL_FILE, DB_FILE)
        # apply seed data if present
        if SEED_FILE.exists():
            try:
                print(f"Applying seed data from {SEED_FILE}...")
                create_db_from_sql(SEED_FILE, DB_FILE)
            except Exception as e:
                print('Error applying seed data:', e)
                # continue — DB created but without seeds
    except Exception as e:
        print('Error creating DB:', e)
        sys.exit(2)

    print('Created DB successfully. Summary:')
    summarize_db(DB_FILE)


if __name__ == '__main__':
    main()
