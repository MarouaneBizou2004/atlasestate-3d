"""
FastAPI REST API Endpoints for AtlasEstate 3D
Implements filtering, spatial queries, 3D neighborhood GeoJSON with extrusions,
market analytics, comparables, and ML valuation.
"""

import json
from pathlib import Path
from typing import List, Optional, Dict, Any
import pandas as pd
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import JSONResponse, PlainTextResponse

from backend.app.schemas.property import (
    PropertyDetail,
    PropertyListResponse,
    GeoJSONFeatureCollection,
    GeoJSONFeature,
    MarketSummaryKPIs,
    ValuationPredictionRequest,
    ValuationPredictionResponse
)
from backend.app.services.comparables import ComparablesEngine, haversine
from backend.app.ml.valuation_model import PropertyValuationModel

router = APIRouter(prefix="/api")

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
GOLD_DIR = PROJECT_ROOT / "data" / "gold"
GEOSPATIAL_DIR = PROJECT_ROOT / "data" / "geospatial"
REPORTS_DIR = PROJECT_ROOT / "reports"

# Cached dataframe and ML predictor
_df_gold_cache: Optional[pd.DataFrame] = None
_ml_model_cache: Optional[PropertyValuationModel] = None

def get_gold_df() -> pd.DataFrame:
    global _df_gold_cache
    if _df_gold_cache is None:
        gold_path = GOLD_DIR / "gold_properties_enriched.parquet"
        if not gold_path.exists():
            raise FileNotFoundError("Gold layer not found. Run pipeline first.")
        df = pd.read_parquet(gold_path)
        df["published_at"] = df["published_at"].astype(str)
        _df_gold_cache = df
    return _df_gold_cache

def get_ml_model() -> PropertyValuationModel:
    global _ml_model_cache
    if _ml_model_cache is None:
        _ml_model_cache = PropertyValuationModel()
    return _ml_model_cache

def filter_dataframe(
    df: pd.DataFrame,
    city: Optional[str] = None,
    neighborhood: Optional[str] = None,
    property_type: Optional[str] = None,
    transaction_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_surface: Optional[float] = None,
    max_surface: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    has_pool: Optional[bool] = None,
    has_parking: Optional[bool] = None,
    has_elevator: Optional[bool] = None,
    has_terrace: Optional[bool] = None,
    has_garden: Optional[bool] = None,
    valuation_status: Optional[str] = None,
    bbox: Optional[str] = None
) -> pd.DataFrame:
    filtered = df.copy()
    
    if city:
        filtered = filtered[filtered["city"].str.lower() == city.lower()]
    if neighborhood and neighborhood.lower() != "all":
        filtered = filtered[filtered["neighborhood"].str.lower() == neighborhood.lower()]
    if property_type and property_type.lower() != "all":
        filtered = filtered[filtered["property_type"].str.lower() == property_type.lower()]
    if transaction_type and transaction_type.lower() != "all":
        filtered = filtered[filtered["transaction_type"].str.lower() == transaction_type.lower()]
        
    if min_price is not None:
        filtered = filtered[filtered["price"] >= min_price]
    if max_price is not None:
        filtered = filtered[filtered["price"] <= max_price]
        
    if min_surface is not None:
        filtered = filtered[filtered["surface_m2"] >= min_surface]
    if max_surface is not None:
        filtered = filtered[filtered["surface_m2"] <= max_surface]
        
    if bedrooms is not None:
        filtered = filtered[filtered["bedrooms"] >= bedrooms]
    if bathrooms is not None:
        filtered = filtered[filtered["bathrooms"] >= bathrooms]
        
    if has_pool is True:
        filtered = filtered[filtered["pool"] == True]
    if has_parking is True:
        filtered = filtered[filtered["parking"] == True]
    if has_elevator is True:
        filtered = filtered[filtered["elevator"] == True]
    if has_terrace is True:
        filtered = filtered[filtered["terrace"] == True]
    if has_garden is True:
        filtered = filtered[filtered["garden"] == True]
        
    if valuation_status and valuation_status.lower() != "all":
        filtered = filtered[filtered["valuation_status"].str.lower() == valuation_status.lower()]
        
    # Bounding Box Query: "min_lon,min_lat,max_lon,max_lat"
    if bbox:
        try:
            min_lon, min_lat, max_lon, max_lat = map(float, bbox.split(","))
            filtered = filtered[
                (filtered["longitude"] >= min_lon) &
                (filtered["longitude"] <= max_lon) &
                (filtered["latitude"] >= min_lat) &
                (filtered["latitude"] <= max_lat)
            ]
        except Exception:
            pass
            
    return filtered

