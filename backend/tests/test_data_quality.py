"""
Automated Unit Tests: Data Quality Pipeline & Validation Rules
"""

import pytest
import pandas as pd
from backend.app.services.pipeline import MedallionPipeline

@pytest.fixture
def sample_raw_df():
    return pd.DataFrame([
        {
            "property_id": "VALID_01", "source": "Test", "listing_url": "http://test/1",
            "city": "Marrakech", "neighborhood": "Gueliz", "neighborhood_id": "gueliz",
            "property_type": "Apartment", "transaction_type": "Sale",
            "latitude": 31.6346, "longitude": -8.0125, "price": 1800000,
            "currency": "MAD", "surface_m2": 100, "price_per_m2": 18000,
            "bedrooms": 2, "bathrooms": 2, "rooms": 4, "floor": 2, "total_floors": 5,
            "building_age": 2, "published_at": "2024-06-01 10:00:00 UTC",
            "furnished": False, "parking": True, "elevator": True, "pool": False,
            "garden": False, "terrace": False, "balcony": True, "air_conditioning": True,
            "security": True, "condition": "Good Condition", "description": "Nice flat"
        },
        {
            # Duplicate ID
            "property_id": "VALID_01", "source": "Test", "listing_url": "http://test/1",
            "city": "Marrakech", "neighborhood": "Gueliz", "neighborhood_id": "gueliz",
            "property_type": "Apartment", "transaction_type": "Sale",
            "latitude": 31.6346, "longitude": -8.0125, "price": 1800000,
            "currency": "MAD", "surface_m2": 100, "price_per_m2": 18000,
            "bedrooms": 2, "bathrooms": 2, "rooms": 4, "floor": 2, "total_floors": 5,
            "building_age": 2, "published_at": "2024-06-01 10:00:00 UTC",
            "furnished": False, "parking": True, "elevator": True, "pool": False,
            "garden": False, "terrace": False, "balcony": True, "air_conditioning": True,
            "security": True, "condition": "Good Condition", "description": "Nice flat"
        },
        {
            # Invalid Coordinates (Outside Morocco)
            "property_id": "BAD_COORDS", "source": "Test", "listing_url": "http://test/2",
            "city": "Marrakech", "neighborhood": "Gueliz", "neighborhood_id": "gueliz",
            "property_type": "Apartment", "transaction_type": "Sale",
            "latitude": 45.0000, "longitude": 2.0000, "price": 1500000,
            "currency": "MAD", "surface_m2": 80, "price_per_m2": 18750,
            "bedrooms": 2, "bathrooms": 1, "rooms": 3, "floor": 1, "total_floors": 4,
            "building_age": 5, "published_at": "2024-06-02 10:00:00 UTC",
            "furnished": False, "parking": False, "elevator": False, "pool": False,
            "garden": False, "terrace": False, "balcony": False, "air_conditioning": False,
            "security": False, "condition": "Good Condition", "description": "Bad coords"
        },
        {
            # Non-positive price
            "property_id": "BAD_PRICE", "source": "Test", "listing_url": "http://test/3",
            "city": "Marrakech", "neighborhood": "Gueliz", "neighborhood_id": "gueliz",
            "property_type": "Apartment", "transaction_type": "Sale",
            "latitude": 31.6340, "longitude": -8.0120, "price": -500000,
            "currency": "MAD", "surface_m2": 80, "price_per_m2": -6250,
            "bedrooms": 2, "bathrooms": 1, "rooms": 3, "floor": 1, "total_floors": 4,
            "building_age": 5, "published_at": "2024-06-03 10:00:00 UTC",
            "furnished": False, "parking": False, "elevator": False, "pool": False,
            "garden": False, "terrace": False, "balcony": False, "air_conditioning": False,
            "security": False, "condition": "Good Condition", "description": "Bad price"
        },
        {
            # Zero / Tiny surface (<15 m2)
            "property_id": "BAD_SURF", "source": "Test", "listing_url": "http://test/4",
            "city": "Marrakech", "neighborhood": "Gueliz", "neighborhood_id": "gueliz",
            "property_type": "Apartment", "transaction_type": "Sale",
            "latitude": 31.6340, "longitude": -8.0120, "price": 1000000,
            "currency": "MAD", "surface_m2": 5, "price_per_m2": 200000,
            "bedrooms": 1, "bathrooms": 1, "rooms": 1, "floor": 1, "total_floors": 4,
            "building_age": 5, "published_at": "2024-06-04 10:00:00 UTC",
            "furnished": False, "parking": False, "elevator": False, "pool": False,
            "garden": False, "terrace": False, "balcony": False, "air_conditioning": False,
            "security": False, "condition": "Good Condition", "description": "Bad surface"
        }
    ])

def test_validation_cleansing_rules(sample_raw_df):
    pipeline = MedallionPipeline()
    silver_df = pipeline.run_silver_validation(sample_raw_df)
    
    # Out of 5 rows, only 1 valid row (VALID_01) should remain
    assert len(silver_df) == 1
    assert silver_df.iloc[0]["property_id"] == "VALID_01"
    
    metrics = pipeline.quality_metrics
    assert metrics["duplicates_removed"] == 1
    assert metrics["invalid_coordinates"] == 1
    assert metrics["invalid_prices"] == 1
    assert metrics["invalid_surfaces"] == 1
