import React from 'react';
import { Property } from '../types';
import { Building, MapPin, X, ChevronRight } from 'lucide-react';

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

  const medianPrice =
    properties.length > 0
      ? properties.map((p) => p.price).sort((a, b) => a - b)[Math.floor(properties.length / 2)]
      : 0;

  const medianM2 =
    properties.length > 0
      ? Math.round(
          properties
            .map((p) => p.price_per_m2 || 0)
            .sort((a, b) => a - b)[Math.floor(properties.length / 2)]
        )
      : 0;

  return (
    <div
      className="glass-panel-elevated animate-slide-in-right"
      style={{
        position: 'absolute',
        top: '16px',
        right: '20px',
        bottom: '24px',
        width: '380px',
        maxHeight: 'calc(100vh - 110px)',
        zIndex: 35,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '14px',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-hover)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-light)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <Building size={14} />
            <span>3D Building Complex</span>
          </div>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '4px',
              lineHeight: 1.3,
            }}
          >
            {buildingTitle}
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}
          >
            <MapPin size={12} style={{ color: 'var(--accent-light)' }} />
            <span>{neighborhood}, Marrakech</span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Close Panel"
        >
          <X size={15} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Building Telemetry Scorecard */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Available Units
            </div>
            <div className="font-mono" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-light)', marginTop: '2px' }}>
              {properties.length}{' '}
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>Listings</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Median Asking
            </div>
            <div className="font-mono" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {(medianPrice / 1000000).toFixed(2)}M{' '}
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>MAD</span>
            </div>
          </div>
          <div
            style={{
              gridColumn: 'span 2',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'var(--text-secondary)',
            }}
          >
            <span>Median Unit Rate:</span>
            <strong className="font-mono" style={{ color: 'var(--success)' }}>
              {medianM2.toLocaleString()} MAD/m²
            </strong>
          </div>
        </div>

        {/* Units List */}
        <div>
          <div
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--text-muted)',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            Units in this Complex ({properties.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {properties.map((prop) => (
              <div
                key={prop.property_id}
                onClick={() => onSelectProperty(prop.property_id)}
                style={{
                  backgroundColor: 'var(--bg-surface-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-active)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-card)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(2, 132, 199, 0.15)',
                        color: 'var(--accent-light)',
                        fontWeight: 700,
                      }}
                    >
                      {prop.property_type || 'Apartment'}
                    </span>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {prop.property_id}
                    </span>
                  </div>

                  <div className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px' }}>
                    {(prop.price || 0).toLocaleString()}{' '}
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MAD</span>
                  </div>

                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {prop.surface_m2 || (prop as any).surface || 0} m² • {prop.bedrooms || 0} bed • {prop.bathrooms || 1} bath
                  </div>
                </div>

                <div style={{ color: 'var(--accent-light)', display: 'flex', alignItems: 'center' }}>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
