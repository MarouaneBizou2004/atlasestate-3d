import React, { useState } from 'react';
import { Search, RotateCcw, SlidersHorizontal, Layers, X, ChevronRight } from 'lucide-react';
import { MapMode } from '../types';

interface FilterSidebarProps {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  mapMode: MapMode;
  setMapMode: (mode: MapMode) => void;
  neighborhoodsList: string[];
  totalMatches: number;
  onSelectProperty?: (propertyId: string) => void;
  allProperties?: any[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  mapMode,
  setMapMode,
  neighborhoodsList,
  totalMatches,
  onSelectProperty,
  allProperties = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const propertyTypes = ['All', 'Apartment', 'Villa', 'Riad', 'Duplex', 'Commercial'];
  const bedroomOptions = ['Any', '1+', '2+', '3+', '4+', '5+'];

  const mapModes: Array<{ id: MapMode; label: string; desc: string }> = [
    { id: 'explorer', label: '1. Property Explorer', desc: 'Interactive property markers' },
    { id: 'heatmap', label: '2. Price/m² Heatmap', desc: 'Continuous price density heatmap' },
    { id: 'density', label: '3. Cluster Density', desc: 'High-density spatial clusters' },
    { id: 'neighborhood', label: '4. Neighborhood 3D', desc: 'Extruded polygons by median price/m²' },
    { id: 'activity', label: '5. Market Activity', desc: 'Extrusion by listing volume' },
    { id: 'value_gap', label: '6. ML Value Gap', desc: 'Over/underpriced relative to model' },
  ];

  const handleReset = () => {
    setSearchQuery('');
    setFilters({
      search: '',
      neighborhood: 'all',
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
  };

  // Autocomplete matching properties
  const searchMatches = searchQuery.trim().length >= 2 && allProperties.length > 0
    ? allProperties.filter((p: any) => {
        const q = searchQuery.toLowerCase();
        return (
          (p.property_id && p.property_id.toLowerCase().includes(q)) ||
          (p.neighborhood && p.neighborhood.toLowerCase().includes(q)) ||
          (p.property_type && p.property_type.toLowerCase().includes(q)) ||
          (p.title && p.title.toLowerCase().includes(q))
        );
      }).slice(0, 6)
    : [];

  const handleSelectSearchResult = (propId: string) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (onSelectProperty) {
      onSelectProperty(propId);
    }
  };

  return (
    <aside style={{
      width: '320px',
      backgroundColor: '#0f172a',
      borderRight: '1px solid #1e293b',
      height: 'calc(100vh - 60px)',
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      zIndex: 20,
      position: 'relative'
    }}>
      {/* Search Input Box */}
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '8px 12px',
          gap: '8px'
        }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search ID, neighborhood, type..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#f8fafc',
              fontSize: '12px',
              width: '100%',
              outline: 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Live Search Autocomplete Dropdown */}
        {showSearchResults && searchMatches.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '42px',
            left: 0,
            right: 0,
            backgroundColor: '#0f172a',
            border: '1px solid #38bdf8',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.7)',
            zIndex: 50,
            overflow: 'hidden',
            maxHeight: '260px',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '6px 10px', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px solid #1e293b', fontWeight: 700 }}>
              Matching Properties ({searchMatches.length})
            </div>
            {searchMatches.map((match: any) => (
              <div
                key={match.property_id}
                onClick={() => handleSelectSearchResult(match.property_id)}
                style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid #1e293b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
                    {match.property_type || 'Listing'} in {match.neighborhood}
                  </div>
                  <div style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>
                    {match.property_id} • {(match.price || 0).toLocaleString()} MAD
                  </div>
                </div>
                <ChevronRight size={14} color="#94a3b8" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3D Visualization Modes */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Layers size={13} color="#38bdf8" /> 3D Map Modes
          </span>
          <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>Active</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {mapModes.map((m) => {
            const isSelected = mapMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMapMode(m.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? '#1e293b' : 'transparent',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid #1e293b',
                  color: isSelected ? '#f8fafc' : '#94a3b8',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: isSelected ? 600 : 500, color: isSelected ? '#38bdf8' : '#cbd5e1' }}>
                  {m.label}
                </span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>{m.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <hr style={{ borderColor: '#1e293b', borderWidth: '0.5px' }} />

      {/* Filter Header & Reset */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <SlidersHorizontal size={13} color="#38bdf8" /> Filters ({totalMatches.toLocaleString()} found)
        </span>
        <button
          onClick={handleReset}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Reset All Filters"
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      {/* Neighborhood Dropdown */}
      <div>
        <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
          Neighborhood / Zone
        </label>
        <select
          value={filters.neighborhood}
          onChange={(e) => setFilters((prev: any) => ({ ...prev, neighborhood: e.target.value }))}
          style={{
            width: '100%',
            padding: '8px 10px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#f8fafc',
            fontSize: '12px',
            outline: 'none'
          }}
        >
          <option value="all">All Marrakech Neighborhoods (13)</option>
          {neighborhoodsList.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Property Type Pills */}
      <div>
        <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
          Property Type
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          {propertyTypes.map((pt) => {
            const isSelected = filters.property_type.toLowerCase() === pt.toLowerCase();
            return (
              <button
                key={pt}
                onClick={() => setFilters((prev: any) => ({ ...prev, property_type: pt.toLowerCase() }))}
                style={{
                  padding: '6px 0',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: isSelected ? '#2563eb' : '#1e293b',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: isSelected ? '1px solid #3b82f6' : '1px solid #334155',
                  cursor: 'pointer'
                }}
              >
                {pt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500 }}>Max Price</span>
          <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>
            {(filters.max_price / 1000000).toFixed(1)}M MAD
          </span>
        </div>
        <input
          type="range"
          min={500000}
          max={20000000}
          step={250000}
          value={filters.max_price}
          onChange={(e) => setFilters((prev: any) => ({ ...prev, max_price: Number(e.target.value) }))}
          style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
          <span>0.5M</span>
          <span>10M</span>
          <span>20M+</span>
        </div>
      </div>

      {/* Surface Area Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500 }}>Max Surface</span>
          <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>
            {filters.max_surface} m²
          </span>
        </div>
        <input
          type="range"
          min={40}
          max={800}
          step={20}
          value={filters.max_surface}
          onChange={(e) => setFilters((prev: any) => ({ ...prev, max_surface: Number(e.target.value) }))}
          style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
          <span>40 m²</span>
          <span>400 m²</span>
          <span>800 m²</span>
        </div>
      </div>

      {/* Bedrooms Filter */}
      <div>
        <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
          Min Bedrooms
        </label>
        <div style={{ display: 'flex', gap: '4px' }}>
          {bedroomOptions.map((opt, i) => {
            const val = i === 0 ? 'any' : String(i);
            const isSelected = String(filters.bedrooms) === val;
            return (
              <button
                key={opt}
                onClick={() => setFilters((prev: any) => ({ ...prev, bedrooms: val }))}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: isSelected ? '#2563eb' : '#1e293b',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: isSelected ? '1px solid #3b82f6' : '1px solid #334155',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amenities Checkboxes */}
      <div>
        <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
          Key Amenities
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
          {[
            { id: 'has_pool', label: 'Pool' },
            { id: 'has_parking', label: 'Parking' },
            { id: 'has_elevator', label: 'Elevator' },
            { id: 'has_terrace', label: 'Terrace' },
            { id: 'has_garden', label: 'Garden' }
          ].map((am) => (
            <label key={am.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(filters[am.id])}
                onChange={(e) => setFilters((prev: any) => ({ ...prev, [am.id]: e.target.checked }))}
                style={{ accentColor: '#2563eb' }}
              />
              <span>{am.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Valuation Status */}
      <div>
        <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
          ML Value Gap Status
        </label>
        <select
          value={filters.valuation_status}
          onChange={(e) => setFilters((prev: any) => ({ ...prev, valuation_status: e.target.value }))}
          style={{
            width: '100%',
            padding: '8px 10px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#f8fafc',
            fontSize: '12px',
            outline: 'none'
          }}
        >
          <option value="all">All Valuation Tiers</option>
          <option value="Below model estimate">Below model estimate (&lt; -7.5%)</option>
          <option value="Near model estimate">Near model estimate (Fair)</option>
          <option value="Above model estimate">Above model estimate (&gt; +7.5%)</option>
        </select>
      </div>
    </aside>
  );
};
