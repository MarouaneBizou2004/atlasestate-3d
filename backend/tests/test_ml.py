"""
Automated Unit Tests: Machine Learning Valuation & Explainability
"""

import pytest
from backend.app.ml.valuation_model import PropertyValuationModel

@pytest.fixture(scope="module")
def valuation_model():
    model = PropertyValuationModel()
    return model

def test_valuation_prediction_positive_price(valuation_model):
    features = {
        "surface_m2": 110,
        "bedrooms": 2,
        "bathrooms": 2,
        "rooms": 4,
        "floor": 2,
        "building_age": 5,
        "property_type": "Apartment",
        "neighborhood": "Gueliz",
        "pool": False,
        "parking": True,
        "elevator": True,
        "terrace": True,
        "garden": False,
        "balcony": True,
        "air_conditioning": True,
        "security": True,
        "furnished": False,
        "distance_to_city_center_m": 1200.0,
        "distance_to_transit_m": 500.0,
        "distance_to_hospital_m": 800.0,
        "distance_to_school_m": 600.0,
        "distance_to_attraction_m": 1500.0,
        "distance_to_shopping_m": 400.0,
        "latitude": 31.6346,
        "longitude": -8.0125
    }
    pred = valuation_model.predict_property(features)
    assert pred["estimated_price_mad"] > 0
    assert pred["estimated_price_per_m2"] > 0
    assert pred["confidence_band_mad"]["lower"] < pred["estimated_price_mad"] < pred["confidence_band_mad"]["upper"]

def test_villa_pricing_premium_over_apartment(valuation_model):
    # Same surface and neighborhood: Villa with pool should be valued higher than basic apartment
    base_props = {
        "surface_m2": 250, "bedrooms": 4, "bathrooms": 3, "rooms": 6, "floor": 0,
        "building_age": 5, "neighborhood": "Targa", "parking": True, "elevator": False,
        "distance_to_city_center_m": 3500.0, "latitude": 31.6450, "longitude": -8.0550
    }
    
    villa_props = {**base_props, "property_type": "Villa", "pool": True, "garden": True}
    apt_props = {**base_props, "property_type": "Apartment", "pool": False, "garden": False}
    
    villa_pred = valuation_model.predict_property(villa_props)["estimated_price_mad"]
    apt_pred = valuation_model.predict_property(apt_props)["estimated_price_mad"]
    
    assert villa_pred > apt_pred, f"Expected Villa ({villa_pred:,}) > Apartment ({apt_pred:,})"

def test_feature_contributions_structure(valuation_model):
    sample = {
        "surface_m2": 85, "bedrooms": 2, "bathrooms": 1, "rooms": 3,
        "neighborhood": "Gueliz", "property_type": "Apartment", "pool": False, "parking": True
    }
    res = valuation_model.predict_property(sample)
    contributions = res["feature_contributions"]
    assert len(contributions) >= 2
    for c in contributions:
        assert "factor" in c
        assert "impact_mad" in c
        assert c["type"] in ["positive", "negative"]
