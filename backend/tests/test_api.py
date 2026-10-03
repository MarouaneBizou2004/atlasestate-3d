"""
Automated Integration Tests: FastAPI REST Endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert "pilot_city" in data

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "HEALTHY"

def test_get_properties_pagination_and_filter(client):
    # Test basic list
    res = client.get("/api/properties?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert len(data["properties"]) == 10
    assert data["total_count"] > 1000

    # Test filtering by neighborhood
    res_gueliz = client.get("/api/properties?neighborhood=Gueliz")
    assert res_gueliz.status_code == 200
    gueliz_props = res_gueliz.json()["properties"]
    assert len(gueliz_props) > 0
    for p in gueliz_props:
        assert p["neighborhood"] == "Gueliz"

    # Test filtering by property type
    res_villas = client.get("/api/properties?property_type=Villa")
    assert res_villas.status_code == 200
    villas = res_villas.json()["properties"]
    assert len(villas) > 0
    for v in villas:
        assert v["property_type"] == "Villa"

def test_get_properties_geojson(client):
    res = client.get("/api/properties/geojson")
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) > 1000
    first_feat = data["features"][0]
    assert first_feat["type"] == "Feature"
    assert "geometry" in first_feat
    assert "coordinates" in first_feat["geometry"]
    assert "price" in first_feat["properties"]

def test_get_property_detail(client):
    # Get first property ID
    props_res = client.get("/api/properties?page_size=1")
    prop_id = props_res.json()["properties"][0]["property_id"]

    res = client.get(f"/api/properties/{prop_id}")
    assert res.status_code == 200
    prop = res.json()
    assert prop["property_id"] == prop_id
    assert prop["price"] > 0
    assert prop["surface_m2"] > 0
    assert "predicted_price" in prop
    assert "distance_to_city_center_m" in prop

def test_get_properties_nearby(client):
    # Gueliz center coordinates
    res = client.get("/api/properties/nearby?lat=31.6346&lon=-8.0125&radius_meters=1500")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] > 0
    assert "properties" in data
    # Ensure sorted by distance
    distances = [p["distance_meters"] for p in data["properties"]]
    assert distances == sorted(distances)

def test_get_comparables(client):
    props_res = client.get("/api/properties?page_size=1")
    prop_id = props_res.json()["properties"][0]["property_id"]

    res = client.get(f"/api/comparables/{prop_id}?limit=5")
    assert res.status_code == 200
    data = res.json()
    assert data["target_property_id"] == prop_id
    assert len(data["comparables"]) == 5
    for comp in data["comparables"]:
        assert "similarity_score_pct" in comp
        assert comp["similarity_score_pct"] > 0

def test_get_neighborhoods_with_extrusions(client):
    res = client.get("/api/neighborhoods")
    assert res.status_code == 200
    fc = res.json()
    assert fc["type"] == "FeatureCollection"
    assert len(fc["features"]) == 13
    for feat in fc["features"]:
        props = feat["properties"]
        assert "median_price_per_m2" in props
        assert "extrusion_height_ppm2" in props
        assert "extrusion_height_density" in props
        assert props["extrusion_height_ppm2"] > 0

def test_get_market_summary_kpis(client):
    res = client.get("/api/market/summary")
    assert res.status_code == 200
    kpis = res.json()
    assert kpis["total_listings"] > 1000
    assert kpis["median_price_mad"] > 1000000
    assert kpis["total_neighborhoods"] == 13

def test_predict_valuation(client):
    payload = {
        "surface_m2": 150,
        "bedrooms": 3,
        "bathrooms": 2,
        "rooms": 4,
        "floor": 2,
        "building_age": 3,
        "property_type": "Apartment",
        "neighborhood": "Gueliz",
        "pool": False,
        "parking": True,
        "elevator": True
    }
    res = client.post("/api/valuation/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["estimated_price_mad"] > 0
    assert "confidence_band_mad" in data
    assert len(data["feature_contributions"]) > 0

def test_export_data_csv_and_geojson(client):
    # CSV Export
    res_csv = client.get("/api/export?format=csv&neighborhood=Gueliz")
    assert res_csv.status_code == 200
    assert "property_id" in res_csv.text

    # GeoJSON Export
    res_geo = client.get("/api/export?format=geojson&neighborhood=Gueliz")
    assert res_geo.status_code == 200
    geo_data = res_geo.json()
    assert geo_data["type"] == "FeatureCollection"
    assert len(geo_data["features"]) > 0
