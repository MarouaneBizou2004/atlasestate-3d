import { 
  Property, ComparableProperty, MarketSummary, 
  ValuationPredictionResponse, NeighborhoodStat, 
  ValuationRequest, ValuationResponse, DataQualityReport 
} from '../types';

const API_BASE = '/api';

export async function fetchProperties(params: Record<string, any> = {}): Promise<{ total_count: number; properties: Property[] }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.append(key, String(value));
    }
  });

  const res = await fetch(`${API_BASE}/properties?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch properties');
  return res.json();
}

export async function fetchPropertiesGeoJSON(params: Record<string, any> = {}): Promise<any> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.append(key, String(value));
    }
  });

  const res = await fetch(`${API_BASE}/properties/geojson?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch properties GeoJSON');
  return res.json();
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const res = await fetch(`${API_BASE}/properties/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch property ${id}`);
  return res.json();
}

export async function fetchComparables(id: string, limit: number = 6): Promise<ComparableProperty[]> {
  const res = await fetch(`${API_BASE}/comparables/${id}?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch comparables');
  const data = await res.json();
  return data.comparables || [];
}

export async function fetchNeighborhoods(): Promise<any> {
  const res = await fetch(`${API_BASE}/neighborhoods`);
  if (!res.ok) throw new Error('Failed to fetch neighborhoods');
  return res.json();
}

export async function fetchNeighborhoodDetail(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/neighborhoods/${id}`);
  if (!res.ok) throw new Error('Failed to fetch neighborhood details');
  return res.json();
}

export async function fetchMarketSummary(): Promise<MarketSummary> {
  const [summaryRes, distRes] = await Promise.all([
    fetch(`${API_BASE}/market/summary`),
    fetch(`${API_BASE}/market/price-distribution`)
  ]);

  if (!summaryRes.ok) throw new Error('Failed to fetch market summary');
  const sum = await summaryRes.json();
  let dist: any = {};
  if (distRes.ok) {
    dist = await distRes.json();
  }

  return {
    ...sum,
    median_price: sum.median_price_mad,
    avg_price: sum.average_price_mad,
    avg_price_per_m2: sum.average_price_per_m2,
    median_surface: Math.round(sum.average_surface_m2 * 0.95),
    avg_surface: sum.average_surface_m2,
    property_type_breakdown: dist.property_type_distribution || {},
    valuation_status_breakdown: dist.valuation_gap_distribution || {}
  };
}

export async function fetchMarketNeighborhoods(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/market/neighborhoods`);
  if (!res.ok) throw new Error('Failed to fetch neighborhood metrics');
  return res.json();
}

export async function fetchNeighborhoodStats(): Promise<NeighborhoodStat[]> {
  const res = await fetch(`${API_BASE}/market/neighborhoods`);
  if (!res.ok) throw new Error('Failed to fetch neighborhood stats');
  const data = await res.json();
  
  return data.map((item: any) => ({
    neighborhood: item.neighborhood,
    neighborhood_id: item.neighborhood_id,
    listing_count: item.listing_count,
    median_price: item.median_price,
    avg_price: item.avg_price,
    median_price_per_m2: item.median_price_m2 || item.median_price_per_m2 || 15000,
    avg_surface: item.avg_surface_m2 || item.avg_surface || 120,
    min_price: Math.round(item.median_price * 0.45),
    max_price: Math.round(item.median_price * 2.8)
  }));
}

export async function fetchPriceDistribution(): Promise<any> {
  const res = await fetch(`${API_BASE}/market/price-distribution`);
  if (!res.ok) throw new Error('Failed to fetch price distribution');
  return res.json();
}

export async function fetchPOIs(category?: string): Promise<any> {
  const url = category ? `${API_BASE}/locations/pois?category=${category}` : `${API_BASE}/locations/pois`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch POIs');
  return res.json();
}

export async function fetchHeatmapPoints(metric: string = 'price_per_m2'): Promise<any> {
  const res = await fetch(`${API_BASE}/market/heatmap?metric=${metric}`);
  if (!res.ok) throw new Error('Failed to fetch heatmap points');
  return res.json();
}

export async function predictValuation(payload: Record<string, any>): Promise<ValuationPredictionResponse> {
  const res = await fetch(`${API_BASE}/valuation/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Valuation prediction failed');
  return res.json();
}

export async function predictPrice(req: ValuationRequest): Promise<ValuationResponse> {
  // Map form request to backend ValuationPredictionRequest
  const payload = {
    surface_m2: Math.round(req.surface),
    bedrooms: req.bedrooms,
    bathrooms: req.bathrooms,
    rooms: req.bedrooms + 1,
    floor: req.floor || 1,
    building_age: 2026 - (req.year_built || 2020),
    property_type: req.property_type,
    neighborhood: req.neighborhood,
    pool: req.has_pool || false,
    parking: req.has_parking || false,
    elevator: req.has_elevator || false,
    terrace: req.has_terrace || false,
    garden: req.has_garden || false,
    balcony: req.has_balcony || false,
    air_conditioning: req.has_air_conditioning || false,
    security: req.has_security || false,
    furnished: req.is_furnished || false,
    distance_to_city_center_m: 2000.0
  };

  const res = await fetch(`${API_BASE}/valuation/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) throw new Error('Valuation prediction request failed');
  const data: ValuationPredictionResponse = await res.json();

  const contribMap: Record<string, number> = {};
  if (data.feature_contributions) {
    data.feature_contributions.forEach((c) => {
      const sign = c.type === 'positive' ? 1 : -1;
      contribMap[c.factor] = sign * (Math.abs(c.impact_mad) / data.estimated_price_mad);
    });
  }

  return {
    predicted_price: data.estimated_price_mad,
    price_per_m2: Math.round(data.estimated_price_per_m2),
    price_range: {
      low: data.confidence_band_mad ? data.confidence_band_mad.lower : Math.round(data.estimated_price_mad * 0.9),
      high: data.confidence_band_mad ? data.confidence_band_mad.upper : Math.round(data.estimated_price_mad * 1.1)
    },
    feature_contributions: contribMap
  };
}

export async function fetchDataQuality(): Promise<DataQualityReport> {
  const res = await fetch(`${API_BASE}/data-quality`);
  if (!res.ok) throw new Error('Failed to fetch data quality metrics');
  return res.json();
}
