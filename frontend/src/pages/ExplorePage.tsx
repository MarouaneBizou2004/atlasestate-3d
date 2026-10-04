import React, { useState, useEffect, useCallback } from 'react';
import { FilterSidebar } from '../components/FilterSidebar';
import { MapContainer } from '../map/MapContainer';
import { PropertyDetailPanel } from '../components/PropertyDetailPanel';
import { BuildingDetailPanel } from '../components/BuildingDetailPanel';
import { NeighborhoodDetailPanel } from '../components/NeighborhoodDetailPanel';
import { FloatingSearchBar } from '../components/FloatingSearchBar';
import { MarketDrawer } from '../components/MarketDrawer';
import { Property, MapMode } from '../types';
import { fetchPropertiesGeoJSON, fetchNeighborhoods, fetchPropertyById } from '../services/api';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ExplorePageProps {
  initialNeighborhood?: string;
  onNavigateToAnalytics?: () => void;
}

const NEIGHBORHOOD_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  gueliz: { center: [-8.0125, 31.6346], zoom: 14.5 },
  hivernage: { center: [-8.0160, 31.6210], zoom: 14.5 },
  medina: { center: [-7.9890, 31.6270], zoom: 14.2 },
  palmeraie: { center: [-7.9600, 31.6700], zoom: 13.0 },
  agdal: { center: [-7.9875, 31.6000], zoom: 14.0 },
  targa: { center: [-8.0550, 31.6500], zoom: 14.0 },
  menara: { center: [-8.0250, 31.6150], zoom: 14.2 },
  semlalia: { center: [-8.0200, 31.6450], zoom: 14.5 },
  massira: { center: [-8.0500, 31.6300], zoom: 14.0 },
  daoudiate: { center: [-7.9950, 31.6550], zoom: 14.2 },
  mhamid: { center: [-8.0400, 31.5950], zoom: 13.8 },
  ennakhil: { center: [-7.9500, 31.6400], zoom: 13.5 },
  'sidi youssef ben ali': { center: [-7.9700, 31.6050], zoom: 14.0 },
};

