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
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="flex-1 bg-dark-bg overflow-y-auto px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-gray-800 pb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Walk-Forward ML Regressor (R² = 0.8781)
            </span>
            <span className="text-xs text-gray-500 font-mono">Random Forest Champion Ensemble</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
            Automated Valuation Model (AVM)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Predict property fair market value in Marrakech based on structural dimensions, architectural typologies, and spatial distance features.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-7 bg-dark-card border border-gray-800/80 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-sky-400" />
              Property Specifications
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Neighborhood & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Administrative District
                  </label>
                  <select
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full bg-dark-surface border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    {NEIGHBORHOODS.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Property Typology
                  </label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="w-full bg-dark-surface border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 capitalize"
                  >
                    {PROPERTY_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Surface & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Total Surface Area (m²)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={5000}
                    value={formData.surface}
                    onChange={(e) => setFormData({ ...formData, surface: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-surface border border-gray-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Interior Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full bg-dark-surface border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 capitalize"
                  >
                    {CONDITIONS.map(c => (
                      <option key={c} value={c}>{c.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rooms & Floor */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                    className="w-full bg-dark-surface border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                    className="w-full bg-dark-surface border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Floor Level</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                    className="w-full bg-dark-surface border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Year Built</label>
                  <input
                    type="number"
                    min={1920}
                    max={2026}
                    value={formData.year_built}
                    onChange={(e) => setFormData({ ...formData, year_built: parseInt(e.target.value) || 2020 })}
                    className="w-full bg-dark-surface border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Amenities Checkboxes */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Structural Amenities & Inclusions
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'has_elevator', label: 'Elevator' },
                    { key: 'has_balcony', label: 'Balcony' },
                    { key: 'has_terrace', label: 'Terrace' },
                    { key: 'has_garden', label: 'Private Garden' },
                    { key: 'has_pool', label: 'Swimming Pool' },
                    { key: 'has_parking', label: 'Covered Parking' },
                    { key: 'has_security', label: '24/7 Security' },
                    { key: 'has_air_conditioning', label: 'Air Conditioning' },
                    { key: 'is_furnished', label: 'Furnished' },
                  ].map((amenity) => {
                    const isChecked = !!formData[amenity.key as keyof ValuationRequest];
                    return (
                      <button
                        type="button"
                        key={amenity.key}
                        onClick={() => handleToggle(amenity.key as keyof ValuationRequest)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs text-left transition-all ${
                          isChecked
                            ? 'bg-sky-500/10 border-sky-500/40 text-sky-300 font-medium'
                            : 'bg-dark-surface/40 border-gray-800 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-sky-500 border-sky-500 text-white' : 'border-gray-700'
                        }`}>
                          {isChecked && <CheckCircle2 className="w-3 h-3" />}
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
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Computing Spatial ML Valuation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Estimate Fair Market Value</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result ? (
              <div className="bg-dark-card border border-gray-800/80 rounded-xl p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Model Estimate
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">Confidence 90%</span>
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono mt-1">
                    {result.predicted_price.toLocaleString()} <span className="text-sm text-gray-400 font-normal">MAD</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                    <span>≈ {Math.round(result.predicted_price / 10.8).toLocaleString()} €</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono font-medium">
                      {result.price_per_m2.toLocaleString()} MAD/m²
                    </span>
                  </div>
                </div>

                {/* Range Card */}
                <div className="p-4 bg-dark-surface/60 rounded-xl border border-gray-800">
                  <div className="text-xs font-semibold text-gray-300 mb-2 flex items-center justify-between">
                    <span>Estimated Valuation Range</span>
                    <span className="text-[10px] text-gray-500 font-mono">±10% Bounds</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="text-gray-500 text-[10px]">Conservative</div>
                      <div className="text-gray-300 font-medium">
                        {(result.price_range.low / 1_000_000).toFixed(2)}M MAD
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                    <div className="text-right">
                      <div className="text-gray-500 text-[10px]">Optimistic</div>
                      <div className="text-gray-300 font-medium">
                        {(result.price_range.high / 1_000_000).toFixed(2)}M MAD
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Contributions */}
                {result.feature_contributions && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                      Key Valuation Drivers
                    </h3>
                    <div className="space-y-2.5">
                      {Object.entries(result.feature_contributions).map(([feature, weight]: [string, any]) => {
                        const pct = Math.min(Math.abs(weight) * 150, 100);
                        const isPositive = weight >= 0;
                        return (
                          <div key={feature} className="text-xs">
                            <div className="flex justify-between text-gray-300 mb-1">
                              <span className="capitalize">{feature.replace('_', ' ')}</span>
                              <span className={`font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPositive ? '+' : ''}{(weight * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-dark-surface rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-800 text-[11px] text-gray-500 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>
                    Valuation output is strictly indicative based on historical transaction & listing benchmarks. Professional appraisal recommended prior to financial commitments.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-dark-card border border-gray-800/80 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Awaiting Specifications</h3>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  Fill out the property specifications on the left and submit to trigger model inference across 45 spatial and structural features.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
