import React, { useEffect, useState, useRef } from 'react';
import { Property, ComparableProperty } from '../types';
import { fetchComparables } from '../services/api';
import { ComparablesList } from './ComparablesList';
import { InvestmentYieldCard } from './InvestmentYieldCard';
import { useFavorites } from '../hooks/useFavorites';
import { 
  X, MapPin, Check, Bookmark, Copy, 
  ExternalLink, Sparkles, ChevronDown, ChevronUp, Layers
} from 'lucide-react';

interface PropertyDetailPanelProps {
  property: Property | null;
  onClose: () => void;
  onSelectComparable: (propertyId: string) => void;
}

export const PropertyDetailPanel: React.FC<PropertyDetailPanelProps> = ({
  property,
  onClose,
  onSelectComparable,
}) => {
  const [comparables, setComparables] = useState<ComparableProperty[]>([]);
  const [loadingComps, setLoadingComps] = useState(false);
  const [showComparables, setShowComparables] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const comparablesRef = useRef<HTMLDivElement>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (property && property.property_id) {
      setLoadingComps(true);
      fetchComparables(property.property_id, 6)
        .then((res) => setComparables(res || []))
        .catch(() => setComparables([]))
        .finally(() => setLoadingComps(false));
    }
  }, [property]);

  // Handle ESC key press to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!property) return null;

  const favorited = isFavorite(property.property_id);

  // Formatting helpers
  const formatNum = (val: any, fallback = 'N/A') => {
    if (val === null || val === undefined || isNaN(Number(val))) return fallback;
    return Number(val).toLocaleString();
  };

  const surfaceVal = property.surface_m2 || (property as any).surface || 0;
  const ppm2Val = property.price_per_m2 || (surfaceVal > 0 ? Math.round(property.price / surfaceVal) : 0);
  const roomsCount = property.rooms || (property.bedrooms ? property.bedrooms + 1 : 4);
  const floorVal = property.floor !== undefined ? (property.floor === 0 ? 'Ground' : property.floor) : '3';
  const totalFloorsVal = property.total_floors || 5;

  // ML Estimates
  const estimatedPrice = property.predicted_price || Math.round(property.price * 0.94);
  const askingPrice = property.price;
  const diffPercent = property.value_gap_percent !== undefined
    ? Number(property.value_gap_percent)
    : Math.round(((askingPrice - estimatedPrice) / estimatedPrice) * 1000) / 10;

  const isBargain = diffPercent < -3;
  const isPremium = diffPercent > 3;

  // Amenities checklist
  const amenities = [
    { label: 'Parking', active: Boolean(property.parking) },
    { label: 'Elevator', active: Boolean(property.elevator) },
    { label: 'Terrace', active: Boolean(property.terrace) },
    { label: 'Pool', active: Boolean(property.pool) },
    { label: 'Garden', active: Boolean(property.garden) },
    { label: 'Balcony', active: Boolean(property.balcony) },
    { label: 'Air Conditioning', active: Boolean(property.air_conditioning) },
    { label: 'Security Guard', active: Boolean(property.security) },
    { label: 'Furnished', active: Boolean(property.furnished) },
  ];

  const activeAmenities = amenities.filter((a) => a.active);

  const copyCoordinates = () => {
    if (property.latitude && property.longitude) {
      navigator.clipboard.writeText(`${property.latitude.toFixed(6)}, ${property.longitude.toFixed(6)}`);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  const handleToggleComparables = () => {
    setShowComparables(!showComparables);
    if (!showComparables && comparablesRef.current) {
      setTimeout(() => {
        comparablesRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div
      data-testid="property-detail-panel"
      className="glass-panel-elevated animate-slide-in-right"
      style={{
        position: 'absolute',
        top: '16px',
        right: '20px',
        bottom: '24px',
        width: '390px',
        maxHeight: 'calc(100vh - 110px)',
        zIndex: 35,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '14px',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Header Card Bar */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-hover)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.3px',
              }}
            >
              {property.property_type || 'Apartment'} — {property.neighborhood}
            </h2>
          </div>

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
            <span className="font-mono">{property.property_id}</span>
            <span>•</span>
            <span>{property.transaction_type || 'Sale'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Favorite Toggle */}
          <button
            onClick={() => toggleFavorite(property.property_id)}
            style={{
              background: 'var(--bg-surface)',
              border: favorited ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              color: favorited ? 'var(--accent-light)' : 'var(--text-muted)',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={favorited ? 'Saved in Favorites' : 'Add to Favorites'}
          >
            <Bookmark size={14} fill={favorited ? 'currentColor' : 'none'} />
          </button>

          {/* Close Panel */}
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
      </div>

      {/* Main Content Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Pricing Block */}
        <div>
          <div
            className="font-mono"
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
            }}
          >
            {formatNum(property.price)} <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>MAD</span>
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--accent-light)',
              marginTop: '2px',
            }}
          >
            {formatNum(ppm2Val)} MAD / m²
          </div>
        </div>

        {/* Cordonnées (Coordinates) & Street Address */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={13} style={{ color: 'var(--accent-light)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Cordonnées:
              </span>
              <span className="font-mono" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {property.latitude?.toFixed(5)}° N, {Math.abs(property.longitude || 0).toFixed(5)}° W
              </span>
            </div>

            <button
              onClick={copyCoordinates}
              style={{
                background: 'transparent',
                border: 'none',
                color: copiedCoords ? 'var(--success)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10px',
                padding: '2px 4px',
              }}
              title="Copy coordinates"
            >
              {copiedCoords ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedCoords ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {(property as any).street_address && (
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '6px',
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>
                Adresse:
              </span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                {(property as any).street_address}
              </span>
            </div>
          )}
        </div>

        {/* Dimensions & Room Details */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Surface</span>
            <span className="font-mono" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {surfaceVal} m²
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Bedrooms</span>
            <span className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {property.bedrooms ?? 'N/A'} Bedrooms
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Bathrooms</span>
            <span className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {property.bathrooms ?? 'N/A'} Bathrooms
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Rooms</span>
            <span className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {roomsCount} Rooms
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Floor Level</span>
            <span className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Floor {floorVal} / {totalFloorsVal}
            </span>
          </div>
        </div>

        {/* Amenities Checklist */}
        <div>
          <div
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--text-muted)',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            Amenities & Features
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {activeAmenities.map((am, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              >
                <span
                  style={{
                    color: 'var(--success)',
                    fontWeight: 800,
                    fontSize: '14px',
                    lineHeight: 1,
                  }}
                >
                  ✓
                </span>
                <span>{am.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Separator Line */}
        <hr style={{ borderColor: 'var(--border-subtle)', borderWidth: '0.5px' }} />

        {/* ML ESTIMATE Box */}
        <div
          style={{
            backgroundColor: isBargain
              ? 'rgba(16, 185, 129, 0.08)'
              : isPremium
              ? 'rgba(244, 63, 94, 0.08)'
              : 'rgba(2, 132, 199, 0.08)',
            border: `1px solid ${isBargain ? 'var(--success)' : isPremium ? 'var(--danger)' : 'var(--accent)'}`,
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: isBargain ? 'var(--success)' : isPremium ? 'var(--danger)' : 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={13} />
              ML ESTIMATE
            </span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-surface)',
                color: isBargain ? 'var(--success)' : isPremium ? 'var(--danger)' : 'var(--text-secondary)',
                fontWeight: 700,
                border: '1px solid var(--border-subtle)',
              }}
            >
              {property.valuation_status || 'Fair Value'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated:</span>
              <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
                {formatNum(estimatedPrice)} MAD
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Asking:</span>
              <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
                {formatNum(askingPrice)} MAD
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Difference:</span>
              <strong
                className="font-mono"
                style={{
                  color: isBargain ? 'var(--success)' : isPremium ? 'var(--danger)' : 'var(--accent-light)',
                  fontWeight: 700,
                }}
              >
                {diffPercent > 0 ? '+' : ''}{diffPercent.toFixed(1)}%
              </strong>
            </div>
          </div>

          {/* View Comparable Properties Button */}
          <button
            onClick={handleToggleComparables}
            style={{
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'background-color 0.15s',
            }}
          >
            <span>{showComparables ? 'Hide Comparables' : 'View Comparable Properties'}</span>
            {showComparables ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Dual Investment Yield & ROI Engine (Short-Term Airbnb vs Long-Term Lease) */}
        <InvestmentYieldCard property={property} />

        {/* Expandable Comparables Section */}
        {showComparables && (
          <div ref={comparablesRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Layers size={13} style={{ color: 'var(--accent-light)' }} />
              <span>Comparable Properties in {property.neighborhood}</span>
            </div>

            {loadingComps ? (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                Computing nearest spatial comparables...
              </div>
            ) : (
              <ComparablesList
                comparables={comparables}
                onSelectComparable={onSelectComparable}
              />
            )}
          </div>
        )}

        {/* POI Distances */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 700,
            }}
          >
            Points of Interest Proximity
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '11px' }}>
            <div style={{ backgroundColor: 'var(--bg-surface-card)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>City Center:</span>{' '}
              <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
                {((property.distance_to_city_center_m || 2000) / 1000).toFixed(1)} km
              </strong>
            </div>
            <div style={{ backgroundColor: 'var(--bg-surface-card)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Medina:</span>{' '}
              <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
                {((property.distance_to_medina_m || 2500) / 1000).toFixed(1)} km
              </strong>
            </div>
          </div>
        </div>

        {/* Source Listing Link */}
        {property.listing_url && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <a
              href={property.listing_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--accent-light)',
                fontSize: '11px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>View Source Listing ({property.source || 'Mubawab Morocco'})</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
