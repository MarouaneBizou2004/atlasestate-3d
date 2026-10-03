import React, { useEffect, useState } from 'react';
import { Property, ComparableProperty } from '../types';
import { fetchComparables } from '../services/api';
import { ComparablesList } from './ComparablesList';
import { 
  X, MapPin, Maximize2, Bed, Bath, Layers, ExternalLink,
  Sparkles, CheckCircle2, TrendingUp, TrendingDown, Clock, Navigation
} from 'lucide-react';

interface PropertyDetailPanelProps {
  property: Property | null;
  onClose: () => void;
  onSelectComparable: (propertyId: string) => void;
}

export const PropertyDetailPanel: React.FC<PropertyDetailPanelProps> = ({
  property,
  onClose,
  onSelectComparable
}) => {
  const [comparables, setComparables] = useState<ComparableProperty[]>([]);
  const [loadingComps, setLoadingComps] = useState(false);

  useEffect(() => {
    if (property) {
      setLoadingComps(true);
      fetchComparables(property.property_id, 5)
        .then((res) => setComparables(res))
        .catch(() => setComparables([]))
        .finally(() => setLoadingComps(false));
    }
  }, [property]);

  if (!property) return null;

  // Valuation Badge styling
  let valColor = '#38bdf8';
  let valBg = 'rgba(56, 189, 248, 0.1)';
  let valIcon = Sparkles;
  if (property.valuation_status === 'Below model estimate') {
    valColor = '#4ade80';
    valBg = 'rgba(74, 222, 128, 0.1)';
    valIcon = TrendingDown;
  } else if (property.valuation_status === 'Above model estimate') {
    valColor = '#f87171';
    valBg = 'rgba(248, 113, 113, 0.1)';
    valIcon = TrendingUp;
  }

  const ValIconComponent = valIcon;

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
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{property.property_id}</span>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
            {property.property_type} in {property.neighborhood}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            <MapPin size={13} color="#38bdf8" /> Marrakech, Morocco
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

      {/* Main Pricing Box */}
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '14px'
      }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Asking Price</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
          {property.price.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 600 }}>MAD</span>
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
          <strong>{property.price_per_m2.toLocaleString()}</strong> MAD / m²
        </div>
      </div>

      {/* Key Specifications Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
          <Maximize2 size={16} color="#38bdf8" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Living Area</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>{property.surface_m2} m²</div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
          <Bed size={16} color="#38bdf8" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Bedrooms</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>{property.bedrooms}</div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
          <Bath size={16} color="#38bdf8" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Bathrooms</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>{property.bathrooms}</div>
        </div>
      </div>

      {/* Machine Learning Valuation Intelligence */}
      <div style={{
        backgroundColor: valBg,
        border: `1px solid ${valColor}40`,
        borderRadius: '8px',
        padding: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: valColor, fontWeight: 700, fontSize: '12px' }}>
            <ValIconComponent size={15} />
            <span>ML Valuation Estimate</span>
          </div>
          <span style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: `${valColor}20`,
            color: valColor,
            fontWeight: 700
          }}>
            {property.valuation_status}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Estimated Value:</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
              {(property.predicted_price || property.price).toLocaleString()} MAD
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Value Gap:</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: valColor }}>
              {(property.value_gap_percent || 0) > 0 ? '+' : ''}{property.value_gap_percent || 0}%
            </div>
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', fontStyle: 'italic' }}>
          Statistical estimate based on Random Forest regressor with zero lookahead bias.
        </div>
      </div>

      {/* Amenities Badges */}
      <div>
        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>
          Amenities & Features
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { label: 'Swimming Pool', active: property.pool },
            { label: 'Dedicated Parking', active: property.parking },
            { label: 'Elevator', active: property.elevator },
            { label: 'Private Terrace', active: property.terrace },
            { label: 'Garden', active: property.garden },
            { label: 'Balcony', active: property.balcony },
            { label: 'Air Conditioning', active: property.air_conditioning },
            { label: 'Furnished', active: property.furnished },
            { label: '24/7 Security', active: property.security }
          ].map((am, i) => (
            <span
              key={i}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: am.active ? '#1e293b' : 'rgba(30, 41, 59, 0.4)',
                color: am.active ? '#38bdf8' : '#64748b',
                border: am.active ? '1px solid #334155' : '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {am.active && <CheckCircle2 size={11} color="#38bdf8" />} {am.label}
            </span>
          ))}
        </div>
      </div>

      {/* Proximity to OpenStreetMap POIs */}
      <div>
        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>
          Location Intelligence (Distance to POIs)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '11px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '6px 8px', borderRadius: '4px' }}>
            <span style={{ color: '#64748b' }}>City Center:</span> <strong>{((property.distance_to_city_center_m || 2000) / 1000).toFixed(1)} km</strong>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '6px 8px', borderRadius: '4px' }}>
            <span style={{ color: '#64748b' }}>Jemaa el-Fnaa:</span> <strong>{((property.distance_to_medina_m || 2500) / 1000).toFixed(1)} km</strong>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '6px 8px', borderRadius: '4px' }}>
            <span style={{ color: '#64748b' }}>Public Transit:</span> <strong>{Math.round(property.distance_to_transit_m || 600)} m</strong>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '6px 8px', borderRadius: '4px' }}>
            <span style={{ color: '#64748b' }}>Hospital:</span> <strong>{Math.round(property.distance_to_hospital_m || 800)} m</strong>
          </div>
        </div>
      </div>

      {/* Comparable Nearby Properties */}
      <div>
        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>
          Nearby Comparable Properties ({comparables.length})
        </div>
        {loadingComps ? (
          <div style={{ fontSize: '11px', color: '#64748b' }}>Finding spatial comparables...</div>
        ) : (
          <ComparablesList comparables={comparables} onSelectComparable={onSelectComparable} />
        )}
      </div>

      {/* External Original Listing Link */}
      {property.listing_url && (
        <a
          href={property.listing_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: 600,
            marginTop: 'auto'
          }}
        >
          <ExternalLink size={14} /> View Original Listing ({property.source})
        </a>
      )}
    </div>
  );
};
