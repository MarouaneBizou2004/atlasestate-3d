import React from 'react';
import { Search, RotateCcw, SlidersHorizontal, Layers, Eye } from 'lucide-react';
import { MapMode } from '../types';

interface FilterSidebarProps {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  mapMode: MapMode;
  setMapMode: (mode: MapMode) => void;
  neighborhoodsList: string[];
  totalMatches: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  mapMode,
  setMapMode,
  neighborhoodsList,
  totalMatches,
}) => {
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
    setFilters({
      search: '',
      neighborhood: 'all',
      property_type: 'all',
      min_price: 500000,
      max_price: 15000000,
      min_surface: 30,
      max_surface: 600,
      bedrooms: 'any',
      has_pool: false,
      has_parking: false,
      has_elevator: false,
      has_terrace: false,
      has_garden: false,
      valuation_status: 'all',
    });
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
      zIndex: 20
    }}>
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
