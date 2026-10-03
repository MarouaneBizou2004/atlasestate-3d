import React, { useState, useEffect } from 'react';
import { FilterSidebar } from '../components/FilterSidebar';
import { MapContainer } from '../map/MapContainer';
import { PropertyDetailPanel } from '../components/PropertyDetailPanel';
import { Property, MapMode } from '../types';
import { fetchPropertiesGeoJSON, fetchNeighborhoods, fetchPropertyById } from '../services/api';

interface ExplorePageProps {
  initialNeighborhood?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ initialNeighborhood }) => {
  const [propertiesGeoJSON, setPropertiesGeoJSON] = useState<any>(null);
  const [neighborhoodsGeoJSON, setNeighborhoodsGeoJSON] = useState<any>(null);
  const [mapMode, setMapMode] = useState<MapMode>('explorer');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [totalMatches, setTotalMatches] = useState<number>(0);

  const [filters, setFilters] = useState<any>({
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
  });

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

  const handleSelectProperty = (id: string) => {
    fetchPropertyById(id)
      .then((prop) => setSelectedProperty(prop))
      .catch((err) => console.error('Failed to fetch property details:', err));
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', width: '100vw', overflow: 'hidden' }}>
      {/* Left Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        mapMode={mapMode}
        setMapMode={setMapMode}
        neighborhoodsList={neighborhoodsList}
        totalMatches={totalMatches}
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
        />
      </main>

      {/* Right Property Details Panel */}
      {selectedProperty && (
        <PropertyDetailPanel
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onSelectComparable={handleSelectProperty}
        />
      )}
    </div>
  );
};
