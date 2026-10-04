import React, { useState, useEffect } from 'react';
import { NeighborhoodStat } from '../types';
import { fetchNeighborhoodStats } from '../services/api';
import { 
  MapPin, Search, ArrowUpDown, Building, Home, 
  ExternalLink, Sparkles, AlertCircle, RefreshCw, Compass
} from 'lucide-react';

interface Props {
  onSelectNeighborhood?: (neighborhoodName: string) => void;
}

export const NeighborhoodsPage: React.FC<Props> = ({ onSelectNeighborhood }) => {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'listings' | 'price' | 'm2'>('m2');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNeighborhoodStats();
      setNeighborhoods(data);
    } catch (err: any) {
      console.error('Failed to load neighborhoods:', err);
      setError('Could not load neighborhood data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'name' | 'listings' | 'price' | 'm2') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredNeighborhoods = neighborhoods
    .filter((n) => n.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let result = 0;
      if (sortField === 'name') result = a.neighborhood.localeCompare(b.neighborhood);
      else if (sortField === 'listings') result = a.listing_count - b.listing_count;
      else if (sortField === 'price') result = a.median_price - b.median_price;
      else if (sortField === 'm2') result = a.median_price_per_m2 - b.median_price_per_m2;
      return sortAsc ? result : -result;
    });

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--accent-light)' }} />
          <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Loading administrative districts...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', padding: '24px' }}>
        <div className="glass-panel" style={{ maxWidth: '440px', padding: '32px', textAlign: 'center', border: '1px solid var(--danger)' }}>
          <AlertCircle size={40} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Failed to Load
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={loadData}
            style={{
              padding: '8px 18px',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--bg-app)',
        overflowY: 'auto',
        padding: '24px 32px',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '20px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(2, 132, 199, 0.15)',
                  color: 'var(--accent-light)',
                  border: '1px solid var(--border-subtle)',
                  fontWeight: 600,
                }}
              >
                13 Administrative Districts
              </span>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Official PostGIS Polygons
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              Marrakech District Intelligence Directory
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Detailed spatial boundaries, price-per-square-meter benchmarks, and one-click 3D exploration.
            </p>
          </div>

          {/* Search bar & Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              className="glass-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                width: '240px',
              }}
            >
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  width: '100%',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: '4px',
                padding: '3px',
                background: 'var(--bg-surface-hover)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {[
                { id: 'm2', label: 'Rate/m²' },
                { id: 'price', label: 'Price' },
                { id: 'listings', label: 'Units' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSort(s.id as any)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: sortField === s.id ? 700 : 500,
                    backgroundColor: sortField === s.id ? 'var(--accent)' : 'transparent',
                    color: sortField === s.id ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Neighborhood Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredNeighborhoods.map((n) => {
            const isPremium = n.median_price_per_m2 > 17000;
            return (
              <div
                key={n.neighborhood}
                className="glass-panel"
                style={{
                  padding: '20px',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                  border: '1px solid var(--border-subtle)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-active)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {n.neighborhood}
                        </h3>
                        {isPremium && (
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              color: 'var(--warning)',
                              border: '1px solid var(--warning)',
                              fontSize: '9px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Sparkles size={10} /> Prime
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Marrakech Wilaya Sector
                      </div>
                    </div>

                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-surface-hover)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-light)',
                      }}
                    >
                      <MapPin size={16} />
                    </div>
                  </div>

                  {/* Metrics Box */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface-card)',
                      border: '1px solid var(--border-subtle)',
                      margin: '14px 0',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Rate / m²
                      </div>
                      <div className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {n.median_price_per_m2.toLocaleString()}{' '}
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MAD</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Median Price
                      </div>
                      <div className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {(n.median_price / 1_000_000).toFixed(2)}M{' '}
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MAD</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>Active Properties:</span>
                    <strong className="font-mono" style={{ color: 'var(--accent-light)' }}>
                      {n.listing_count} listings
                    </strong>
                  </div>
                </div>

                {/* Explore in 3D Button */}
                {onSelectNeighborhood && (
                  <button
                    onClick={() => onSelectNeighborhood(n.neighborhood)}
                    style={{
                      marginTop: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                    }}
                  >
                    <Compass size={13} />
                    <span>Explore in 3D Map</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
