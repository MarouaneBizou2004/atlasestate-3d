import React, { useState } from 'react';
import { 
  RotateCcw, 
  SlidersHorizontal, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Radio,
  Building,
  TrendingUp,
  Sparkles,
  Check
} from 'lucide-react';
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
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'property' | 'location' | 'features'>('property');

  const propertyTypes = ['All', 'Apartment', 'Villa', 'Riad', 'Duplex', 'Commercial'];
  const bedroomOptions = ['Any', '1+', '2+', '3+', '4+', '5+'];

  const mapModes: Array<{ id: MapMode; label: string; desc: string; icon: any }> = [
    { id: 'explorer', label: '3D Explorer', desc: 'Interactive property markers', icon: Building },
    { id: 'heatmap', label: 'Price Heatmap', desc: 'Price/m² density raster', icon: Flame },
    { id: 'density', label: 'Cluster Density', desc: 'Clustered property counts', icon: Radio },
    { id: 'neighborhood', label: 'District 3D', desc: 'Extruded by median price/m²', icon: Building },
    { id: 'activity', label: 'Listing Volume', desc: 'Extruded by listing count', icon: TrendingUp },
    { id: 'value_gap', label: 'ML Value Gap', desc: 'Under/overpriced vs model', icon: Sparkles },
  ];

  const handleReset = () => {
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

  const amenities = [
    { id: 'has_pool', label: 'Private Pool' },
    { id: 'has_parking', label: 'Parking Garage' },
    { id: 'has_elevator', label: 'Elevator' },
    { id: 'has_terrace', label: 'Terrace' },
    { id: 'has_garden', label: 'Private Garden' },
  ];

  if (collapsed) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '72px',
          left: '20px',
          zIndex: 25,
        }}
      >
        <button
          onClick={() => setCollapsed(false)}
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-md)',
          }}
          title="Open Filters"
        >
          <SlidersHorizontal size={15} style={{ color: 'var(--accent-light)' }} />
          <span>Filters ({totalMatches.toLocaleString()})</span>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '72px',
        left: '20px',
        bottom: '24px',
        width: '330px',
        maxHeight: 'calc(100vh - 170px)',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '14px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-hover)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={15} style={{ color: 'var(--accent-light)' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Spatial Filters
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(2, 132, 199, 0.15)',
              color: 'var(--accent-light)',
              fontWeight: 600,
            }}
          >
            {totalMatches.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleReset}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 6px',
              borderRadius: '4px',
            }}
            title="Reset All Filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px',
            }}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* 3D Map Modes Strip */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'var(--text-muted)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
          }}
        >
          <Layers size={12} style={{ color: 'var(--accent-light)' }} />
          <span>3D Visualization Layer</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          {mapModes.map((m) => {
            const isSelected = mapMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMapMode(m.id)}
                style={{
                  padding: '6px 4px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-surface-hover)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--accent-light)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.12s ease',
                }}
                title={m.desc}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '4px 10px',
          gap: '4px',
          background: 'var(--bg-surface-hover)',
        }}
      >
        {[
          { id: 'property', label: 'Property' },
          { id: 'location', label: 'Location' },
          { id: 'features', label: 'Features & ML' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '6px 0',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: isSelected ? 600 : 500,
                color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents (Scrollable) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {activeTab === 'property' && (
          <>
            {/* Property Type Grid */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                Property Typology
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
                {propertyTypes.map((pt) => {
                  const isSelected = filters.property_type.toLowerCase() === pt.toLowerCase();
                  return (
                    <button
                      key={pt}
                      onClick={() =>
                        setFilters((prev: any) => ({
                          ...prev,
                          property_type: isSelected && pt.toLowerCase() !== 'all' ? 'all' : pt.toLowerCase(),
                        }))
                      }
                      style={{
                        padding: '7px 0',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: isSelected ? 600 : 500,
                        backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-surface-hover)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        border: isSelected ? '1px solid var(--accent-light)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {pt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Max Price
                </span>
                <span className="font-mono" style={{ fontSize: '12px', color: 'var(--accent-light)', fontWeight: 600 }}>
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
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>0.5M MAD</span>
                <span>10M MAD</span>
                <span>20M+ MAD</span>
              </div>
            </div>

            {/* Surface Area Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Max Surface
                </span>
                <span className="font-mono" style={{ fontSize: '12px', color: 'var(--accent-light)', fontWeight: 600 }}>
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
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>40 m²</span>
                <span>400 m²</span>
                <span>800 m²</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'location' && (
          <>
            {/* Neighborhood Dropdown */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                District / Administrative Zone
              </label>
              <select
                value={filters.neighborhood}
                onChange={(e) => setFilters((prev: any) => ({ ...prev, neighborhood: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                <option value="all">All Marrakech Districts (13)</option>
                {neighborhoodsList.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Bedrooms Pill Selector */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                Minimum Bedrooms
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
                        padding: '6px 0',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: isSelected ? 600 : 500,
                        backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-surface-hover)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        border: isSelected ? '1px solid var(--accent-light)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'features' && (
          <>
            {/* Amenities Toggle Chips */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                Premium Amenities
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {amenities.map((am) => {
                  const isActive = Boolean(filters[am.id]);
                  return (
                    <button
                      key={am.id}
                      onClick={() => setFilters((prev: any) => ({ ...prev, [am.id]: !isActive }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: isActive ? 600 : 500,
                        backgroundColor: isActive ? 'rgba(2, 132, 199, 0.2)' : 'var(--bg-surface-hover)',
                        color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
                        border: isActive ? '1px solid var(--accent-light)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {isActive && <Check size={12} />}
                      <span>{am.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ML Value Gap Status Filter */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                ML Model Valuation Tier
              </label>
              <select
                value={filters.valuation_status}
                onChange={(e) => setFilters((prev: any) => ({ ...prev, valuation_status: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                <option value="all">All Valuation Tiers</option>
                <option value="Below model estimate">Below model estimate (&lt; -7.5%)</option>
                <option value="Near model estimate">Near model estimate (Fair Value)</option>
                <option value="Above model estimate">Above model estimate (&gt; +7.5%)</option>
              </select>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