# ------------------------------------------------------------------------------
# 1. Properties List & GeoJSON
# ------------------------------------------------------------------------------
@router.get("/properties", response_model=PropertyListResponse)
def get_properties(
    city: Optional[str] = "Marrakech",
    neighborhood: Optional[str] = None,
    property_type: Optional[str] = None,
    transaction_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_surface: Optional[float] = None,
    max_surface: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    has_pool: Optional[bool] = None,
    has_parking: Optional[bool] = None,
    has_elevator: Optional[bool] = None,
    has_terrace: Optional[bool] = None,
    has_garden: Optional[bool] = None,
    valuation_status: Optional[str] = None,
    bbox: Optional[str] = None,
    sort_by: Optional[str] = "date_desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200)
):
    df = get_gold_df()
    filtered = filter_dataframe(
        df, city, neighborhood, property_type, transaction_type,
        min_price, max_price, min_surface, max_surface,
        bedrooms, bathrooms, has_pool, has_parking, has_elevator,
        has_terrace, has_garden, valuation_status, bbox
    )
    
    # Sorting
    if sort_by == "price_asc":
        filtered = filtered.sort_values(by="price", ascending=True)
    elif sort_by == "price_desc":
        filtered = filtered.sort_values(by="price", ascending=False)
    elif sort_by == "surface_desc":
        filtered = filtered.sort_values(by="surface_m2", ascending=False)
    elif sort_by == "value_gap_desc":
        filtered = filtered.sort_values(by="value_gap_percent", ascending=False)
    else:
        filtered = filtered.sort_values(by="published_at", ascending=False)
        
    total_count = len(filtered)
    total_pages = max(1, (total_count + page_size - 1) // page_size)
    
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    sliced = filtered.iloc[start_idx:end_idx]
    
    records = sliced.to_dict(orient="records")
    return {
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "properties": records
    }

@router.get("/properties/geojson")
def get_properties_geojson(
    city: Optional[str] = "Marrakech",
    neighborhood: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_surface: Optional[float] = None,
    max_surface: Optional[float] = None,
    bedrooms: Optional[int] = None,
    has_pool: Optional[bool] = None,
    has_parking: Optional[bool] = None,
    has_elevator: Optional[bool] = None,
    has_terrace: Optional[bool] = None,
    has_garden: Optional[bool] = None,
    valuation_status: Optional[str] = None,
    bbox: Optional[str] = None
):
    df = get_gold_df()
    filtered = filter_dataframe(
        df, city, neighborhood, property_type, None,
        min_price, max_price, min_surface, max_surface,
        bedrooms, None, has_pool, has_parking, has_elevator,
        has_terrace, has_garden, valuation_status, bbox
    )
    
    features = []
    for _, row in filtered.iterrows():
        features.append({
            "type": "Feature",
            "id": row["property_id"],
            "geometry": {
                "type": "Point",
                "coordinates": [float(row["longitude"]), float(row["latitude"])]
            },
            "properties": {
                "property_id": row["property_id"],
                "title": row.get("title", f"{row['property_type']} in {row['neighborhood']}"),
                "street_address": row.get("street_address", f"{row['neighborhood']}, Marrakech"),
                "price": int(row["price"]),
                "price_per_m2": float(row["price_per_m2"]),
                "surface_m2": int(row["surface_m2"]),
                "bedrooms": int(row["bedrooms"]),
                "bathrooms": int(row["bathrooms"]),
                "rooms": int(row.get("rooms", int(row["bedrooms"]) + 2)),
                "floor": int(row["floor"]) if pd.notna(row.get("floor")) else 0,
                "total_floors": int(row["total_floors"]) if pd.notna(row.get("total_floors")) else 5,
                "property_type": row["property_type"],
                "neighborhood": row["neighborhood"],
                "predicted_price": int(row.get("predicted_price", row["price"])),
                "value_gap_percent": float(row.get("value_gap_percent", 0.0)),
                "valuation_status": row.get("valuation_status", "Near model estimate"),
                "has_pool": bool(row.get("pool", False)),
                "has_parking": bool(row.get("parking", False)),
                "has_elevator": bool(row.get("elevator", False)),
                "has_terrace": bool(row.get("terrace", False)),
                "has_garden": bool(row.get("garden", False)),
                "has_balcony": bool(row.get("balcony", False)),
                "has_air_conditioning": bool(row.get("air_conditioning", False)),
                "has_security": bool(row.get("security", False)),
                "is_furnished": bool(row.get("furnished", False))
            }
        })
        
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/properties/nearby")
def get_properties_nearby(
    lat: float = Query(..., ge=20.0, le=36.0),
    lon: float = Query(..., ge=-18.0, le=-1.0),
    radius_meters: float = Query(2000.0, ge=100.0, le=15000.0),
    limit: int = Query(25, ge=1, le=100)
):
    df = get_gold_df()
    nearby_list = []
    
    for _, row in df.iterrows():
        d = haversine(lat, lon, row["latitude"], row["longitude"])
        if d <= radius_meters:
            rec = row.to_dict()
            rec["distance_meters"] = d
            nearby_list.append(rec)
            
    nearby_list.sort(key=lambda x: x["distance_meters"])
    return {
        "center": {"latitude": lat, "longitude": lon},
        "radius_meters": radius_meters,
        "count": len(nearby_list[:limit]),
        "properties": nearby_list[:limit]
    }

@router.get("/properties/{property_id}", response_model=PropertyDetail)
def get_property_by_id(property_id: str):
    df = get_gold_df()
    match = df[df["property_id"] == property_id]
    if match.empty:
        raise HTTPException(status_code=404, detail=f"Property {property_id} not found")
    return match.iloc[0].to_dict()

@router.get("/comparables/{property_id}")
@router.get("/properties/{property_id}/comparables")
def get_comparables(property_id: str, limit: int = Query(6, ge=1, le=12)):
    df = get_gold_df()
    match = df[df["property_id"] == property_id]
    if match.empty:
        raise HTTPException(status_code=404, detail=f"Property {property_id} not found")
        
    engine = ComparablesEngine(df)
    comps = engine.find_comparables(match.iloc[0].to_dict(), top_k=limit)
    return {
        "target_property_id": property_id,
        "comparables_count": len(comps),
        "comparables": comps
    }

# ------------------------------------------------------------------------------
# 2. Neighborhoods & 3D Extrusion Geometries
# ------------------------------------------------------------------------------
@router.get("/neighborhoods")
def get_neighborhoods():
    neigh_file = GEOSPATIAL_DIR / "marrakech_neighborhoods.geojson"
    if not neigh_file.exists():
        raise HTTPException(status_code=500, detail="Neighborhoods GeoJSON not found")
        
    with open(neigh_file, "r", encoding="utf-8") as f:
        fc = json.load(f)
        
    df = get_gold_df()
    # Enrich features with real-time aggregated metrics and 3D extrusion heights
    for feat in fc["features"]:
        n_id = feat["properties"]["id"]
        sub = df[df["neighborhood_id"] == n_id]
        
        count = len(sub)
        med_price = float(sub["price"].median()) if count > 0 else 0
        med_ppm2 = float(sub["price_per_m2"].median()) if count > 0 else feat["properties"]["median_price_m2"]
        avg_surf = float(sub["surface_m2"].mean()) if count > 0 else 0
        
        # 3D Extrusion Height in meters: scaled based on price/m2 (e.g. 5,000 -> 50m, 30,000 -> 300m)
        extrusion_height_ppm2 = round((med_ppm2 / 100.0), 1)
        # Density extrusion height: scaled based on listings count
        extrusion_height_density = round(count * 2.5, 1)
        
        feat["properties"]["active_listings_count"] = count
        feat["properties"]["median_price_mad"] = int(med_price)
        feat["properties"]["median_price_per_m2"] = round(med_ppm2, 1)
        feat["properties"]["avg_surface_m2"] = round(avg_surf, 1)
        feat["properties"]["extrusion_height_ppm2"] = extrusion_height_ppm2
        feat["properties"]["extrusion_height_density"] = extrusion_height_density
        
    return fc

@router.get("/neighborhoods/{neighborhood_id}")
def get_neighborhood_detail(neighborhood_id: str):
    df = get_gold_df()
    sub = df[df["neighborhood_id"] == neighborhood_id]
    if sub.empty:
        raise HTTPException(status_code=404, detail=f"Neighborhood {neighborhood_id} not found")
        
    name = sub["neighborhood"].iloc[0]
    return {
        "neighborhood_id": neighborhood_id,
        "name": name,
        "total_listings": len(sub),
        "median_price_mad": int(sub["price"].median()),
        "average_price_mad": int(sub["price"].mean()),
        "median_price_per_m2": round(float(sub["price_per_m2"].median()), 1),
        "min_price_per_m2": round(float(sub["price_per_m2"].min()), 1),
        "max_price_per_m2": round(float(sub["price_per_m2"].max()), 1),
        "average_surface_m2": round(float(sub["surface_m2"].mean()), 1),
        "property_type_distribution": sub["property_type"].value_counts().to_dict(),
        "amenity_prevalence": {
            "swimming_pool_pct": round((sub["pool"].sum() / len(sub)) * 100, 1),
            "parking_pct": round((sub["parking"].sum() / len(sub)) * 100, 1),
            "elevator_pct": round((sub["elevator"].sum() / len(sub)) * 100, 1),
            "terrace_pct": round((sub["terrace"].sum() / len(sub)) * 100, 1)
        }
    }

# ------------------------------------------------------------------------------
# 3. Market Summary & Analytics
# ------------------------------------------------------------------------------
@router.get("/market/summary", response_model=MarketSummaryKPIs)
def get_market_summary():
    df = get_gold_df()
    return {
        "total_listings": len(df),
        "median_price_mad": int(df["price"].median()),
        "average_price_mad": int(df["price"].mean()),
        "median_price_per_m2": round(float(df["price_per_m2"].median()), 1),
        "average_price_per_m2": round(float(df["price_per_m2"].mean()), 1),
        "average_surface_m2": round(float(df["surface_m2"].mean()), 1),
        "average_bedrooms": round(float(df["bedrooms"].mean()), 1),
        "average_bathrooms": round(float(df["bathrooms"].mean()), 1),
        "total_neighborhoods": int(df["neighborhood_id"].nunique()),
        "total_property_types": int(df["property_type"].nunique())
    }

@router.get("/market/neighborhoods")
def get_market_neighborhoods():
    df = get_gold_df()
    grouped = df.groupby(["neighborhood_id", "neighborhood"]).agg(
        listing_count=("property_id", "count"),
        median_price=("price", "median"),
        avg_price=("price", "mean"),
        median_price_m2=("price_per_m2", "median"),
        avg_surface_m2=("surface_m2", "mean"),
        avg_bedrooms=("bedrooms", "mean")
    ).reset_index()
    
    grouped = grouped.sort_values(by="median_price_m2", ascending=False)
    return grouped.to_dict(orient="records")

@router.get("/market/heatmap")
def get_market_heatmap(metric: str = Query("price_per_m2", enum=["price_per_m2", "price", "density", "value_gap"])):
    """
    Returns spatial points formatted with normalized weight for Heatmap layers.
    """
    df = get_gold_df()
    points = []
    
    if metric == "price_per_m2":
        max_val = df["price_per_m2"].max()
        for _, r in df.iterrows():
            points.append({
                "lat": float(r["latitude"]),
                "lon": float(r["longitude"]),
                "weight": round(float(r["price_per_m2"]) / max_val, 4),
                "val": float(r["price_per_m2"])
            })
    elif metric == "price":
        max_val = df["price"].max()
        for _, r in df.iterrows():
            points.append({
                "lat": float(r["latitude"]),
                "lon": float(r["longitude"]),
                "weight": round(float(r["price"]) / max_val, 4),
                "val": int(r["price"])
            })
    elif metric == "value_gap":
        for _, r in df.iterrows():
            # Normalized between 0 and 1 around value gap
            gap_pct = float(r.get("value_gap_percent", 0.0))
            points.append({
                "lat": float(r["latitude"]),
                "lon": float(r["longitude"]),
                "weight": round(min(max((gap_pct + 25.0) / 50.0, 0.0), 1.0), 4),
                "val": gap_pct
            })
    else: # density
        for _, r in df.iterrows():
            points.append({
                "lat": float(r["latitude"]),
                "lon": float(r["longitude"]),
                "weight": 1.0,
                "val": 1.0
            })
            
    return {"metric": metric, "count": len(points), "points": points}

@router.get("/market/price-distribution")
def get_price_distribution():
    df = get_gold_df()
    
    # Histogram of Price in MAD (bins)
    counts, bin_edges = pd.cut(df["price"] / 1000000.0, bins=10, retbins=True)
    price_bins = [
        {"bin": f"{bin_edges[i]:.1f}M - {bin_edges[i+1]:.1f}M MAD", "count": int(val)}
        for i, val in enumerate(counts.value_counts().sort_index())
    ]
    
    # Histogram of Price per m2
    counts_ppm2, bin_edges_ppm2 = pd.cut(df["price_per_m2"], bins=8, retbins=True)
    ppm2_bins = [
        {"bin": f"{int(bin_edges_ppm2[i]):,} - {int(bin_edges_ppm2[i+1]):,} MAD/m²", "count": int(val)}
        for i, val in enumerate(counts_ppm2.value_counts().sort_index())
    ]
    
    # Distribution by Property Type
    type_dist = df["property_type"].value_counts().to_dict()
    
    return {
        "price_histogram": price_bins,
        "price_per_m2_histogram": ppm2_bins,
        "property_type_distribution": type_dist,
        "valuation_gap_distribution": df["valuation_status"].value_counts().to_dict()
    }

# ------------------------------------------------------------------------------
# 4. Machine Learning Valuation & POIs
# ------------------------------------------------------------------------------
@router.post("/valuation/predict", response_model=ValuationPredictionResponse)
def predict_valuation(request: ValuationPredictionRequest):
    model = get_ml_model()
    try:
        prediction = model.predict_property(request.model_dump())
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Valuation inference failed: {str(e)}")

@router.get("/locations/pois")
def get_pois(category: Optional[str] = None):
    pois_file = GEOSPATIAL_DIR / "marrakech_pois.geojson"
    if not pois_file.exists():
        raise HTTPException(status_code=500, detail="POIs file not found")
        
    with open(pois_file, "r", encoding="utf-8") as f:
        fc = json.load(f)
        
    if category and category.lower() != "all":
        fc["features"] = [
            feat for feat in fc["features"]
            if feat["properties"]["category"].lower() == category.lower()
        ]
    return fc

@router.get("/data-quality")
def get_data_quality():
    json_path = REPORTS_DIR / "data_quality.json"
    if not json_path.exists():
        raise HTTPException(status_code=500, detail="Data quality report not found")
    with open(json_path, "r", encoding="utf-8") as f:
        metrics = json.load(f)
    return metrics

# ------------------------------------------------------------------------------
# 5. Data Export (CSV & GeoJSON)
# ------------------------------------------------------------------------------
@router.get("/export")
def export_data(
    format: str = Query("csv", enum=["csv", "geojson", "json"]),
    city: Optional[str] = "Marrakech",
    neighborhood: Optional[str] = None,
    property_type: Optional[str] = None
):
    df = get_gold_df()
    filtered = filter_dataframe(df, city, neighborhood, property_type)
    
    if format == "csv":
        csv_data = filtered.to_csv(index=False)
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=atlasestate_marrakech_export.csv"}
        )
    elif format == "geojson":
        features = []
        for _, row in filtered.iterrows():
            features.append({
                "type": "Feature",
                "id": row["property_id"],
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(row["longitude"]), float(row["latitude"])]
                },
                "properties": row.to_dict()
            })
        fc = {"type": "FeatureCollection", "features": features}
        return JSONResponse(
            content=fc,
            headers={"Content-Disposition": "attachment; filename=atlasestate_marrakech_export.geojson"}
        )
    else:
        return JSONResponse(content=filtered.to_dict(orient="records"))
