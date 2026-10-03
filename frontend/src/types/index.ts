export interface Property {
  property_id: string;
  source: string;
  listing_url?: string;
  city: string;
  neighborhood: string;
  neighborhood_id: string;
  property_type: string;
  transaction_type: string;
  latitude: number;
  longitude: number;
  price: number;
  currency: string;
  surface_m2: number;
  price_per_m2: number;
  bedrooms: number;
  bathrooms: number;
  rooms: number;
  floor?: number;
  total_floors?: number;
  building_age?: number;
  furnished: boolean;
  parking: boolean;
  elevator: boolean;
  pool: boolean;
  garden: boolean;
  terrace: boolean;
  balcony: boolean;
  air_conditioning: boolean;
  security: boolean;
  condition?: string;
  description?: string;
  published_at: string;
  predicted_price?: number;
  predicted_price_per_m2?: number;
  value_gap?: number;
  value_gap_percent?: number;
  valuation_status?: 'Below model estimate' | 'Near model estimate' | 'Above model estimate';
  distance_to_city_center_m?: number;
  distance_to_medina_m?: number;
  distance_to_transit_m?: number;
  distance_to_hospital_m?: number;
  distance_to_school_m?: number;
  distance_to_attraction_m?: number;
  distance_to_shopping_m?: number;
}

export interface ComparableProperty {
  property_id: string;
  source: string;
  listing_url?: string;
  neighborhood: string;
  property_type: string;
  price: number;
  surface_m2: number;
  price_per_m2: number;
  bedrooms: number;
  bathrooms: number;
  distance_meters: number;
  similarity_score_pct: number;
  price_difference_pct: number;
  surface_difference_m2: number;
  has_pool: boolean;
  has_parking: boolean;
  has_elevator: boolean;
  latitude: number;
  longitude: number;
}

export interface NeighborhoodFeature {
  type: string;
  id: string;
  geometry: any;
  properties: {
    id: string;
    name: string;
    name_ar?: string;
    zone_type: string;
    description: string;
    median_price_per_m2: number;
    active_listings_count: number;
    avg_surface_m2: number;
    extrusion_height_ppm2: number;
    extrusion_height_density: number;
  };
}

export interface MarketSummary {
  total_listings: number;
  median_price_mad: number;
  average_price_mad: number;
  median_price_per_m2: number;
  average_price_per_m2: number;
  average_surface_m2: number;
  average_bedrooms: number;
  average_bathrooms: number;
  total_neighborhoods: number;
  total_property_types: number;
  median_price?: number;
  avg_price?: number;
  avg_price_per_m2?: number;
  median_surface?: number;
  avg_surface?: number;
  property_type_breakdown?: Record<string, number>;
  valuation_status_breakdown?: Record<string, number>;
}

export interface NeighborhoodStat {
  neighborhood: string;
  neighborhood_id?: string;
  listing_count: number;
  median_price: number;
  avg_price: number;
  median_price_per_m2: number;
  median_price_m2?: number;
  avg_surface: number;
  avg_surface_m2?: number;
  avg_bedrooms?: number;
  min_price?: number;
  max_price?: number;
}

export interface ValuationRequest {
  neighborhood: string;
  property_type: string;
  surface: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  total_floors?: number;
  year_built?: number;
  condition?: string;
  has_elevator?: boolean;
  has_balcony?: boolean;
  has_terrace?: boolean;
  has_garden?: boolean;
  has_pool?: boolean;
  has_parking?: boolean;
  has_security?: boolean;
  has_air_conditioning?: boolean;
  is_furnished?: boolean;
}

export interface ValuationResponse {
  predicted_price: number;
  price_per_m2: number;
  price_range: {
    low: number;
    high: number;
  };
  feature_contributions?: Record<string, number>;
}

export interface ValuationPredictionResponse {
  estimated_price_mad: number;
  estimated_price_per_m2: number;
  confidence_band_mad: {
    lower: number;
    upper: number;
    mape_pct: number;
  };
  feature_contributions: Array<{
    factor: string;
    impact_mad: number;
    type: 'positive' | 'negative';
  }>;
}

export interface DataQualityReport {
  execution_timestamp: string;
  batch_id: string;
  records_received: number;
  records_valid: number;
  records_rejected: number;
  quality_pass_rate_pct: number;
  duplicates_removed: number;
  invalid_coordinates: number;
  invalid_prices: number;
  invalid_surfaces: number;
  invalid_price_per_m2: number;
  geocoding_accuracy: string;
}

export type MapMode = 
  | 'explorer'      // Mode 1: Individual property markers
  | 'heatmap'       // Mode 2: Price/m² Heatmap density
  | 'density'       // Mode 3: Clustered listing density
  | 'neighborhood'  // Mode 4: 3D extruded polygons by median price/m²
  | 'activity'      // Mode 5: 3D extruded polygons by listing counts
  | 'value_gap';    // Mode 6: Value gap relative to ML estimate
