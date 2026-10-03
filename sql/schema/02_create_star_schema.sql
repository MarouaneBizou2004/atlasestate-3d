-- ==============================================================================
-- AtlasEstate 3D - Analytical Star Schema Warehouse Model
-- Grain: One record per property listing snapshot in fact_property_listing
-- ==============================================================================

DROP TABLE IF EXISTS fact_property_listing CASCADE;
DROP TABLE IF EXISTS fact_market_snapshot CASCADE;
DROP TABLE IF EXISTS dim_property CASCADE;
DROP TABLE IF EXISTS dim_location CASCADE;
DROP TABLE IF EXISTS dim_neighborhood CASCADE;
DROP TABLE IF EXISTS dim_city CASCADE;
DROP TABLE IF EXISTS dim_property_type CASCADE;
DROP TABLE IF EXISTS dim_date CASCADE;

-- ------------------------------------------------------------------------------
-- DIMENSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE dim_city (
    city_key SERIAL PRIMARY KEY,
    city_id VARCHAR(50) NOT NULL UNIQUE,
    city_name VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL
);

CREATE TABLE dim_neighborhood (
    neighborhood_key SERIAL PRIMARY KEY,
    neighborhood_id VARCHAR(50) NOT NULL UNIQUE,
    neighborhood_name VARCHAR(100) NOT NULL,
    zone_type VARCHAR(50) NOT NULL,
    city_id VARCHAR(50) NOT NULL
);

CREATE TABLE dim_property_type (
    property_type_key SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL -- 'Residential', 'Luxury', 'Commercial'
);

CREATE TABLE dim_date (
    date_key INTEGER PRIMARY KEY, -- Smart Key YYYYMMDD
    full_date DATE NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    month INTEGER NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    day_of_month INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL
);

CREATE TABLE dim_location (
    location_key SERIAL PRIMARY KEY,
    neighborhood_id VARCHAR(50) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    distance_to_center_m DECIMAL(10, 2),
    distance_to_transit_m DECIMAL(10, 2),
    distance_to_hospital_m DECIMAL(10, 2)
);

CREATE TABLE dim_property (
    property_key SERIAL PRIMARY KEY,
    property_id VARCHAR(50) NOT NULL UNIQUE,
    source VARCHAR(100) NOT NULL,
    surface_m2 INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    rooms INTEGER NOT NULL,
    has_pool BOOLEAN NOT NULL,
    has_parking BOOLEAN NOT NULL,
    has_elevator BOOLEAN NOT NULL,
    has_terrace BOOLEAN NOT NULL,
    has_garden BOOLEAN NOT NULL
);

-- ------------------------------------------------------------------------------
-- FACTS
-- ------------------------------------------------------------------------------
CREATE TABLE fact_property_listing (
    listing_fact_key BIGSERIAL PRIMARY KEY,
    property_key INTEGER NOT NULL REFERENCES dim_property(property_key),
    location_key INTEGER NOT NULL REFERENCES dim_location(location_key),
    neighborhood_key INTEGER NOT NULL REFERENCES dim_neighborhood(neighborhood_key),
    city_key INTEGER NOT NULL REFERENCES dim_city(city_key),
    property_type_key INTEGER NOT NULL REFERENCES dim_property_type(property_type_key),
    date_key INTEGER NOT NULL REFERENCES dim_date(date_key),
    asking_price DECIMAL(14, 2) NOT NULL,
    price_per_m2 DECIMAL(10, 2) NOT NULL,
    predicted_price DECIMAL(14, 2),
    value_gap DECIMAL(14, 2),
    value_gap_percent DECIMAL(6, 2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_fact_listing_neigh ON fact_property_listing(neighborhood_key);
CREATE INDEX idx_fact_listing_date ON fact_property_listing(date_key);
CREATE INDEX idx_fact_listing_price ON fact_property_listing(asking_price);

CREATE TABLE fact_market_snapshot (
    snapshot_key SERIAL PRIMARY KEY,
    neighborhood_key INTEGER NOT NULL REFERENCES dim_neighborhood(neighborhood_key),
    date_key INTEGER NOT NULL REFERENCES dim_date(date_key),
    total_listings INTEGER NOT NULL,
    median_price DECIMAL(14, 2) NOT NULL,
    average_price DECIMAL(14, 2) NOT NULL,
    median_price_per_m2 DECIMAL(10, 2) NOT NULL,
    average_surface_m2 DECIMAL(8, 2) NOT NULL,
    average_bedrooms DECIMAL(4, 2) NOT NULL
);
