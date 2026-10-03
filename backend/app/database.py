"""
Database Engine & Dual-Engine Session Management
Supports both PostgreSQL/PostGIS (Production/Docker) and SQLite with Spatial Extensions (Local/CI).
Populates tables directly from Gold Layer and GeoJSON definitions.
"""

import json
import os
import sqlite3
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
GOLD_DIR = DATA_DIR / "gold"
GEOSPATIAL_DIR = DATA_DIR / "geospatial"

SQLITE_DB_PATH = DATA_DIR / "atlasestate.db"
DEFAULT_DB_URL = f"sqlite:///{SQLITE_DB_PATH}"

# Check environment for PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL)
USE_SQLITE = os.getenv("USE_SQLITE_FALLBACK", "True").lower() in ("true", "1", "yes") or "sqlite" in DATABASE_URL

if USE_SQLITE:
    connect_args = {"check_same_thread": False}
    engine = create_engine(f"sqlite:///{SQLITE_DB_PATH}", connect_args=connect_args)
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_and_seed_database():
    """
    Initializes database tables and seeds them with authentic Gold Layer data
    and Marrakech GeoJSON definitions.
    """
    print("Initializing Database and Seeding Datasets...")
    
    # Read Gold data and GeoJSON files
    gold_file = GOLD_DIR / "gold_properties_enriched.parquet"
    if not gold_file.exists():
        raise FileNotFoundError(f"Gold layer file not found at {gold_file}. Run pipeline first.")
    df_gold = pd.read_parquet(gold_file)
    
    with open(GEOSPATIAL_DIR / "marrakech_neighborhoods.geojson", "r", encoding="utf-8") as f:
        neigh_fc = json.load(f)
    with open(GEOSPATIAL_DIR / "marrakech_pois.geojson", "r", encoding="utf-8") as f:
        pois_fc = json.load(f)
        
    with engine.begin() as conn:
        # Create standard relational tables
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS cities (
                city_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                name_ar TEXT,
                country TEXT DEFAULT 'Morocco',
                latitude REAL NOT NULL,
                longitude REAL NOT NULL
            );
        """))
        
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS neighborhoods (
                neighborhood_id TEXT PRIMARY KEY,
                city_id TEXT NOT NULL,
                name TEXT NOT NULL,
                name_ar TEXT,
                zone_type TEXT NOT NULL,
                description TEXT,
                median_price_m2 REAL,
                active_listings_count INTEGER,
                geojson_geometry TEXT NOT NULL
            );
        """))
        
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS pois (
                poi_id TEXT PRIMARY KEY,
                city_id TEXT NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                importance REAL NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL
            );
        """))
        
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS properties (
                property_id TEXT PRIMARY KEY,
                source TEXT NOT NULL,
                listing_url TEXT,
                city_id TEXT NOT NULL,
                neighborhood_id TEXT NOT NULL,
                neighborhood TEXT NOT NULL,
                property_type TEXT NOT NULL,
                transaction_type TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                price INTEGER NOT NULL,
                currency TEXT DEFAULT 'MAD',
                surface_m2 INTEGER NOT NULL,
                price_per_m2 REAL NOT NULL,
                bedrooms INTEGER NOT NULL,
                bathrooms INTEGER NOT NULL,
                rooms INTEGER NOT NULL,
                floor INTEGER,
                total_floors INTEGER,
                building_age INTEGER,
                furnished BOOLEAN,
                parking BOOLEAN,
                elevator BOOLEAN,
                pool BOOLEAN,
                garden BOOLEAN,
                terrace BOOLEAN,
                balcony BOOLEAN,
                air_conditioning BOOLEAN,
                security BOOLEAN,
                condition TEXT,
                description TEXT,
                published_at TEXT,
                predicted_price INTEGER,
                predicted_price_per_m2 REAL,
                value_gap INTEGER,
                value_gap_percent REAL,
                valuation_status TEXT,
                distance_to_city_center_m REAL,
                distance_to_transit_m REAL,
                distance_to_hospital_m REAL,
                distance_to_school_m REAL,
                distance_to_attraction_m REAL,
                distance_to_shopping_m REAL
            );
        """))

        # Seed City
        conn.execute(text("""
            INSERT OR REPLACE INTO cities (city_id, name, name_ar, country, latitude, longitude)
            VALUES ('marrakech', 'Marrakech', 'مراكش', 'Morocco', 31.6295, -7.9811);
        """))
        
        # Seed Neighborhoods
        for feat in neigh_fc["features"]:
            props = feat["properties"]
            geom_str = json.dumps(feat["geometry"])
            count_in_neigh = int((df_gold["neighborhood_id"] == props["id"]).sum())
            median_ppm2 = float(df_gold[df_gold["neighborhood_id"] == props["id"]]["price_per_m2"].median()) if count_in_neigh > 0 else props["median_price_m2"]
            
            conn.execute(text("""
                INSERT OR REPLACE INTO neighborhoods (
                    neighborhood_id, city_id, name, name_ar, zone_type, description,
                    median_price_m2, active_listings_count, geojson_geometry
                ) VALUES (
                    :id, 'marrakech', :name, :name_ar, :zone_type, :desc, :median_ppm2, :count, :geom
                );
            """), {
                "id": props["id"],
                "name": props["name"],
                "name_ar": props["name_ar"],
                "zone_type": props["zone_type"],
                "desc": props["description"],
                "median_ppm2": median_ppm2,
                "count": count_in_neigh,
                "geom": geom_str
            })
            
        # Seed POIs
        for feat in pois_fc["features"]:
            p = feat["properties"]
            conn.execute(text("""
                INSERT OR REPLACE INTO pois (
                    poi_id, city_id, name, category, importance, latitude, longitude
                ) VALUES (
                    :poi_id, 'marrakech', :name, :category, :importance, :lat, :lon
                );
            """), {
                "poi_id": p["poi_id"],
                "name": p["name"],
                "category": p["category"],
                "importance": p["importance"],
                "lat": p["latitude"],
                "lon": p["longitude"]
            })
            
        # Seed Properties
        # Map boolean columns to int for SQLite compatibility
        df_seed = df_gold.copy()
        df_seed["city_id"] = "marrakech"
        
        # Persist into properties table
        df_seed.to_sql("properties", conn, if_exists="replace", index=False)
        
        # Create useful indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_prop_neigh ON properties(neighborhood_id);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_prop_type ON properties(property_type);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_prop_price ON properties(price);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_prop_status ON properties(valuation_status);"))
        
    print(f"Database successfully initialized and seeded with {len(df_gold):,} properties, {len(neigh_fc['features'])} neighborhoods, and {len(pois_fc['features'])} POIs.")

if __name__ == "__main__":
    init_and_seed_database()
