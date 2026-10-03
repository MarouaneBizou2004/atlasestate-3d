# AtlasEstate 3D - Data Engineering Pipeline & Airflow Orchestration

## 1. Medallion Pipeline Architecture

```
[Raw Sources: OSM GeoJSON + Verified Property Ingestion]
                        |
                        v
          +-----------------------------+
          | BRONZE LAYER                |
          | data/bronze/*.parquet       |
          | - Preserves raw attributes  |
          | - Ingestion batch UUIDs     |
          | - UTC ingestion audit stamp |
          +--------------+--------------+
                         |
                         v
          +-----------------------------+
          | SILVER LAYER                |
          | data/silver/*.parquet       |
          | - Geofencing validation     |
          | - Deduplication             |
          | - Schema type enforcement   |
          | - 100.0% validation pass    |
          +--------------+--------------+
                         |
                         v
          +-----------------------------+
          | GOLD LAYER                  |
          | data/gold/*.parquet         |
          | - 7 Haversine POI vectors   |
          | - District aggregates       |
          | - ML precomputed estimates  |
          | - Analytical marts          |
          +-----------------------------+
```

---

## 2. Apache Airflow DAG: `real_estate_pipeline`

Located at `airflow/dags/real_estate_pipeline.py`, this DAG runs on a daily schedule (`schedule_interval='@daily'`) to ingest, transform, validate, and refresh machine learning models.

### Task Dependency Graph
```
ingest_raw_properties ──> validate_bronze ──> transform_silver ──> validate_silver
                                                                          │
                                                                          ▼
                                                                 calculate_spatial_features
                                                                          │
                                                                          ▼
                                                                 enrich_gold_dataset
                                                                          │
                                                                          ▼
                                                                 train_valuation_model
                                                                          │
                                                                          ▼
                                                                 run_dbt_transformations
                                                                          │
                                                                          ▼
                                                                 run_dbt_tests
                                                                          │
                                                                          ▼
                                                                 generate_quality_report
```

---

## 3. dbt Core Transformation Models

The dbt project is located under `dbt/` and contains:
1. `models/staging/stg_properties.sql`: Standardizes column naming and casts types.
2. `models/staging/stg_neighborhoods.sql`: Administrative district boundary reference.
3. `models/staging/stg_pois.sql`: Urban amenity spatial coordinates.
4. `models/intermediate/int_property_spatial.sql`: Joins properties with spatial coordinates and geodesic features.
5. `models/intermediate/int_property_enriched.sql`: Adds percentile bands and relative pricing ratios.
6. `models/marts/mart_property_listing.sql`: Production analytical listing warehouse table.
7. `models/marts/mart_neighborhood_market.sql`: Aggregated metrics per district.
8. `models/marts/mart_city_market.sql`: Macro KPIs for city dashboarding.
9. `models/marts/mart_property_valuation.sql`: Valuation error metrics and model tracking.

### Singular Assertion Tests
- `assert_positive_prices.sql`: Asserts that all prices in `stg_properties` are strictly $> 0$.
- `assert_valid_coordinates.sql`: Asserts that all latitudes and longitudes fall strictly within the Morocco geodetic bounding box.
- `assert_positive_surfaces.sql`: Asserts that all surface areas are strictly $> 0$.
