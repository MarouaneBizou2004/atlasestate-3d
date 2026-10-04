import React, { useState } from 'react';
import { ValuationRequest, ValuationResponse } from '../types';
import { predictPrice } from '../services/api';
import { 
  Calculator, Sparkles, TrendingUp, DollarSign, Home, 
  Layers, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck 
} from 'lucide-react';

const NEIGHBORHOODS = [
  'Gueliz', 'Hivernage', 'Palmeraie', 'Medina', 'Agdal',
  'Targa', 'Menara', 'Semlalia', 'Massira', 'Daoudiate',
  'Mhamid', 'Ennakhil', 'Sidi Youssef Ben Ali'
];

const PROPERTY_TYPES = ['apartment', 'villa', 'riad', 'commercial', 'land'];
const CONDITIONS = ['new', 'excellent', 'good', 'needs_renovation'];

export const ValuationCalculatorPage: React.FC = () => {
  const [formData, setFormData] = useState<ValuationRequest>({
    neighborhood: 'Gueliz',
    property_type: 'apartment',
    surface: 120,
    bedrooms: 2,
    bathrooms: 2,
    floor: 2,
    total_floors: 5,
    year_built: 2018,
    condition: 'excellent',
    has_elevator: true,
    has_balcony: true,
    has_terrace: false,
    has_garden: false,
    has_pool: false,
    has_parking: true,
    has_security: true,
    has_air_conditioning: true,
    is_furnished: false,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValuationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predictPrice(formData);
      setResult(res);
    } catch (err: any) {
      console.error('Valuation prediction error:', err);
      setError('Failed to estimate property value. Ensure the backend API is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: keyof ValuationRequest) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--bg-app)',
        overflowY: 'auto',
        padding: '24px 32px',
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600,
              }}
            >
              Walk-Forward ML Regressor (R² = 0.8781)
            </span>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Champion Random Forest Ensemble
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
            Automated Valuation Model (AVM)
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Instantaneous property valuation inference in Marrakech based on 45 spatial coordinates, structural features, and amenity vectors.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '28px' }}>
          {/* Form Column */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={16} style={{ color: 'var(--accent-light)' }} />
              <span>Property Parameters</span>
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Neighborhood & Type */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    District
                  </label>
                  <select
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  >
                    {NEIGHBORHOODS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Typology
                  </label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      outline: 'none',
                      textTransform: 'capitalize',
                    }}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Surface & Condition */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Surface Area (m²)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={5000}
                    value={formData.surface}
                    onChange={(e) => setFormData({ ...formData, surface: parseFloat(e.target.value) || 0 })}
                    className="font-mono"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      outline: 'none',
                      textTransform: 'capitalize',
                    }}
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rooms & Floor */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 1 })}
                    className="font-mono"
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 1 })}
                    className="font-mono"
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Year Built
                  </label>
                  <input
                    type="number"
                    min={1920}
                    max={2026}
                    value={formData.year_built}
                    onChange={(e) => setFormData({ ...formData, year_built: parseInt(e.target.value) || 2020 })}
                    className="font-mono"
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                </div>
              </div>

              {/* Amenities Grid */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Inclusions & Features
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {[
                    { key: 'has_elevator', label: 'Elevator' },
                    { key: 'has_balcony', label: 'Balcony' },
                    { key: 'has_terrace', label: 'Terrace' },
                    { key: 'has_garden', label: 'Garden' },
                    { key: 'has_pool', label: 'Pool' },
                    { key: 'has_parking', label: 'Parking' },
                    { key: 'has_security', label: 'Security' },
                    { key: 'has_air_conditioning', label: 'HVAC AC' },
                    { key: 'is_furnished', label: 'Furnished' },
                  ].map((amenity) => {
                    const isChecked = !!formData[amenity.key as keyof ValuationRequest];
                    return (
                      <button
                        type="button"
                        key={amenity.key}
                        onClick={() => handleToggle(amenity.key as keyof ValuationRequest)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: isChecked ? 600 : 500,
                          backgroundColor: isChecked ? 'rgba(2, 132, 199, 0.2)' : 'var(--bg-surface-hover)',
                          color: isChecked ? 'var(--accent-light)' : 'var(--text-secondary)',
                          border: isChecked ? '1px solid var(--accent-light)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            backgroundColor: isChecked ? 'var(--accent)' : 'transparent',
                            border: isChecked ? 'none' : '1px solid var(--border-default)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isChecked && <CheckCircle2 size={10} color="#fff" />}
                        </div>
                        <span>{amenity.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: 'none',
                  boxShadow: 'var(--shadow-md)',
                  opacity: loading ? 0.7 : 1,
                  transition: 'background-color 0.15s ease',
                }}
              >
                {loading ? (
                  <>
                    <Sparkles size={16} className="animate-spin" />
                    <span>Executing ML Inference Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Estimate Fair Market Value</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div
                className="glass-panel"
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid var(--danger)',
                  color: 'var(--danger)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {result ? (
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--success)',
                        border: '1px solid var(--success)',
                        fontWeight: 700,
                      }}
                    >
                      Model Estimate
                    </span>
                    <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      90% Confidence Interval
                    </span>
                  </div>
                  <div className="font-mono" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-light)', marginTop: '4px' }}>
                    {result.predicted_price.toLocaleString()}{' '}
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>MAD</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="font-mono">≈ {Math.round(result.predicted_price / 10.8).toLocaleString()} €</span>
                    <span>•</span>
                    <span className="font-mono" style={{ color: 'var(--success)', fontWeight: 600 }}>
                      {result.price_per_m2.toLocaleString()} MAD/m²
                    </span>
                  </div>
                </div>

                {/* Range Card */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-surface-card)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <span>Valuation Bounds</span>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      ±10% Tolerance
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Conservative</div>
                      <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {(result.price_range.low / 1_000_000).toFixed(2)}M MAD
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Optimistic</div>
                      <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {(result.price_range.high / 1_000_000).toFixed(2)}M MAD
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Contributions */}
                {result.feature_contributions && (
                  <div>
                    <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingUp size={13} style={{ color: 'var(--accent-light)' }} />
                      <span>Key Valuation Drivers</span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(result.feature_contributions).map(([feature, weight]: [string, any]) => {
                        const pct = Math.min(Math.abs(weight) * 150, 100);
                        const isPositive = weight >= 0;
                        return (
                          <div key={feature}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                              <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                                {feature.replace('_', ' ')}
                              </span>
                              <span className="font-mono" style={{ color: isPositive ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                                {isPositive ? '+' : ''}{(weight * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  borderRadius: '999px',
                                  backgroundColor: isPositive ? 'var(--success)' : 'var(--danger)',
                                  width: `${pct}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--accent-light)', flexShrink: 0 }} />
                  <span>
                    Indicative valuation benchmark computed by the spatial ML pipeline. Professional appraisal is recommended prior to formal contracting.
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="glass-panel"
                style={{
                  padding: '32px',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minHeight: '380px',
                  border: '1px dashed var(--border-default)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(2, 132, 199, 0.15)',
                    color: 'var(--accent-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <Sparkles size={24} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Awaiting Property Parameters
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.5 }}>
                  Configure the property parameters on the left and submit to trigger ML feature inference and confidence bounds estimation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