export const ExplorePage: React.FC<ExplorePageProps> = ({ 
  initialNeighborhood,
  onNavigateToAnalytics
}) => {
  const [propertiesGeoJSON, setPropertiesGeoJSON] = useState<any>(null);
  const [neighborhoodsGeoJSON, setNeighborhoodsGeoJSON] = useState<any>(null);
  const [mapMode, setMapMode] = useState<MapMode>('explorer');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<{
    title: string;
    neighborhood: string;
    properties: any[];
  } | null>(null);
  const [selectedNeighborhoodName, setSelectedNeighborhoodName] = useState<string | null>(initialNeighborhood || null);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(true);

  const initialFilterState = {
    search: '',
    neighborhood: initialNeighborhood || 'all',
    property_type: 'all',
    min_price: 500000,
    max_price: 25000000,
    min_surface: 30,
    max_surface: 1000,
    bedrooms: 'any',
    has_pool: false,
    has_parking: false,
    has_elevator: false,
    has_terrace: false,
    has_garden: false,
    valuation_status: 'all',
  };

  const [filters, setFilters] = useState<any>(initialFilterState);

  const neighborhoodsList = [
    'Gueliz', 'Hivernage', 'Medina', 'Palmeraie', 'Agdal',
    'Targa', 'Menara', 'Semlalia', 'Massira', 'Daoudiate',
    'Mhamid', 'Ennakhil', 'Sidi Youssef Ben Ali'
  ];

  // Load Neighborhoods once
  useEffect(() => {
    fetchNeighborhoods()
      .then((res) => setNeighborhoodsGeoJSON(res))
      .catch((err) => console.error('Failed to load neighborhoods GeoJSON:', err));
  }, []);

  // Reload filtered properties when filters change
  useEffect(() => {
    setLoadingProperties(true);
    const params: Record<string, any> = {
      neighborhood: filters.neighborhood,
      property_type: filters.property_type,
      max_price: filters.max_price,
      max_surface: filters.max_surface,
      has_pool: filters.has_pool || undefined,
      has_parking: filters.has_parking || undefined,
      has_elevator: filters.has_elevator || undefined,
      has_terrace: filters.has_terrace || undefined,
      has_garden: filters.has_garden || undefined,
      valuation_status: filters.valuation_status,
      bedrooms: filters.bedrooms !== 'any' ? Number(filters.bedrooms.replace('+', '')) : undefined,
    };

    fetchPropertiesGeoJSON(params)
      .then((fc) => {
        setPropertiesGeoJSON(fc);
        setTotalMatches(fc.features ? fc.features.length : 0);
      })
      .catch((err) => console.error('Failed to fetch filtered GeoJSON:', err))
      .finally(() => setLoadingProperties(false));
  }, [filters]);

  const handleSelectProperty = useCallback((id: string | null) => {
    if (!id) {
      setSelectedProperty(null);
      return;
    }
    setSelectedBuilding(null);
    setSelectedNeighborhoodName(null);
    fetchPropertyById(id)
      .then((prop) => setSelectedProperty(prop))
      .catch((err) => console.error('Failed to fetch property details:', err));
  }, []);

  const handleSelectBuilding = useCallback((buildingData: { title: string; neighborhood: string; properties: any[] }) => {
    setSelectedProperty(null);
    setSelectedNeighborhoodName(null);
    setSelectedBuilding(buildingData);
  }, []);

  const handleSelectNeighborhood = useCallback((name: string | null) => {
    if (!name) {
      setSelectedNeighborhoodName(null);
      return;
    }
    setSelectedProperty(null);
    setSelectedBuilding(null);
    setSelectedNeighborhoodName(name);

    // Fly camera to neighborhood center
    const key = name.toLowerCase().trim();
    const config = NEIGHBORHOOD_CENTERS[key];
    const map = (window as any).map;
    if (config && map) {
      map.flyTo({
        center: config.center,
        zoom: config.zoom,
        pitch: 52,
        duration: 1800,
        essential: true,
      });
    }
  }, []);

  const handleFlyToLocation = useCallback((coords: [number, number], zoom = 15) => {
    const map = (window as any).map;
    if (map) {
      map.flyTo({
        center: coords,
        zoom,
        pitch: 52,
        duration: 1800,
        essential: true,
      });
    }
  }, []);

  const allPropertyList: Property[] = propertiesGeoJSON?.features
    ? propertiesGeoJSON.features.map((f: any) => f.properties)
    : [];

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Center 3D Map (Hero, takes full width and height) */}
      <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <MapContainer
          propertiesGeoJSON={propertiesGeoJSON}
          neighborhoodsGeoJSON={neighborhoodsGeoJSON}
          poisGeoJSON={null}
          mapMode={mapMode}
          selectedPropertyId={selectedProperty ? selectedProperty.property_id : null}
          onSelectProperty={handleSelectProperty}
          onSelectNeighborhood={handleSelectNeighborhood}
          onSelectBuilding={handleSelectBuilding}
          activeFilter={{
            neighborhood: filters.neighborhood,
            property_type: filters.property_type,
            max_price: filters.max_price,
            totalMatches: totalMatches,
          }}
        />
      </div>

      {/* Floating Search Bar (Top Left) */}
      <FloatingSearchBar
        onSelectProperty={handleSelectProperty}
        onFlyToLocation={handleFlyToLocation}
        allProperties={allPropertyList}
        onFilterNeighborhood={(neigh) => {
          setFilters((prev: any) => ({ ...prev, neighborhood: neigh }));
          handleSelectNeighborhood(neigh);
        }}
      />

      {/* Floating Filter Sidebar (Collapsible on Left) */}
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        mapMode={mapMode}
        setMapMode={setMapMode}
        neighborhoodsList={neighborhoodsList}
        totalMatches={totalMatches}
        onSelectProperty={handleSelectProperty}
        allProperties={allPropertyList}
      />

      {/* Floating Macro Market Drawer (Bottom Center) */}
      <MarketDrawer
        totalListings={totalMatches}
        onNavigateToAnalytics={onNavigateToAnalytics}
      />

      {/* Empty State Banner if 0 results match active filters */}
      {!loadingProperties && totalMatches === 0 && (
        <div
          className="glass-panel-elevated"
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '1px solid var(--danger)',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 40,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
          <span style={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600 }}>
            No properties match the current filters.
          </span>
          <button
            onClick={() => setFilters(initialFilterState)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      {/* Case 1: Floating Right Property Details Panel (Apartment, Villa, Riad, Commercial) */}
      {selectedProperty && (
        <PropertyDetailPanel
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onSelectComparable={handleSelectProperty}
        />
      )}

      {/* Case 2: Floating Right Multi-Unit Building Panel (Footprint / Complex) */}
      {selectedBuilding && !selectedProperty && (
        <BuildingDetailPanel
          buildingTitle={selectedBuilding.title}
          neighborhood={selectedBuilding.neighborhood}
          properties={selectedBuilding.properties}
          onClose={() => setSelectedBuilding(null)}
          onSelectProperty={handleSelectProperty}
        />
      )}

      {/* Case 3: Floating Right Neighborhood Intelligence Panel */}
      {selectedNeighborhoodName && !selectedProperty && !selectedBuilding && (
        <NeighborhoodDetailPanel
          neighborhoodName={selectedNeighborhoodName}
          onClose={() => setSelectedNeighborhoodName(null)}
          onFilterNeighborhood={(n) => {
            setFilters((prev: any) => ({ ...prev, neighborhood: n }));
          }}
          onSelectProperty={handleSelectProperty}
          allProperties={allPropertyList}
        />
      )}
    </div>
  );
};
