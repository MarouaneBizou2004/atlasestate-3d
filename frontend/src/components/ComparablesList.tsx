import React from 'react';
import { ComparableProperty } from '../types';
import { MapPin, Maximize2, Bed } from 'lucide-react';

interface ComparablesListProps {
  comparables: ComparableProperty[];
  onSelectComparable: (propertyId: string) => void;
}

export const ComparablesList: React.FC<ComparablesListProps> = ({ comparables, onSelectComparable }) => {
  if (!comparables || comparables.length === 0) {
    return (
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        No direct comparables found.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {comparables.map((comp) => {
        const isHigher = comp.price_difference_pct > 0;
        return (
          <div
            key={comp.property_id}
            onClick={() => onSelectComparable(comp.property_id)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-card)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {comp.neighborhood}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(2, 132, 199, 0.15)',
                  color: 'var(--accent-light)',
                  fontWeight: 700,
                }}
              >
                {comp.similarity_score_pct}% Match
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
              <span className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {(comp.price / 1000000).toFixed(2)}M MAD
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: isHigher ? 'var(--danger)' : 'var(--success)',
                }}
              >
                {isHigher ? '+' : ''}
                {comp.price_difference_pct}%
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Maximize2 size={11} style={{ color: 'var(--accent-light)' }} /> {comp.surface_m2} m²
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Bed size={11} style={{ color: 'var(--accent-light)' }} /> {comp.bedrooms} bed
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <MapPin size={11} style={{ color: 'var(--accent-light)' }} /> {(comp.distance_meters / 1000).toFixed(1)} km
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
