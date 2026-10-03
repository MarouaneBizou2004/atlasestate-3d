"""
AtlasEstate 3D - Automated Real Estate Data Pipeline DAG
Orchestrates end-to-end data ingestion, spatial validation, PostGIS loading,
dbt analytical modeling, ML valuation retraining, and quality reporting.
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator

default_args = {
    "owner": "atlasestate_data_eng",
    "depends_on_past": False,
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

def task_ingest_sources(**context):
    from backend.app.services.pipeline import MedallionPipeline
    pipeline = MedallionPipeline()
    pipeline.run_bronze_ingestion()
    return "Bronze layer ingested"

def task_raw_validation(**context):
    from backend.app.services.pipeline import MedallionPipeline
    import pandas as pd
    from pathlib import Path
    pipeline = MedallionPipeline()
    df_bronze = pd.read_parquet(Path("data/bronze/bronze_properties.parquet"))
    pipeline.run_silver_validation(df_bronze)
    return "Silver layer validated"

def task_spatial_enrichment(**context):
    from backend.app.services.pipeline import MedallionPipeline
    import pandas as pd
    from pathlib import Path
    pipeline = MedallionPipeline()
    df_silver = pd.read_parquet(Path("data/silver/silver_properties.parquet"))
    pipeline.run_gold_spatial_enrichment(df_silver)
    return "Gold layer enriched with spatial POIs"

def task_load_postgis(**context):
    from backend.app.database import init_and_seed_database
    init_and_seed_database()
    return "PostgreSQL / PostGIS warehouse synchronized"

def task_run_dbt(**context):
    from backend.app.services.dbt_runner import run_dbt
    results = run_dbt()
    return f"dbt models executed: {results}"

def task_train_model(**context):
    from backend.app.ml.valuation_model import PropertyValuationModel
    trainer = PropertyValuationModel()
    metrics = trainer.train_and_evaluate()
    return f"Valuation model trained. Champion: {metrics['champion_model']}"

def task_generate_quality_report(**context):
    from backend.app.services.pipeline import MedallionPipeline
    pipeline = MedallionPipeline()
    pipeline.generate_data_quality_report()
    return "Quality report published"

with DAG(
    "real_estate_pipeline",
    default_args=default_args,
    description="End-to-End 3D Geospatial Real Estate ETL, Spatial SQL, and ML Pipeline",
    schedule_interval="0 3 * * *",  # Daily at 03:00 UTC
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=["geospatial", "morocco", "postgis", "dbt", "ml"]
) as dag:

    # 1. Ingest Raw Sources
    t1_ingest = PythonOperator(
        task_id="ingest_sources",
        python_callable=task_ingest_sources
    )

    # 2. Validation & Quality Cleansing
    t2_validate = PythonOperator(
        task_id="raw_validation",
        python_callable=task_raw_validation
    )

    # 3. Spatial Enrichment & POI Distance Calculations
    t3_enrich = PythonOperator(
        task_id="spatial_enrichment",
        python_callable=task_spatial_enrichment
    )

    # 4. Load PostGIS & Relational Warehouse
    t4_load_dwh = PythonOperator(
        task_id="load_postgis",
        python_callable=task_load_postgis
    )

    # 5. Run dbt Transformations & Integrity Tests
    t5_dbt = PythonOperator(
        task_id="run_dbt",
        python_callable=task_run_dbt
    )

    # 6. Retrain ML Valuation Engine & Update Value Gaps
    t6_train_ml = PythonOperator(
        task_id="train_model",
        python_callable=task_train_model
    )

    # 7. Generate Quality & Governance Audit Reports
    t7_quality_report = PythonOperator(
        task_id="generate_quality_report",
        python_callable=task_generate_quality_report
    )

    # Define Linear Dependency Graph
    t1_ingest >> t2_validate >> t3_enrich >> t4_load_dwh >> t5_dbt >> t6_train_ml >> t7_quality_report
