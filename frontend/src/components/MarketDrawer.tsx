import React, { useState } from 'react';
import { ChevronUp, ChevronDown, BarChart2, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';

interface MarketDrawerProps {
  totalListings?: number;
  onNavigateToAnalytics?: () => void;
}

export const MarketDrawer: React.FC<MarketDrawerProps> = ({
  totalListings = 1290,
  onNavigateToAnalytics,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        width: isExpanded ? '640px' : 'auto',
        maxWidth: 'calc(100vw - 40px)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Compact Strip */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            cursor: 'pointer',
            background: 'var(--bg-surface-hover)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                boxShadow: '0 0 8px var(--success-glow)',
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Marrakech Macro Intelligence
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>
              <strong className="font-mono" style={{ color: 'var(--accent-light)' }}>
                {totalListings.toLocaleString()}
              </strong>{' '}
              Listings
            </span>
            <span>•</span>
            <span>
              Median:{' '}
              <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
                16,800
              </strong>{' '}
              MAD/m²
            </span>
            <span>•</span>
            <span>
              AVM Accuracy:{' '}
              <strong className="font-mono" style={{ color: 'var(--success)' }}>
                91.4%
              </strong>
            </span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
            {isExpanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </div>
        </div>

        {/* Expanded Telemetry Grid */}
        {isExpanded && (
          <div
            style={{
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-card)',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Prime District
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Hivernage / Gueliz
                </div>
                <div className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-light)', marginTop: '2px' }}>
                  19,400 MAD/m² avg
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-surface-card)',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  High-Yield Zone
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Medina & Riad Core
                </div>
                <div className="font-mono" style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '2px' }}>
                  +8.4% YoY Growth
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-surface-card)',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  ML Valuation Confidence
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)', marginTop: '2px' }}>
                  High (R² = 0.878)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  MedAE: ±6.8%
                </div>
              </div>
            </div>

            {onNavigateToAnalytics && (
              <button
                onClick={onNavigateToAnalytics}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--accent-light)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.15s',
                }}
              >
                <BarChart2 size={13} />
                <span>Open Full Interactive Market Analytics Suite</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
