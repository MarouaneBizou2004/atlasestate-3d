import React, { useEffect } from 'react';
import { MapPin, X, Building, DollarSign, Home, Compass, Sparkles, Filter, ChevronRight, Copy, Check } from 'lucide-react';
import { Property } from '../types';

interface NeighborhoodDetailPanelProps {
  neighborhoodName: string;
  onClose: () => void;
  onFilterNeighborhood: (name: string) => void;
  onSelectProperty?: (propertyId: string) => void;
  allProperties?: Property[];
  stats?: {
    medianPrice?: number;
    medianPriceM2?: number;
    listingCount?: number;
    avgSurface?: number;
  };
}

// 13 Official Administrative District Centers in Marrakech for Coordinates
const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  gueliz: { lat: 31.6346, lng: -8.0125 },
  hivernage: { lat: 31.6210, lng: -8.0160 },
  medina: { lat: 31.6270, lng: -7.9890 },
  palmeraie: { lat: 31.6700, lng: -7.9600 },
  agdal: { lat: 31.6000, lng: -7.9875 },
  targa: { lat: 31.6500, lng: -8.0550 },
  menara: { lat: 31.6150, lng: -8.0250 },
  semlalia: { lat: 31.6450, lng: -8.0200 },
  massira: { lat: 31.6300, lng: -8.0500 },
  daoudiate: { lat: 31.6550, lng: -7.9950 },
  mhamid: { lat: 31.5950, lng: -8.0400 },
  ennakhil: { lat: 31.6400, lng: -7.9500 },
  'sidi youssef ben ali': { lat: 31.6050, lng: -7.9700 },
};

export const NeighborhoodDetailPanel: React.FC<NeighborhoodDetailPanelProps> = ({
  neighborhoodName,
  onClose,
  onFilterNeighborhood,
  onSelectProperty,
  allProperties = [],
  stats,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const keyLower = neighborhoodName.toLowerCase().trim();
  const coords = NEIGHBORHOOD_COORDS[keyLower] || { lat: 31.6346, lng: -8.0125 };

  // Filter properties belonging to this neighborhood
  const districtProps = allProperties.filter(
    (p) => (p.neighborhood || '').toLowerCase().trim() === keyLower
  );

  const count = districtProps.length || stats?.listingCount || 0;
  const prices = districtProps.map((p) => p.price).filter(Boolean).sort((a, b) => a - b);
  const medianPrice = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : (stats?.medianPrice || 1850000);

  const ppm2s = districtProps
    .map((p) => p.price_per_m2 || (p.surface_m2 ? Math.round(p.price / p.surface_m2) : 0))
    .filter(Boolean)
    .sort((a, b) => a - b);
  const medianPpm2 = ppm2s.length > 0 ? ppm2s[Math.floor(ppm2s.length / 2)] : (stats?.medianPriceM2 || 16800);

  // Top typologies in this district
  const typologies = districtProps.reduce((acc, p) => {
    const t = p.property_type || 'Apartment';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedTypes = Object.entries(typologies).sort((a, b) => b[1] - a[1]);

  const copyCoords = () => {
    navigator.clipboard.writeText(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-testid="neighborhood-detail-panel"
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
            <span>District Intelligence</span>
          </div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '4px',
              lineHeight: 1.2,
            }}
          >
            {neighborhoodName} — Marrakech
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}
          >
            <MapPin size={12} style={{ color: 'var(--accent-light)' }} />
            <span>Official Administrative District</span>
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
          title="Close (Esc)"
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
        {/* Coordinates Card (Cordonnées) */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Cordonnées Géographiques
            </div>
            <div className="font-mono" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {coords.lat.toFixed(4)}° N, {Math.abs(coords.lng).toFixed(4)}° W
            </div>
          </div>
          <button
            onClick={copyCoords}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-subtle)',
              color: copied ? 'var(--success)' : 'var(--text-muted)',
              fontSize: '10px',
              cursor: 'pointer',
            }}
            title="Copy coordinates"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Pricing & Telemetry Scorecard */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '10px',
            padding: '14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Median Rate / m²
            </div>
            <div className="font-mono" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-light)', marginTop: '2px' }}>
              {medianPpm2.toLocaleString()}{' '}
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>MAD</span>
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
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'var(--text-secondary)',
            }}
          >
            <span>Verified Market Inventory:</span>
            <strong className="font-mono" style={{ color: 'var(--success)' }}>
              {count} Active Properties
            </strong>
          </div>
        </div>

        {/* Typology Breakdown */}
        {sortedTypes.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                fontWeight: 700,
              }}
            >
              Typology Distribution
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sortedTypes.slice(0, 4).map(([tName, tCount]) => {
                const pct = Math.round((tCount / (count || 1)) * 100);
                return (
                  <div key={tName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{tName}</span>
                      <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                        {tCount} ({pct}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent)', borderRadius: '999px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Map to this District Button */}
        <button
          onClick={() => {
            onFilterNeighborhood(neighborhoodName);
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--accent)',
            color: '#ffffff',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'background-color 0.15s',
          }}
        >
          <Filter size={13} />
          <span>Filter Map to {neighborhoodName} ({count})</span>
        </button>

        {/* Properties Preview in this Neighborhood */}
        {districtProps.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                fontWeight: 700,
              }}
            >
              Featured Listings in {neighborhoodName}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {districtProps.slice(0, 5).map((p) => (
                <div
                  key={p.property_id}
                  onClick={() => onSelectProperty && onSelectProperty(p.property_id)}
                  style={{
                    backgroundColor: 'var(--bg-surface-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.12s ease',
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
                          padding: '1px 5px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(2, 132, 199, 0.15)',
                          color: 'var(--accent-light)',
                          fontWeight: 700,
                        }}
                      >
                        {p.property_type || 'Apartment'}
                      </span>
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {p.property_id}
                      </span>
                    </div>
                    <div className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {(p.price || 0).toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MAD</span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {p.surface_m2} m² • {p.bedrooms} bed • {p.bathrooms} bath
                    </div>
                  </div>
                  <ChevronRight size={15} style={{ color: 'var(--accent-light)' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
