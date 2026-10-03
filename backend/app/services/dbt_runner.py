"""
dbt Model Executor and Test Runner for AtlasEstate 3D
Compiles and executes dbt Staging, Intermediate, and Marts models
against the relational database and executes singular and schema tests.
"""

import re
import sys
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd
from sqlalchemy import text

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
DBT_DIR = PROJECT_ROOT / "dbt"
MODELS_DIR = DBT_DIR / "models"
TESTS_DIR = DBT_DIR / "tests"

# Ensure backend can be imported
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.database import engine

class DBTModelRunner:
    def __init__(self):
        self.dbt_dir = DBT_DIR
        self.models_dir = MODELS_DIR
        self.tests_dir = TESTS_DIR

    def compile_sql(self, sql_content: str) -> str:
        """Resolves {{ ref('model') }} and {{ source(...) }} syntax into table names."""
        resolved = re.sub(r"\{\{\s*ref\('([^']+)'\)\s*\}\}", r"\1", sql_content)
        resolved = re.sub(r"\{\{\s*source\('[^']+',\s*'([^']+)'\)\s*\}\}", r"\1", resolved)
        return resolved

    def run_staging(self):
        print("Executing dbt Staging Models...")
        staging_dir = self.models_dir / "staging"
        with engine.begin() as conn:
            for sql_file in sorted(staging_dir.glob("*.sql")):
                model_name = sql_file.stem
                raw_sql = sql_file.read_text(encoding="utf-8")
                compiled = self.compile_sql(raw_sql)
                conn.execute(text(f"DROP VIEW IF EXISTS {model_name};"))
                conn.execute(text(f"CREATE VIEW {model_name} AS {compiled}"))
                print(f"  [OK] Created view: {model_name}")

    def run_intermediate(self):
        print("Executing dbt Intermediate Models...")
        intermediate_dir = self.models_dir / "intermediate"
        with engine.begin() as conn:
            for sql_file in sorted(intermediate_dir.glob("*.sql")):
                model_name = sql_file.stem
                raw_sql = sql_file.read_text(encoding="utf-8")
                compiled = self.compile_sql(raw_sql)
                conn.execute(text(f"DROP VIEW IF EXISTS {model_name};"))
                conn.execute(text(f"CREATE VIEW {model_name} AS {compiled}"))
                print(f"  [OK] Created view: {model_name}")

    def run_marts(self):
        print("Executing dbt Mart Models...")
        marts_dir = self.models_dir / "marts"
        with engine.begin() as conn:
            for sql_file in sorted(marts_dir.glob("*.sql")):
                model_name = sql_file.stem
                raw_sql = sql_file.read_text(encoding="utf-8")
                compiled = self.compile_sql(raw_sql)
                conn.execute(text(f"DROP TABLE IF EXISTS {model_name};"))
                conn.execute(text(f"CREATE TABLE {model_name} AS {compiled}"))
                # Query count
                res = conn.execute(text(f"SELECT COUNT(*) FROM {model_name};")).scalar()
                print(f"  [OK] Materialized table: {model_name} ({res:,} rows)")

    def run_tests(self) -> Dict[str, str]:
        print("Running dbt Test Suite...")
        test_results = {}
        with engine.connect() as conn:
            for test_file in sorted(self.tests_dir.glob("*.sql")):
                t_name = test_file.stem
                raw_sql = test_file.read_text(encoding="utf-8")
                compiled = self.compile_sql(raw_sql)
                df_violations = pd.read_sql(text(compiled), conn)
                if len(df_violations) == 0:
                    test_results[t_name] = "PASSED"
                    print(f"  [PASSED] Test: {t_name}")
                else:
                    test_results[t_name] = f"FAILED ({len(df_violations)} violations)"
                    print(f"  [FAILED] Test: {t_name} with {len(df_violations)} violations")
        return test_results

    def run_all(self):
        print("=" * 70)
        print("EXECUTING DBT TRANSFORMATION PIPELINE")
        print("=" * 70)
        self.run_staging()
        self.run_intermediate()
        self.run_marts()
        test_results = self.run_tests()
        print("=" * 70)
        print("DBT PIPELINE EXECUTION COMPLETED")
        for t, status in test_results.items():
            print(f"  - {t:<35}: {status}")
        print("=" * 70)
        return test_results

def run_dbt():
    runner = DBTModelRunner()
    return runner.run_all()

if __name__ == "__main__":
    run_dbt()
