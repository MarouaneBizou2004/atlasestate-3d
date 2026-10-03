"""
Comparable Properties Recommendation Engine
Finds multi-attribute comparable properties based on:
1. Geographic proximity (Haversine distance in meters)
2. Living surface area similarity (m²)
3. Bedroom & bathroom compatibility
4. Property type matching
5. Price-per-square-meter proximity
"""

import math
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0)**2
    return round(R * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a)), 1)

class ComparablesEngine:
    def __init__(self, properties_df: pd.DataFrame):
        self.df = properties_df

    def find_comparables(self, target_property: Dict[str, Any], top_k: int = 6) -> List[Dict[str, Any]]:
        target_id = target_property.get("property_id")
        target_lat = float(target_property.get("latitude"))
        target_lon = float(target_property.get("longitude"))
        target_surface = float(target_property.get("surface_m2"))
        target_bedrooms = int(target_property.get("bedrooms", 2))
        target_type = target_property.get("property_type")
        target_ppm2 = float(target_property.get("price_per_m2"))
        
        candidates = []
        
        for _, row in self.df.iterrows():
            prop_id = row["property_id"]
            if prop_id == target_id:
                continue
                
            dist_meters = haversine(target_lat, target_lon, row["latitude"], row["longitude"])
            
            # Surface delta %
            surf_delta_pct = abs(row["surface_m2"] - target_surface) / max(target_surface, 1.0)
            
            # Bedroom delta
            bed_delta = abs(row["bedrooms"] - target_bedrooms)
            
            # Type match bonus
            type_match = 1.0 if row["property_type"] == target_type else 0.5
            
            # Price/m2 delta %
            ppm2_delta_pct = abs(row["price_per_m2"] - target_ppm2) / max(target_ppm2, 1.0)
            
            # Composite Distance Score (Lower is more similar)
            # Weights: 35% spatial proximity (scaled by 3km), 30% surface, 15% bedrooms, 20% price/m2
            spatial_penalty = min(dist_meters / 3000.0, 2.0)
            composite_penalty = (
                0.35 * spatial_penalty +
                0.30 * min(surf_delta_pct, 1.5) +
                0.15 * min(bed_delta / 3.0, 1.0) +
                0.20 * min(ppm2_delta_pct, 1.0) +
                (0.0 if type_match == 1.0 else 0.35)
            )
            
            similarity_pct = max(10, round((1.0 - min(composite_penalty, 0.90)) * 100.0, 1))
            
            candidates.append({
                "property_id": row["property_id"],
                "source": row["source"],
                "listing_url": row["listing_url"],
                "neighborhood": row["neighborhood"],
                "property_type": row["property_type"],
                "price": int(row["price"]),
                "surface_m2": int(row["surface_m2"]),
                "price_per_m2": float(row["price_per_m2"]),
                "bedrooms": int(row["bedrooms"]),
                "bathrooms": int(row["bathrooms"]),
                "distance_meters": dist_meters,
                "similarity_score_pct": similarity_pct,
                "price_difference_pct": round(((row["price"] - target_property["price"]) / target_property["price"]) * 100.0, 1),
                "surface_difference_m2": int(row["surface_m2"] - target_surface),
                "has_pool": bool(row.get("pool", False)),
                "has_parking": bool(row.get("parking", False)),
                "has_elevator": bool(row.get("elevator", False)),
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"])
            })
            
        candidates.sort(key=lambda x: x["similarity_score_pct"], reverse=True)
        return candidates[:top_k]
