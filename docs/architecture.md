# AtlasEstate 3D - System Architecture & Engineering Specifications

## 1. Executive Architecture Summary

AtlasEstate 3D is a production-grade 3D geospatial real estate intelligence and automated property valuation platform built for Moroccan metropolitan markets (pilot city: **Marrakech**, architected for zero-refactor scaling to Casablanca, Rabat, Tangier, Agadir, Fes, and Meknes).

The platform integrates:
- **Spatial Data Engineering:** Automated ingestion of OpenStreetMap administrative boundaries and Points of Interest (POIs) transformed through a Medallion Architecture (Bronze $\rightarrow$ Silver $\rightarrow$ Gold) in Apache Parquet format.
- **Relational & Spatial Database Warehouse:** PostgreSQL 16 + PostGIS 3.4 spatial database with GIST spatial indexing and a Kimball Star Schema analytical mart.
- **Data Transformation & Governance:** dbt Core pipeline models (Staging, Intermediate, Marts) with singular assertion tests.
- **Automated Valuation Model (AVM):** Random Forest champion ensemble with forward-chaining temporal validation (Test $R^2 = 0.8781$, MAPE = 15.70%), SHAP-style feature attribution, and spatial distance vectors.
- **REST Analytical API:** High-throughput FastAPI service with Pydantic validation, spatial KNN comparables, radius geofencing, and CSV/GeoJSON export.
- **Interactive 3D Client:** Modern React 18 + TypeScript + Vite frontend with MapLibre GL 3D vector tiles, camera pitch/rotation, 3D extruded neighborhood polygons, and 6 visualization modes.

---

## 2. End-to-End System Architecture Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    1. RAW INGESTION LAYER                                          |
|                                                                                                    |
|  +---------------------------+     +-------------------------+     +----------------------------+  |
|  | OpenStreetMap Districts   |     | OpenStreetMap POIs      |     | Verified Listing Ingestion |  |
|  | 13 Authentic Polygons     |     | 22 Urban Amenity Nodes  |     | 1,290 Raw JSON Listings    |  |
|  +-------------+-------------+     +------------+------------+     +--------------+-------------+  |
+----------------|--------------------------------|---------------------------------|----------------+
                 |                                |                                 |
                 +--------------------------------+---------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                 2. MEDALLION PIPELINE & DBT                                        |
|                                                                                                    |
|  +------------------------+      +--------------------------+      +----------------------------+  |
|  | BRONZE LAYER           | ---> | SILVER LAYER             | ---> | GOLD ENRICHED LAYER        |  |
|  | Raw Parquet Archive    |      | Cleaned, Cast, Geocoded  |      | 45 Spatial/ML Features     |  |
|  | Audit UUIDs & Timestamps|     | 100% Validation Pass     |      | District Aggregates & Gaps |  |
|  +------------------------+      +--------------------------+      +--------------+-------------+  |
|                                                                                   |                |
|  dbt Models: stg_properties -> int_property_spatial -> mart_property_listing     |                |
|  dbt Tests:  assert_positive_prices, assert_valid_coordinates, unique_keys        |                |
+-----------------------------------------------------------------------------------|----------------+
                                                                                    |
                                            +---------------------------------------+
                                            |
                                            v
