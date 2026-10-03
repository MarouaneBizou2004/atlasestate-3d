# AtlasEstate 3D - Data Dictionary & Schema Specifications

## 1. Overview
This document specifies the exact schemas across all stages of the AtlasEstate 3D data pipeline:
1. Raw Listing Schema
2. Bronze Parquet Schema
3. Silver Cleansed Schema
4. Gold Enriched Feature Matrix
5. PostGIS Spatial Schema & Star Schema Warehouse

---

## 2. Gold Layer Feature Matrix (`data/gold/gold_properties_enriched.parquet`)

| Column Name | Data Type | Nullable | Description / Business Rule | Example |
|:---|:---|:---:|:---|:---|
| `property_id` | `VARCHAR(64)` | No | Unique property identifier (MD5 hash / synthetic UUID) | `PROP_0001` |
| `title` | `VARCHAR(255)` | No | Listing headline in French/English | `Appartement moderne avec terrasse à Guéliz` |
| `price` | `BIGINT` | No | Total asking / transaction price in Moroccan Dirhams (MAD) | `2,450,000` |
| `surface` | `FLOAT` | No | Habitable surface area in square meters ($m^2$) | `115.0` |
| `property_type` | `VARCHAR(50)` | No | Categorical typology: `apartment`, `villa`, `riad`, `commercial`, `land` | `apartment` |
| `neighborhood` | `VARCHAR(100)` | No | Administrative district in Marrakech | `Gueliz` |
| `city` | `VARCHAR(50)` | No | Urban jurisdiction | `Marrakech` |
| `bedrooms` | `INTEGER` | No | Number of closed bedroom chambers ($0 \le n \le 20$) | `2` |
| `bathrooms` | `INTEGER` | No | Number of dedicated bath / shower facilities ($1 \le n \le 15$) | `2` |
| `floor` | `INTEGER` | No | Floor level ($0 = \text{ground floor}$) | `3` |
| `total_floors` | `INTEGER` | No | Total storeys of the building structure | `5` |
| `year_built` | `INTEGER` | No | Year of construction / major architectural overhaul | `2019` |
| `condition` | `VARCHAR(50)` | No | Interior state: `new`, `excellent`, `good`, `needs_renovation` | `excellent` |
| `has_elevator` | `BOOLEAN` | No | Binary flag: Presence of working passenger lift | `True` |
| `has_balcony` | `BOOLEAN` | No | Binary flag: Exterior balcony area | `True` |
| `has_terrace` | `BOOLEAN` | No | Binary flag: Private or shared rooftop/ground terrace | `False` |
| `has_garden` | `BOOLEAN` | No | Binary flag: Private landscaped or paved garden | `False` |
| `has_pool` | `BOOLEAN` | No | Binary flag: In-ground or rooftop swimming pool | `False` |
| `has_parking` | `BOOLEAN` | No | Binary flag: Dedicated garage, basement, or surface parking | `True` |
| `has_security` | `BOOLEAN` | No | Binary flag: 24/7 concierge, guard, or video surveillance | `True` |
| `has_air_conditioning`| `BOOLEAN` | No | Binary flag: Split-unit or central HVAC installation | `True` |
| `is_furnished` | `BOOLEAN` | No | Binary flag: Sold fully appointed with furnishings | `False` |
| `latitude` | `FLOAT` | No | Geodetic latitude in WGS 84 (EPSG:4326) | `31.63412` |
| `longitude` | `FLOAT` | No | Geodetic longitude in WGS 84 (EPSG:4326) | `-8.01254` |
| `price_per_m2` | `FLOAT` | No | Calculated unit price: $\text{price} / \text{surface}$ (MAD/$m^2$) | `21,304.3` |
| `published_at` | `VARCHAR(32)` | No | ISO-8601 publication timestamp | `2024-03-15T09:30:00Z` |
| `dist_to_center_km` | `FLOAT` | No | Geodesic Haversine distance to Gueliz central plaza | `0.85` |
| `dist_to_medina_km` | `FLOAT` | No | Geodesic distance to Jemaa el-Fnaa square | `2.10` |
| `dist_to_transit_km` | `FLOAT` | No | Geodesic distance to Gare de Marrakech / CTM terminus | `0.42` |
| `dist_to_airport_km` | `FLOAT` | No | Geodesic distance to Marrakech-Menara Airport (RAK) | `4.15` |
| `dist_to_hospital_km`| `FLOAT` | No | Geodesic distance to CHU Mohammed VI Hospital | `1.20` |
| `dist_to_school_km` | `FLOAT` | No | Geodesic distance to nearest accredited educational facility | `0.65` |
| `dist_to_shopping_km`| `FLOAT` | No | Geodesic distance to Carre Eden / Menara Mall | `0.30` |
| `predicted_price` | `BIGINT` | No | Model estimate from Champion Random Forest Regressor | `2,380,000` |
| `value_gap` | `BIGINT` | No | Difference: $\text{price} - \text{predicted\_price}$ (MAD) | `+70,000` |
| `value_gap_percent`| `FLOAT` | No | Percentage gap: $((\text{price} - \hat{y}) / \hat{y}) \times 100$ | `+2.94%` |
| `valuation_status` | `VARCHAR(50)` | No | Ethical status: `Below model estimate`, `Near model estimate`, `Above model estimate` | `Near model estimate` |

---

## 3. PostGIS Spatial Schema DDL Summary

```sql
-- Core Properties Table with Spatial Point Geometry
CREATE TABLE properties (
    property_id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price BIGINT NOT NULL,
    surface FLOAT NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    geom geometry(Point, 4326) NOT NULL,
    price_per_m2 FLOAT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Spatial GIST Index for Sub-Millisecond Spatial Filtering
CREATE INDEX idx_properties_geom ON properties USING GIST (geom);
CREATE INDEX idx_properties_neighborhood ON properties (neighborhood);
CREATE INDEX idx_properties_price ON properties (price);
CREATE INDEX idx_properties_type ON properties (property_type);
```

---

## 4. Star Schema Data Warehouse

```
                +----------------------------+
                |         dim_date           |
                +----------------------------+
                | date_id (PK)               |
                | full_date                  |
                | year, quarter, month, day  |
                +--------------+-------------+
                               |
                               |
+---------------------+        |        +--------------------------+
|      dim_city       |        |        |     dim_neighborhood     |
+---------------------+        |        +--------------------------+
| city_id (PK)        |        |        | neighborhood_id (PK)     |
| city_name           |        |        | neighborhood_name        |
| region              |        |        | city_id (FK)             |
+----------+----------+        |        +------------+-------------+
           |                   |                     |
           |     +-------------+-------------+       |
           +---->|   fact_property_listing   |<------+
                 +---------------------------+
                 | listing_id (PK)           |
                 | property_id (FK)          |
                 | neighborhood_id (FK)      |
                 | city_id (FK)              |
                 | date_id (FK)              |
                 | asking_price_mad          |
                 | surface_m2                |
                 | price_per_m2              |
                 | predicted_price_mad       |
                 | value_gap_mad             |
                 +-------------+-------------+
                               |
                 +-------------+-------------+
                 |        dim_property       |
                 +---------------------------+
                 | property_id (PK)          |
                 | property_type             |
                 | bedrooms, bathrooms       |
                 | pool, parking, elevator   |
                 | condition, year_built     |
                 +---------------------------+
```
