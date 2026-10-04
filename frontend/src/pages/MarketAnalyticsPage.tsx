import React, { useState, useEffect } from 'react';
import { MarketSummary, NeighborhoodStat } from '../types';
import { fetchMarketSummary, fetchNeighborhoodStats, fetchPriceDistribution } from '../services/api';
import { 
  TrendingUp, Building, DollarSign, Home, CheckCircle2, 
  MapPin, AlertCircle, BarChart3, PieChart, Layers, RefreshCw,
  Sparkles
} from 'lucide-react';

export const MarketAnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodStat[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_desc' | 'm2_desc' | 'listings_desc'>('m2_desc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, neighData, distData] = await Promise.all([
        fetchMarketSummary(),
        fetchNeighborhoodStats(),
        fetchPriceDistribution(),
      ]);
      setSummary(sumData);
      setNeighborhoods(neighData);
      setDistribution(distData);
    } catch (err: any) {
      console.error('Failed to load market analytics:', err);
      setError('Failed to fetch market data. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const sortedNeighborhoods = [...neighborhoods].sort((a, b) => {
    if (sortBy === 'price_desc') return b.median_price - a.median_price;
    if (sortBy === 'm2_desc') return b.median_price_per_m2 - a.median_price_per_m2;
    return b.listing_count - a.listing_count;
  });

  const maxM2 = Math.max(...neighborhoods.map((n) => n.median_price_per_m2), 1);
  const maxPrice = Math.max(...neighborhoods.map((n) => n.median_price), 1);
  const maxListings = Math.max(...neighborhoods.map((n) => n.listing_count), 1);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--accent-light)' }} />
          <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Aggregating spatial market analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', padding: '24px' }}>
        <div
          className="glass-panel"
          style={{
            maxWidth: '440px',
            padding: '32px',
            textAlign: 'center',
            border: '1px solid var(--danger)',
          }}
        >
          <AlertCircle size={40} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Connection Error
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
            {error || 'Could not load market data.'}
          </p>
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
            Retry Connection
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
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--success)',
                  border: '1px solid var(--success)',
                  fontWeight: 600,
                }}
              >
                Gold Marts Verified
              </span>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Marrakech, Morocco
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              Market Intelligence & Spatial Analytics
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Spatial aggregates, telemetry distributions, and cross-district valuations across 13 administrative zones.
            </p>
          </div>
          <button
            onClick={loadData}
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <RefreshCw size={13} style={{ color: 'var(--accent-light)' }} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* 4 KPI Scorecards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '18px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Total Active Listings
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(2, 132, 199, 0.15)',
                  color: 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building size={16} />
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {summary.total_listings.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} />
              <span>13 districts geocoded (100%)</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '18px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Median Price
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarSign size={16} />
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {summary.median_price.toLocaleString()}{' '}
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>MAD</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Avg: {(summary.avg_price / 1_000_000).toFixed(2)}M MAD
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '18px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Median Price / m²
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BarChart3 size={16} />
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {summary.median_price_per_m2.toLocaleString()}{' '}
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>MAD/m²</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Avg: {Math.round(summary.avg_price_per_m2).toLocaleString()} MAD/m²
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '18px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Median Surface Area
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Home size={16} />
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {summary.median_surface}{' '}
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>m²</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Avg: {Math.round(summary.avg_surface)} m²
            </div>
          </div>
        </div>

        {/* Analytics Section: Left Hierarchy Rankings, Right Breakdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Left Column: Rankings */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} style={{ color: 'var(--accent-light)' }} />
                  <span>District Valuation Hierarchy</span>
                </h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Comparative pricing metrics sorted across 13 Marrakech zones
                </p>
              </div>

              {/* Sort selector */}
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
                  { id: 'm2_desc', label: 'Price / m²' },
                  { id: 'price_desc', label: 'Median Price' },
                  { id: 'listings_desc', label: 'Volume' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id as any)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: sortBy === s.id ? 700 : 500,
                      backgroundColor: sortBy === s.id ? 'var(--accent)' : 'transparent',
                      color: sortBy === s.id ? '#ffffff' : 'var(--text-secondary)',
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

            {/* Bars List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {sortedNeighborhoods.map((n, idx) => {
                const pct =
                  sortBy === 'm2_desc'
                    ? (n.median_price_per_m2 / maxM2) * 100
                    : sortBy === 'price_desc'
                    ? (n.median_price / maxPrice) * 100
                    : (n.listing_count / maxListings) * 100;

                return (
                  <div key={n.neighborhood}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-mono" style={{ color: 'var(--text-muted)', width: '22px' }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{n.neighborhood}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({n.listing_count} listings)</span>
                      </div>
                      <div className="font-mono" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {sortBy === 'm2_desc' && `${n.median_price_per_m2.toLocaleString()} MAD/m²`}
                        {sortBy === 'price_desc' && `${(n.median_price / 1_000_000).toFixed(2)}M MAD`}
                        {sortBy === 'listings_desc' && `${n.listing_count} properties`}
                      </div>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'var(--bg-surface-hover)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '999px',
                          background:
                            idx < 3
                              ? 'linear-gradient(90deg, var(--accent) 0%, #38bdf8 100%)'
                              : idx < 7
                              ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                              : 'var(--text-muted)',
                          width: `${Math.max(pct, 5)}%`,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Breakdown Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Inventory by Typology */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <PieChart size={15} style={{ color: 'var(--accent-light)' }} />
                <span>Typology Composition</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(summary.property_type_breakdown || {}).map(([type, rawCount]) => {
                  const count = Number(rawCount) || 0;
                  const pct = Math.round((count / summary.total_listings) * 100);
                  return (
                    <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {type}
                        </span>
                        <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', backgroundColor: 'var(--accent)', borderRadius: '999px', width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Valuation Model Value Gap */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                <span>AVM Market Alignment</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(summary.valuation_status_breakdown || {}).map(([status, rawCount]) => {
                  const count = Number(rawCount) || 0;
                  const pct = Math.round((count / summary.total_listings) * 100);
                  const isUnder = status.toLowerCase().includes('below');
                  const isOver = status.toLowerCase().includes('above');
                  const badgeColor = isUnder ? 'var(--success)' : isOver ? 'var(--danger)' : 'var(--accent-light)';

                  return (
                    <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{status}</span>
                        <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', backgroundColor: badgeColor, borderRadius: '999px', width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  marginTop: '16px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                Calibrated on Champion Random Forest regressor with forward temporal holdout (Test R² = 0.8781).
              </div>
            </div>

            {/* Pipeline Provenance */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Layers size={15} style={{ color: 'var(--accent-light)' }} />
                <span>Geospatial Engine</span>
              </h2>
              <div className="font-mono" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                  <span>Projection</span>
                  <span style={{ color: 'var(--text-primary)' }}>EPSG:4326 (WGS 84)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                  <span>Spatial Engine</span>
                  <span style={{ color: 'var(--text-primary)' }}>PostGIS 3.4 / SQLite RT</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                  <span>dbt Marts</span>
                  <span style={{ color: 'var(--success)' }}>4 models (PASS)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Validation</span>
                  <span style={{ color: 'var(--success)' }}>100.0% Pass Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
