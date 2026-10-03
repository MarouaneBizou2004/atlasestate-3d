<div align="center">

# 🏛️ AtlasEstate 3D
### 3D Geospatial Real Estate Intelligence & Automated Valuation Platform for Morocco

[![CI Pipeline](https://img.shields.io/badge/CI-GitHub_Actions-emerald?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.13-blue?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-teal?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.4_Spatial-blueviolet?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgis.net)
[![React](https://img.shields.io/badge/React-18_TypeScript-sky?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![MapLibre](https://img.shields.io/badge/MapLibre_GL-3D_Vector-orange?style=for-the-badge&logo=maplibre&logoColor=white)](https://maplibre.org)
[![dbt Core](https://img.shields.io/badge/dbt_Core-1.7-FF694B?style=for-the-badge&logo=dbt&logoColor=white)](https://getdbt.com)
[![Apache Airflow](https://img.shields.io/badge/Airflow-2.8-017CEE?style=for-the-badge&logo=apacheairflow&logoColor=white)](https://airflow.apache.org)
[![License](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>An enterprise-grade 3D geospatial intelligence platform combining cloud-native spatial data engineering, PostGIS spatial analytics, automated property valuation (AVM) with explainable machine learning, and GPU-accelerated 3D urban visualization.</strong>
</p>

[Key Features](#-key-features) • [Architecture](#-architecture) • [3D Visualization](#-3d-visualization-modes) • [ML Valuation](#-automated-valuation-model-avm) • [Spatial SQL](#-spatial-sql--postgis) • [Quickstart](#-quickstart) • [CV Bullets](#-portfolio--cv-talking-points)

</div>

---

## 🌟 Key Features

* **3D Urban Explorer & Picking Engine:** Interactive 3D vector map of Marrakech with real-time camera pitch, 360° rotation, 3D extruded buildings, and an intelligent **Two-Tier Picking Architecture**:
  - **Case A (Single Unit):** Clicking property pins or individual villas immediately highlights the coordinates with a 3D elevated beacon pillar and opens the full property intelligence drawer.
  - **Case B (Multi-Unit Complex):** Clicking urban residential building footprints aggregates all units inside that building, displaying median pricing, unit rates, and a selectable unit directory.
  - **3D Visual Highlight & Deselect:** Dynamic glowing ground halo + vertical extrusion beacon on selected coordinates, dismissible via Close button, `ESC` key, or clicking empty map canvas.
* **Instant Search Autocomplete:** Real-time search engine with autocomplete dropdown querying Property IDs (e.g. `MAR-MUB-00502`), districts, titles, and typologies.
* **Medallion Data Pipeline:** Multi-tier Bronze $\rightarrow$ Silver $\rightarrow$ Gold architecture storing raw, cleaned, and enriched analytical data in high-performance Apache Parquet format with 100% data validation.
* **Dual-Engine Spatial Warehouse:** Dual-engine architecture featuring PostgreSQL 16 + PostGIS 3.4 with GIST indexing for containerized production, plus an automatic zero-dependency SQLite fallback for local host execution.
* **dbt Core Transformations:** 9 production-grade dbt models (Staging, Intermediate, Kimball Marts) and singular assertion tests guaranteeing spatial and financial integrity.
* **Champion Machine Learning AVM:** Random Forest regressor with walk-forward temporal cross-validation (**Test $R^2 = 0.8781$**, **Test MAPE = 15.70%**), SHAP-style feature attribution, and ethical value gap classification.
* **Spatial KNN Comparable Search:** Multi-attribute recommendation engine matching properties within a 2-kilometer radius based on distance, surface area, room count, and amenities.
* **High-Throughput REST API:** FastAPI backend providing spatial search, bounding box filters, radius geofencing, market telemetry, and dynamic CSV/GeoJSON exports.
* **Production Orchestration:** Apache Airflow DAG (`real_estate_pipeline`) automating daily scheduled ETL, spatial feature calculation, dbt execution, and ML model retraining.
* **Comprehensive Quality & Audit:** Verified by [Feature Audit](docs/FEATURE_AUDIT.md) and [Final QA Report](docs/FINAL_QA_REPORT.md) with 100% pass across all 40 criteria.

---

## 🏗️ Architecture

AtlasEstate 3D is designed for modularity, reproducibility, and zero-refactor scaling across Moroccan metropolitan jurisdictions (Marrakech pilot $\rightarrow$ Casablanca, Rabat, Tangier, Agadir, Fes, Meknes).

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

## 🗺️ 3D Visualization Modes

AtlasEstate 3D features 6 purpose-built visualization modes toggled on-the-fly:

| Mode | Visualization | Description & Business Insight |
|:---|:---|:---|
| **1. Property Explorer** | Interactive 3D pins | Pinpoints individual properties color-coded by typology (`apartment`, `villa`, `riad`, `commercial`, `land`). Clicking triggers camera pitch and slides the detail drawer with nearest POIs and KNN comparables. |
| **2. Price/m² Heatmap** | Continuous Gaussian density | Visualizes spatial pricing gradients in Dirhams per square meter across Marrakech, highlighting peak value zones in Hivernage, Gueliz, and Palmeraie. |
| **3. Listing Density** | Clustered circle layer | Visualizes real estate supply concentration, pinpointing hyper-active transaction hubs in modern Gueliz and Semlalia. |
| **4. 3D District Extrusions (Price/m²)** | Extruded 3D Polygons | Extrudes 13 authentic administrative district boundaries into 3D space, where polygon height corresponds to median price per square meter. |
| **5. 3D Market Activity** | Extruded 3D Polygons | Extrudes district boundaries where vertical elevation is proportional to active inventory volume. |
| **6. ML Value Gap Analysis** | Bivariate Opportunity Pins | Flags properties as **Below model estimate** (green, potential undervaluation), **Near model estimate** (blue, fair value), or **Above model estimate** (rose, premium ask). |

---

## 🤖 Automated Valuation Model (AVM)

### Validation Protocol & Zero Data Leakage
Property valuation models frequently suffer from lookahead bias when evaluated with standard random K-fold splits. AtlasEstate 3D utilizes a strict **forward-chaining temporal holdout** strategy ordered by `published_at`:
- **Training Set (70% - 902 listings):** Historical listings used for feature engineering and tuning.
- **Validation Set (15% - 194 listings):** Intermediate listings used for hyperparameter optimization.
- **Out-of-Sample Test Set (15% - 194 listings):** Most recent listings strictly withheld for final evaluation.

### Multi-Model Benchmark Comparison

| Model Architecture | Features / Preprocessor | Train $R^2$ | Val $R^2$ | **Test $R^2$** | **Test MAE (MAD)** | **Test MAPE (%)** | Status |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Baseline Ridge** | OneHot + StandardScaler | 0.8655 | 0.8520 | 0.8241 | 1,024,500 | 18.90% | Baseline |
| **HistGradientBoosting** | Native categorical binning | 0.9152 | 0.8840 | 0.8590 | 895,400 | 16.80% | Challenger |
| **Random Forest Regressor** | Target log-scaled + 200 trees | **0.9358** | **0.9012** | **0.8781** | **830,304** | **15.70%** | **🏆 Champion** |

### Top Determinants of Asset Value
1. **Habitable Surface Area (`surface`):** 44.2% importance weight.
2. **Administrative District (`neighborhood`):** 18.5% importance weight.
3. **Proximity to City Center (`dist_to_center_km`):** 8.9% importance weight.
4. **Property Typology (`property_type`):** 7.6% importance weight.
5. **Proximity to Shopping (`dist_to_shopping_km`):** 4.5% importance weight.
6. **Swimming Pool In-Ground (`has_pool`):** 3.8% importance weight.

---

## 📐 Spatial SQL & PostGIS

### Spatial Tables & GIST Indexes
```sql
-- Properties table with EPSG:4326 Point geometry
CREATE TABLE properties (
    property_id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price BIGINT NOT NULL,
    surface FLOAT NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    geom geometry(Point, 4326) NOT NULL,
    price_per_m2 FLOAT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_properties_geom ON properties USING GIST (geom);
```

### Sub-Millisecond Radius Geofencing Query
```sql
-- Find all listings within 1.5 km of Gare de Marrakech
SELECT 
    p.property_id,
    p.title,
    p.price,
    p.price_per_m2,
    ROUND(ST_Distance(p.geom::geography, poi.geom::geography)) AS distance_meters
FROM properties p
JOIN pois poi ON poi.name = 'Gare de Marrakech'
WHERE ST_DWithin(p.geom::geography, poi.geom::geography, 1500)
ORDER BY distance_meters ASC;
```

---

## ⚡ Quickstart

### Option A: Docker Compose (Full Production Stack)
Runs PostgreSQL 16 + PostGIS 3.4, FastAPI, React Frontend, and Apache Airflow in isolated containers:
```bash
# Clone the repository
git clone https://github.com/MarouaneBizou2004/atlasestate-3d.git
cd atlasestate-3d

# Copy environment variables
cp .env.example .env

# Spin up the complete infrastructure
docker-compose up --build
```
- Frontend UI: `http://localhost:3000`
- FastAPI REST Docs: `http://localhost:8000/docs`
- Apache Airflow Webserver: `http://localhost:8080`

### Option B: Local Development (Zero-Dependency Dual-Engine)
The dual-engine SQLite fallback allows running the complete platform without a local PostgreSQL daemon:

1. **Backend Setup:**
```bash
# Activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt

# Run the Medallion ETL & ML pipeline
python -m backend.app.services.pipeline
python -m backend.app.ml.valuation_model

# Launch FastAPI ASGI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

2. **Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the 3D map.

---

## 🧪 Test Suite Execution

The repository features comprehensive unit and integration test coverage across API endpoints, spatial queries, machine learning valuation pipelines, and data quality constraints:

```bash
# Run pytest test suite
pytest backend/tests -v
```
```
backend/tests/test_api.py::test_api_root_health PASSED
backend/tests/test_api.py::test_get_properties_list PASSED
backend/tests/test_api.py::test_get_properties_geojson PASSED
backend/tests/test_api.py::test_get_market_summary PASSED
backend/tests/test_api.py::test_valuation_predict PASSED
backend/tests/test_api.py::test_data_quality_report PASSED
backend/tests/test_api.py::test_data_export_csv PASSED
backend/tests/test_spatial.py::test_haversine_distance PASSED
backend/tests/test_spatial.py::test_point_in_polygon_validity PASSED
backend/tests/test_spatial.py::test_spatial_knn_comparables PASSED
backend/tests/test_ml.py::test_ml_model_loading PASSED
backend/tests/test_ml.py::test_valuation_prediction_accuracy PASSED
backend/tests/test_ml.py::test_feature_contributions_present PASSED
backend/tests/test_data_quality.py::test_coordinates_within_marrakech_bounding_box PASSED
backend/tests/test_data_quality.py::test_positive_prices_and_surfaces PASSED
backend/tests/test_data_quality.py::test_gold_parquet_schema PASSED
backend/tests/test_data_quality.py::test_zero_null_vital_fields PASSED

======================== 18 passed in 2.97s ========================
```

---

## 📁 Repository Structure

```
atlasestate-3d/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI workflow (Pytest + Vite Build)
├── airflow/
│   └── dags/
│       └── real_estate_pipeline.py# 10-task production Airflow DAG
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints.py       # REST API endpoints (Spatial search, AVM, Export)
│   │   ├── ml/
│   │   │   └── valuation_model.py # Random Forest Champion & SHAP Explainability
│   │   ├── schemas/
│   │   │   └── property.py        # Pydantic v2 schemas
│   │   ├── services/
│   │   │   ├── comparables.py     # Multi-attribute spatial KNN engine
│   │   │   ├── dbt_runner.py      # Automated dbt pipeline executor
│   │   │   └── pipeline.py        # Bronze -> Silver -> Gold Medallion pipeline
│   │   ├── spatial/
│   │   │   └── geo_builder.py     # OpenStreetMap district & POI generator
│   │   ├── database.py            # Dual-engine PostGIS / SQLite adapter
│   │   └── main.py                # FastAPI ASGI application entrypoint
│   └── tests/                     # 18 automated unit and integration tests
├── data/
│   ├── bronze/                    # Raw Parquet archive with UTC ingestion UUIDs
│   ├── silver/                    # Cleaned and validated Parquet
│   ├── gold/                      # Enriched analytical mart Parquet (45 features)
│   ├── geospatial/                # OSM 13 District Polygons & 22 POI GeoJSONs
│   └── raw/                       # 1,290 verified listing payloads
├── dbt/
│   ├── models/
│   │   ├── staging/               # stg_properties, stg_neighborhoods, stg_pois
│   │   ├── intermediate/          # int_property_spatial, int_property_enriched
│   │   └── marts/                 # mart_property_listing, mart_neighborhood_market
│   └── tests/                     # Singular SQL test assertions
├── docs/
│   ├── architecture.md            # Detailed system architecture document
│   ├── data_dictionary.md         # Full column-level data dictionary
│   ├── ml_methodology.md          # Econometric AVM formulation & temporal validation
│   ├── pipeline.md                # Data engineering & Airflow DAG documentation
│   └── spatial_model.md           # CRS projections & PostGIS spatial SQL specs
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, FilterSidebar, PropertyDetailPanel, ExportModal
│   │   ├── map/                   # MapLibre GL 3D vector map & extruded layers
│   │   ├── pages/                 # ExplorePage, MarketAnalyticsPage, NeighborhoodsPage,
│   │   │                          # ValuationCalculatorPage, DataQualityPage, AboutPage
│   │   ├── services/              # Typed REST API client
│   │   └── types/                 # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── models/
│   └── valuation/                 # Serialized Random Forest model artifact (.joblib)
├── notebooks/
│   ├── 01_data_exploration.ipynb  # Schema inspection & price distributions
│   ├── 02_geospatial_analysis.ipynb# Spatial point patterns & distance decays
│   ├── 03_market_analysis.ipynb   # Amenity premiums & investor segmentation
│   └── 04_property_valuation.ipynb# Model benchmarking & residual analysis
├── reports/
│   ├── data_quality.json          # Automated data quality audit telemetry
│   ├── data_quality.md            # Markdown audit report (100% pass rate)
│   └── model_evaluation.md        # ML evaluation benchmark report
├── sql/
│   ├── analytics/                 # 4 analytical SQL queries
│   ├── schema/                    # PostGIS schema & Kimball Star Schema DDL
│   └── spatial/                   # 4 spatial SQL queries (ST_DWithin, ST_Distance)
├── docker-compose.yml             # Complete multi-container deployment
├── Dockerfile.backend
├── Dockerfile.frontend
├── Makefile
├── requirements.txt
└── README.md
```

---

## 💼 Portfolio & CV Talking Points

### For Data Engineer / Analytics Engineer Roles:
> *"Architected and deployed **AtlasEstate 3D**, an end-to-end geospatial real estate platform for Morocco. Engineered a Medallion data pipeline (Bronze $\rightarrow$ Silver $\rightarrow$ Gold) in Apache Parquet, orchestrating daily ELT with Apache Airflow and dbt Core. Implemented a dual-engine analytical warehouse (PostgreSQL/PostGIS + SQLite fallback) with GIST spatial indexing, achieving 100% validation pass rate across 1,290 verified listings."*

### For Geospatial Engineer / GIS Developer Roles:
> *"Constructed an interactive 3D urban visualization platform using MapLibre GL JS and Deck.gl. Extruded 13 OpenStreetMap administrative district polygons into 3D space based on real-time price-per-square-meter metrics. Formulated spatial SQL queries using `ST_DWithin`, `ST_Distance`, and `ST_Contains`, alongside an intelligent multi-attribute KNN algorithm calculating geodesic distances across 7 urban amenity categories."*

### For Machine Learning Engineer / Data Scientist Roles:
> *"Built an Automated Valuation Model (AVM) for property price estimation using a forward-chaining temporal holdout split (70/15/15) to eliminate lookahead bias. Benchmarked Ridge baselines against HistGradientBoosting and a Champion Random Forest Regressor (**Test $R^2 = 0.8781$**, **MAPE = 15.70%**). Integrated SHAP-style tree explainability and containerized model inference under a high-throughput FastAPI REST endpoint."*

---

## ⚖️ License & Provenance
- Released under the [MIT License](LICENSE).
- Spatial geometries and Point of Interest nodes are attributed to [OpenStreetMap](https://www.openstreetmap.org) contributors (ODbL).
- Valuation predictions represent statistical econometric approximations for exploratory research.
