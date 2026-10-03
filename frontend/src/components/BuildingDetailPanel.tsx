import React from 'react';
import { Property } from '../types';
import { Building, MapPin, X, ChevronRight, Layers, DollarSign, Home } from 'lucide-react';

interface BuildingDetailPanelProps {
  buildingTitle: string;
  neighborhood: string;
  properties: Property[];
  onClose: () => void;
  onSelectProperty: (propertyId: string) => void;
}

export const BuildingDetailPanel: React.FC<BuildingDetailPanelProps> = ({
  buildingTitle,
  neighborhood,
  properties,
  onClose,
  onSelectProperty,
}) => {
  if (!properties || properties.length === 0) return null;

  const medianPrice = properties.length > 0
    ? properties.map(p => p.price).sort((a, b) => a - b)[Math.floor(properties.length / 2)]
    : 0;

  const medianM2 = properties.length > 0
    ? Math.round(properties.map(p => p.price_per_m2).sort((a, b) => a - b)[Math.floor(properties.length / 2)])
    : 0;

  return (
    <div style={{
      width: '380px',
      backgroundColor: '#0f172a',
      borderLeft: '1px solid #1e293b',
      height: 'calc(100vh - 60px)',
      overflowY: 'auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      zIndex: 30,
      position: 'relative',
      boxShadow: '-8px 0 25px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Building size={14} />
            <span>3D Building Complex</span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginTop: '4px', lineHeight: 1.3 }}>
            {buildingTitle}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            <MapPin size={13} color="#38bdf8" /> {neighborhood}, Marrakech
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#94a3b8',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Building Telemetry Scorecard */}
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '12px 14px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px'
      }}>
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Available Units</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
            {properties.length} <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>Listings</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Median Asking</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
            {(medianPrice / 1000000).toFixed(2)}M <span style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8' }}>MAD</span>
          </div>
        </div>
        <div style={{ gridColumn: 'span 2', paddingTop: '8px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1' }}>
          <span>Median Unit Rate:</span>
          <strong style={{ color: '#10b981' }}>{medianM2.toLocaleString()} MAD/m²</strong>
        </div>
      </div>

      {/* Units List */}
      <div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>
          Units in this Building ({properties.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {properties.map((prop) => (
            <div
              key={prop.property_id}
              onClick={() => onSelectProperty(prop.property_id)}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.backgroundColor = '#243248';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.backgroundColor = '#1e293b';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    fontWeight: 700
                  }}>
                    {prop.property_type || 'Apartment'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                    {prop.property_id}
                  </span>
                </div>

                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                  {(prop.price || 0).toLocaleString()} <span style={{ fontSize: '11px', color: '#94a3b8' }}>MAD</span>
                </div>

                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  {prop.surface_m2 || (prop as any).surface || 0} m² • {prop.bedrooms || 0} ch. • {prop.bathrooms || 1} sdb
                </div>
              </div>

              <div style={{ color: '#38bdf8', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