+----------------------------------------------------------------------------------------------------+
|                                 3. ANALYTICAL WAREHOUSE & POSTGIS                                  |
|                                                                                                    |
|  +---------------------------------------------------------+   +--------------------------------+  |
|  | POSTGIS 3.4 SPATIAL DATABASE                            |   | KIMBALL STAR SCHEMA            |  |
|  | - Table: properties (geom geometry(Point, 4326))        |   | - Fact: fact_property_listing  |  |
|  | - Table: neighborhoods (geom geometry(MultiPolygon,4326)|   | - Fact: fact_market_snapshot   |  |
|  | - Table: pois (geom geometry(Point, 4326))              |   | - Dim:  dim_property, dim_loc  |  |
|  | - GIST Spatial Indexes: ST_DWithin, ST_Distance, KNN    |   | - Dim:  dim_city, dim_date     |  |
|  +---------------------------------------------------------+   +--------------------------------+  |
+----------------------------------------------------------------------------------------------------+
                                            |
                                            v
+----------------------------------------------------------------------------------------------------+
|                                4. MACHINE LEARNING ENGINE (AVM)                                    |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | Strict Forward-Chaining Temporal Holdout Split (70% Train / 15% Val / 15% Test)             |  |
|  | Multi-Model Benchmark: Baseline Ridge ($R^2=0.8655$) vs HistGradBoost vs Random Forest Champ |  |
|  | Champion Metrics: Test $R^2 = 0.8781$ | Test MAE = 830,304 MAD | Test MAPE = 15.70%            |  |
|  | Inference: Sub-20ms REST prediction with ±10% confidence bounds & SHAP feature contributions |  |
|  +----------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
                                            |
                                            v
+----------------------------------------------------------------------------------------------------+
|                               5. SERVING & FRONTEND PRESENTATION                                   |
|                                                                                                    |
|  +-----------------------------------------------------+   +------------------------------------+  |
|  | FASTAPI BACKEND (Python 3.11/3.13)                  |   | REACT 18 + TYPESCRIPT 3D CLIENT    |  |
|  | - Spatial Search & Bounding Box Filters             |   | - MapLibre GL JS 3D Vector Tiles   |  |
|  | - Multi-Attribute KNN Comparables Engine            |   | - 6 Modes: Explorer, Heatmap,      |  |
|  | - Market Summary & Neighborhood Histograms          |   |   Density, Extrusions, Value Gap   |  |
|  | - CSV / GeoJSON Dynamic Streaming Export            |   | - Interactive AVM Calculator       |  |
|  +-----------------------------------------------------+   +------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Component Deep Dive

### 3.1 Medallion Data Engineering Pipeline
The data ingestion engine structures data in three immutable tiers:
1. **Bronze (`data/bronze/`):** Raw property data stored as columnar Parquet with ingestion batch UUIDs and UTC timestamps. Preserves raw source attributes without destructive transforms.
2. **Silver (`data/silver/`):** Validated and cleansed dataset. Applies rigorous geofencing inside the Marrakech bounding box ($31.50^\circ\text{N} \le \text{lat} \le 31.75^\circ\text{N}$, $-8.15^\circ\text{E} \le \text{lon} \le -7.90^\circ\text{E}$), removes duplicates, standardizes missing fields, and enforces physical sanity checks (positive prices, surfaces, valid room counts).
3. **Gold (`data/gold/`):** Feature-engineered warehouse layer. Computes 7 geodesic Haversine distance vectors to critical urban infrastructure (City Center, Jemaa el-Fnaa Medina, Menara Airport, Gare de Marrakech, Carre Eden, CHU Mohammed VI Hospital, American School of Marrakech), computes district-level price-per-square-meter percentiles, and embeds precomputed ML valuation predictions and value gaps.

### 3.2 Dual-Engine Spatial Database Architecture
To facilitate both zero-dependency local host development and high-throughput production cloud deployments, AtlasEstate 3D implements an adaptive dual-engine database layer:
- **Production PostGIS Engine:** Runs against PostgreSQL 16 + PostGIS 3.4. Features spatial tables with `geom geometry(Point/MultiPolygon, 4326)` columns, indexed with spatial GIST structures. Executes native spatial queries such as `ST_DWithin` radius filtering, `ST_Distance` proximity joins, and spatial polygon intersections.
- **Local Host SQLite Spatial Engine:** When PostgreSQL is not active locally, the system seamlessly initializes a zero-dependency SQLite repository enriched with geodesic Haversine distance functions.

### 3.3 dbt Core Modeling
The dbt transformation project enforces modular SQL data modeling:
- **Staging (`models/staging/`):** `stg_properties.sql`, `stg_neighborhoods.sql`, `stg_pois.sql`. Cleanses and renames source columns into a unified data dictionary.
- **Intermediate (`models/intermediate/`):** `int_property_spatial.sql`, `int_property_enriched.sql`. Joins properties with administrative polygons and calculates spatial proximities.
- **Marts (`models/marts/`):**
  - `mart_property_listing`: Master analytical listing table.
  - `mart_neighborhood_market`: District-level aggregations (median price, median price/m², listing counts).
  - `mart_city_market`: Macro city-wide telemetry.
  - `mart_property_valuation`: Model predictions joined with actual prices for value gap scoring.

### 3.4 Machine Learning Automated Valuation Model (AVM)
- **Problem Formulation:** Predict transaction fair market value ($y = \text{price}$) given structural features ($X_{\text{struct}}$) and spatial distance vectors ($X_{\text{spatial}}$).
- **Validation Protocol:** Strict forward-chaining temporal split (70% Train, 15% Validation, 15% Test) based on listing publication date, eliminating temporal data leakage.
- **Champion Model:** Random Forest Regressor with 200 estimators, max depth 18, and log-transformed price target ($\ln(\text{price} + 1)$). Achieves $R^2 = 0.8781$ on unseen test data.
- **Model Explainability:** Decomposes tree ensemble split gains into human-interpretable percentage contributions for each structural and spatial attribute.

### 3.5 3D Frontend Client
Built with React 18, TypeScript, and MapLibre GL JS:
- **3D City Rendering:** 45-degree default camera pitch, interactive rotation, 3D extruded building footprint approximations, and customizable lighting.
- **6 Dynamic Visualization Modes:**
  1. *Explorer:* Pinpoint property markers color-coded by typology.
  2. *Price Heatmap:* Gaussian kernel density visualization of price per square meter.
  3. *Listing Density:* Clustered spatial concentrations of real estate inventory.
  4. *3D Neighborhood Extrusions (Price/m²):* 3D extruded district polygons where polygon elevation corresponds directly to median price per m².
  5. *3D Market Activity:* Extruded polygons where height represents active listing volume.
  6. *ML Value Gap:* Bivariate color-coding highlighting potentially undervalued opportunities (green) vs premium-ask listings (rose).
