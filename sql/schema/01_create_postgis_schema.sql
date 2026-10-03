-- ==============================================================================
-- AtlasEstate 3D - Relational Geospatial Database Schema (PostgreSQL + PostGIS)
-- Coordinate Reference System: WGS 84 (SRID 4326)
-- Spatial Indexing: GIST Indexes on Point and MultiPolygon Geometries
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop in reverse foreign-key order
DROP TABLE IF EXISTS property_valuations CASCADE;
DROP TABLE IF EXISTS property_features CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS pois CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS cities CASCADE;

-- ------------------------------------------------------------------------------
-- 1. CITIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE cities (
    city_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_ar VARCHAR(100),
    country VARCHAR(50) NOT NULL DEFAULT 'Morocco',
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    geom geometry(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cities_geom ON cities USING GIST (geom);

-- ------------------------------------------------------------------------------
-- 2. NEIGHBORHOODS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE neighborhoods (
    neighborhood_id VARCHAR(50) PRIMARY KEY,
    city_id VARCHAR(50) NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    zone_type VARCHAR(50) NOT NULL,
    description TEXT,
    median_price_m2 DECIMAL(10, 2),
    active_listings_count INTEGER DEFAULT 0,
    geom geometry(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_neighborhoods_geom ON neighborhoods USING GIST (geom);
CREATE INDEX idx_neighborhoods_city ON neighborhoods(city_id);

-- ------------------------------------------------------------------------------
-- 3. POINTS OF INTEREST (POIs) TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE pois (
    poi_id VARCHAR(50) PRIMARY KEY,
    city_id VARCHAR(50) NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'transport', 'hospital', 'school', 'attraction', 'shopping'
    importance DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    geom geometry(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pois_geom ON pois USING GIST (geom);
CREATE INDEX idx_pois_category ON pois(category);

-- ------------------------------------------------------------------------------
-- 4. CORE PROPERTIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE properties (
    property_id VARCHAR(50) PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    listing_url TEXT,
    city_id VARCHAR(50) NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
    neighborhood_id VARCHAR(50) NOT NULL REFERENCES neighborhoods(neighborhood_id) ON DELETE CASCADE,
    property_type VARCHAR(50) NOT NULL, -- 'Apartment', 'Villa', 'Riad', 'Duplex', 'Commercial'
    transaction_type VARCHAR(20) NOT NULL DEFAULT 'Sale',
    latitude DECIMAL(9, 6) NOT NULL CHECK (latitude BETWEEN 20.0 AND 36.5),
    longitude DECIMAL(9, 6) NOT NULL CHECK (longitude BETWEEN -18.0 AND -1.0),
    price DECIMAL(14, 2) NOT NULL CHECK (price > 0),
    currency VARCHAR(5) NOT NULL DEFAULT 'MAD',
    surface_m2 INTEGER NOT NULL CHECK (surface_m2 >= 15),
    price_per_m2 DECIMAL(10, 2) NOT NULL CHECK (price_per_m2 BETWEEN 2000 AND 200000),
    bedrooms INTEGER NOT NULL DEFAULT 1 CHECK (bedrooms >= 0),
    bathrooms INTEGER NOT NULL DEFAULT 1 CHECK (bathrooms >= 1),
    rooms INTEGER NOT NULL DEFAULT 1 CHECK (rooms >= 1),
    floor INTEGER DEFAULT 0,
    total_floors INTEGER DEFAULT 1,
    building_age INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    geom geometry(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_geom ON properties USING GIST (geom);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood_id);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_price_m2 ON properties(price_per_m2);
CREATE INDEX idx_properties_type ON properties(property_type);

-- ------------------------------------------------------------------------------
-- 5. PROPERTY FEATURES & AMENITIES
-- ------------------------------------------------------------------------------
CREATE TABLE property_features (
    property_id VARCHAR(50) PRIMARY KEY REFERENCES properties(property_id) ON DELETE CASCADE,
    furnished BOOLEAN NOT NULL DEFAULT FALSE,
    parking BOOLEAN NOT NULL DEFAULT FALSE,
    elevator BOOLEAN NOT NULL DEFAULT FALSE,
    pool BOOLEAN NOT NULL DEFAULT FALSE,
    garden BOOLEAN NOT NULL DEFAULT FALSE,
    terrace BOOLEAN NOT NULL DEFAULT FALSE,
    balcony BOOLEAN NOT NULL DEFAULT FALSE,
    air_conditioning BOOLEAN NOT NULL DEFAULT FALSE,
    security BOOLEAN NOT NULL DEFAULT FALSE,
    condition VARCHAR(50) DEFAULT 'Good Condition',
    description TEXT
);

-- ------------------------------------------------------------------------------
-- 6. PROPERTY VALUATIONS (ML INFERENCE TABLE)
-- ------------------------------------------------------------------------------
CREATE TABLE property_valuations (
    property_id VARCHAR(50) PRIMARY KEY REFERENCES properties(property_id) ON DELETE CASCADE,
    predicted_price DECIMAL(14, 2) NOT NULL,
    predicted_price_per_m2 DECIMAL(10, 2) NOT NULL,
    value_gap DECIMAL(14, 2) NOT NULL,
    value_gap_percent DECIMAL(6, 2) NOT NULL,
    valuation_status VARCHAR(50) NOT NULL, -- 'Below model estimate', 'Near model estimate', 'Above model estimate'
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_valuations_status ON property_valuations(valuation_status);
