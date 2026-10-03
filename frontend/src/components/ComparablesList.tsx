import React from 'react';
import { ComparableProperty } from '../types';
import { MapPin, Maximize2, Bed, Bath, ArrowUpRight } from 'lucide-react';

interface ComparablesListProps {
  comparables: ComparableProperty[];
  onSelectComparable: (propertyId: string) => void;
}

export const ComparablesList: React.FC<ComparablesListProps> = ({ comparables, onSelectComparable }) => {
  if (!comparables || comparables.length === 0) {
    return <div style={{ fontSize: '11px', color: '#64748b' }}>No direct comparables found.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {comparables.map((comp) => {
        const isHigher = comp.price_difference_pct > 0;
        return (
          <div
            key={comp.property_id}
            onClick={() => onSelectComparable(comp.property_id)}
            style={{
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              cursor: 'pointer',
              transition: 'border-color 0.15s, transform 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#334155')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{comp.neighborhood}</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                fontWeight: 700
              }}>
                {comp.similarity_score_pct}% Match
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                {(comp.price / 1000000).toFixed(2)}M MAD
              </span>
              <span style={{ fontSize: '10px', color: isHigher ? '#f87171' : '#4ade80' }}>
                {isHigher ? '+' : ''}{comp.price_difference_pct}%
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Maximize2 size={11} /> {comp.surface_m2} m²
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Bed size={11} /> {comp.bedrooms} bed
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <MapPin size={11} /> {(comp.distance_meters / 1000).toFixed(1)} km
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
