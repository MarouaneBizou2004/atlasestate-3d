"""
Pydantic Schemas for API Requests, Responses, and Geospatial Data
"""

from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class PropertyBase(BaseModel):
    property_id: str
    source: str
    listing_url: Optional[str] = None
    city: str
    neighborhood: str
    neighborhood_id: str
    property_type: str
    transaction_type: str = "Sale"
    latitude: float
    longitude: float
    price: int
    currency: str = "MAD"
    surface_m2: int
    price_per_m2: float
    bedrooms: int
    bathrooms: int
    rooms: int
    floor: Optional[int] = 0
    total_floors: Optional[int] = 1
    building_age: Optional[int] = 0
    furnished: bool = False
    parking: bool = False
    elevator: bool = False
    pool: bool = False
    garden: bool = False
    terrace: bool = False
    balcony: bool = False
    air_conditioning: bool = False
    security: bool = False
    condition: Optional[str] = None
    description: Optional[str] = None
    published_at: str

class PropertyDetail(PropertyBase):
    predicted_price: Optional[int] = None
    predicted_price_per_m2: Optional[float] = None
    value_gap: Optional[int] = None
    value_gap_percent: Optional[float] = None
    valuation_status: Optional[str] = None
    distance_to_city_center_m: Optional[float] = None
    distance_to_transit_m: Optional[float] = None
    distance_to_hospital_m: Optional[float] = None
    distance_to_school_m: Optional[float] = None
    distance_to_attraction_m: Optional[float] = None
    distance_to_shopping_m: Optional[float] = None

class PropertyListResponse(BaseModel):
    total_count: int
    page: int
    page_size: int
    total_pages: int
    properties: List[PropertyDetail]

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: Optional[str] = None
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]

class MarketSummaryKPIs(BaseModel):
    total_listings: int
    median_price_mad: int
    average_price_mad: int
    median_price_per_m2: float
    average_price_per_m2: float
    average_surface_m2: float
    average_bedrooms: float
    average_bathrooms: float
    total_neighborhoods: int
    total_property_types: int

class ValuationPredictionRequest(BaseModel):
    surface_m2: int = Field(..., ge=15, le=2000, description="Surface area in square meters")
    bedrooms: int = Field(default=2, ge=0, le=15)
    bathrooms: int = Field(default=1, ge=1, le=15)
    rooms: int = Field(default=3, ge=1, le=25)
    floor: int = Field(default=1, ge=0, le=20)
    building_age: int = Field(default=5, ge=0, le=150)
    property_type: str = Field(default="Apartment")
    neighborhood: str = Field(default="Gueliz")
    pool: bool = False
    parking: bool = True
    elevator: bool = True
    terrace: bool = False
    garden: bool = False
    balcony: bool = True
    air_conditioning: bool = True
    security: bool = False
    furnished: bool = False
    distance_to_city_center_m: Optional[float] = 1800.0

class ValuationPredictionResponse(BaseModel):
    estimated_price_mad: int
    estimated_price_per_m2: float
    confidence_band_mad: Dict[str, Any]
    feature_contributions: List[Dict[str, Any]]
