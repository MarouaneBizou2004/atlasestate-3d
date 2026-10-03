"""
Automated Unit Tests: Geospatial Calculations & Spatial Analysis
"""

import pytest
from backend.app.services.comparables import haversine, ComparablesEngine

def test_haversine_known_coordinates():
    # Distance between Gueliz Plaza (31.6346, -8.0125) and Jemaa el-Fnaa (31.6258, -7.9891)
    # Geodesic distance is approximately 2.4 - 2.5 km
    dist = haversine(31.6346, -8.0125, 31.6258, -7.9891)
    assert 2200 < dist < 2600, f"Expected approx 2400m, got {dist}m"

def test_haversine_same_point():
    dist = haversine(31.6346, -8.0125, 31.6346, -8.0125)
    assert dist == 0.0

def test_comparables_similarity_ranking():
    import pandas as pd
    dummy_df = pd.DataFrame([
        {
            "property_id": "P001", "source": "Mubawab", "listing_url": "http://test",
            "neighborhood": "Gueliz", "property_type": "Apartment", "price": 2000000,
            "surface_m2": 100, "price_per_m2": 20000.0, "bedrooms": 2, "bathrooms": 2,
            "latitude": 31.6346, "longitude": -8.0125, "pool": False, "parking": True, "elevator": True
        },
        {
            # Highly similar neighbor (close coordinates, similar surface)
            "property_id": "P002", "source": "Mubawab", "listing_url": "http://test",
            "neighborhood": "Gueliz", "property_type": "Apartment", "price": 2050000,
            "surface_m2": 102, "price_per_m2": 20098.0, "bedrooms": 2, "bathrooms": 2,
            "latitude": 31.6350, "longitude": -8.0120, "pool": False, "parking": True, "elevator": True
        },
        {
            # Dissimilar property (distant villa in Palmeraie)
            "property_id": "P003", "source": "Mubawab", "listing_url": "http://test",
            "neighborhood": "Palmeraie", "property_type": "Villa", "price": 10000000,
            "surface_m2": 450, "price_per_m2": 22222.0, "bedrooms": 5, "bathrooms": 5,
            "latitude": 31.6750, "longitude": -7.9450, "pool": True, "parking": True, "elevator": False
        }
    ])
    
    engine = ComparablesEngine(dummy_df)
    target = dummy_df.iloc[0].to_dict()
    comps = engine.find_comparables(target, top_k=2)
    
    assert len(comps) == 2
    # P002 must rank higher in similarity than P003
    assert comps[0]["property_id"] == "P002"
    assert comps[0]["similarity_score_pct"] > comps[1]["similarity_score_pct"]
