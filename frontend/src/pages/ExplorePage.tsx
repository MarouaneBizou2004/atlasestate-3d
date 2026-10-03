import React, { useState, useEffect } from 'react';
import { FilterSidebar } from '../components/FilterSidebar';
import { MapContainer } from '../map/MapContainer';
import { PropertyDetailPanel } from '../components/PropertyDetailPanel';
import { BuildingDetailPanel } from '../components/BuildingDetailPanel';
import { Property, MapMode } from '../types';
import { fetchPropertiesGeoJSON, fetchNeighborhoods, fetchPropertyById } from '../services/api';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ExplorePageProps {
  initialNeighborhood?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ initialNeighborhood }) => {
  const [propertiesGeoJSON, setPropertiesGeoJSON] = useState<any>(null);
  const [neighborhoodsGeoJSON, setNeighborhoodsGeoJSON] = useState<any>(null);
  const [mapMode, setMapMode] = useState<MapMode>('explorer');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<{
    title: string;
    neighborhood: string;
    properties: any[];
  } | null>(null);
  const [totalMatches, setTotalMatches] = useState<number>(0);

  const initialFilterState = {
    search: '',
    neighborhood: initialNeighborhood || 'all',
    property_type: 'all',
    min_price: 500000,
    max_price: 20000000,
    min_surface: 30,
    max_surface: 800,
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
      .catch((err) => console.error('Failed to fetch filtered GeoJSON:', err));
  }, [filters]);

  const handleSelectProperty = (id: string | null) => {
    if (!id) {
      setSelectedProperty(null);
      return;
    }
    setSelectedBuilding(null);
    fetchPropertyById(id)
      .then((prop) => setSelectedProperty(prop))
      .catch((err) => console.error('Failed to fetch property details:', err));
  };

  const handleSelectBuilding = (buildingData: { title: string; neighborhood: string; properties: any[] }) => {
    setSelectedProperty(null);
    setSelectedBuilding(buildingData);
  };

  const allPropertyList = propertiesGeoJSON?.features
    ? propertiesGeoJSON.features.map((f: any) => f.properties)
    : [];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      {/* Left Filter Sidebar */}
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

      {/* Center 3D Map */}
      <main style={{ flex: 1, position: 'relative', height: '100%' }}>
        <MapContainer
          propertiesGeoJSON={propertiesGeoJSON}
          neighborhoodsGeoJSON={neighborhoodsGeoJSON}
          poisGeoJSON={null}
          mapMode={mapMode}
          selectedPropertyId={selectedProperty ? selectedProperty.property_id : null}
          onSelectProperty={handleSelectProperty}
          onSelectBuilding={handleSelectBuilding}
          activeFilter={{
            neighborhood: filters.neighborhood,
            property_type: filters.property_type,
            max_price: filters.max_price,
            totalMatches: totalMatches,
          }}
        />

        {/* Empty State Banner if 0 results match active filters */}
        {totalMatches === 0 && (
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 20,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
          }}>
            <AlertCircle size={20} color="#ef4444" />
            <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600 }}>
              No properties match the current filters.
            </span>
            <button
              onClick={() => setFilters(initialFilterState)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Case A: Right Property Details Panel (Single Unit) */}
      {selectedProperty && (
        <PropertyDetailPanel
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onSelectComparable={handleSelectProperty}
        />
      )}

      {/* Case B: Right Multi-Unit Building Panel (Complex / Footprint) */}
      {selectedBuilding && !selectedProperty && (
        <BuildingDetailPanel
          buildingTitle={selectedBuilding.title}
          neighborhood={selectedBuilding.neighborhood}
          properties={selectedBuilding.properties}
          onClose={() => setSelectedBuilding(null)}
          onSelectProperty={handleSelectProperty}
        />
      )}
    </div>
  );
};
