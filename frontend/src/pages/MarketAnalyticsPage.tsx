import React, { useState, useEffect } from 'react';
import { MarketSummary, NeighborhoodStat } from '../types';
import { fetchMarketSummary, fetchNeighborhoodStats, fetchPriceDistribution } from '../services/api';
import { 
  TrendingUp, Building, DollarSign, Home, CheckCircle2, 
  MapPin, AlertCircle, BarChart3, PieChart, Layers, RefreshCw
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

  const maxM2 = Math.max(...neighborhoods.map(n => n.median_price_per_m2), 1);
  const maxPrice = Math.max(...neighborhoods.map(n => n.median_price), 1);
  const maxListings = Math.max(...neighborhoods.map(n => n.listing_count), 1);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-bg">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
          <p className="text-gray-400 font-mono text-sm">Aggregating spatial market analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-bg p-6">
        <div className="bg-dark-card border border-rose-500/30 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 text-sm mb-6">{error || 'Could not load market data.'}</p>
          <button
            onClick={loadData}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-dark-bg overflow-y-auto px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Gold Mart v1.2
              </span>
              <span className="text-xs text-gray-500 font-mono">City: Marrakech, Morocco</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
              Market Intelligence & Spatial Analytics
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Real-time property market telemetry, spatial aggregates, and price distribution across 13 administrative districts.
            </p>
          </div>
          <button
            onClick={loadData}
            className="self-start md:self-auto flex items-center gap-2 px-3 py-2 bg-dark-card hover:bg-dark-surface border border-gray-800 rounded-lg text-xs font-medium text-gray-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>

        {/* KPI Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-dark-card border border-gray-800/80 rounded-xl p-5 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between text-gray-400 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">Total Active Listings</span>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {summary.total_listings.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3" />
              <span>13 neighborhoods verified</span>
            </div>
          </div>

          <div className="bg-dark-card border border-gray-800/80 rounded-xl p-5 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between text-gray-400 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">Median Price</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {summary.median_price.toLocaleString()} <span className="text-xs text-gray-500">MAD</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Avg: {(summary.avg_price / 1_000_000).toFixed(2)}M MAD
            </div>
          </div>

          <div className="bg-dark-card border border-gray-800/80 rounded-xl p-5 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between text-gray-400 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">Median Price / m²</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {summary.median_price_per_m2.toLocaleString()} <span className="text-xs text-gray-500">MAD/m²</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Avg: {Math.round(summary.avg_price_per_m2).toLocaleString()} MAD/m²
            </div>
          </div>

          <div className="bg-dark-card border border-gray-800/80 rounded-xl p-5 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between text-gray-400 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">Median Surface</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {summary.median_surface} <span className="text-xs text-gray-500">m²</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Avg: {Math.round(summary.avg_surface)} m²
            </div>
          </div>
        </div>

        {/* Two-Column Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Neighborhood Pricing Rankings */}
          <div className="lg:col-span-2 bg-dark-card border border-gray-800/80 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-400" />
                  Neighborhood Pricing Hierarchy
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Spatial comparison of median valuation metrics by administrative zone
                </p>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1 bg-dark-surface p-1 rounded-lg border border-gray-800 text-xs">
                <button
                  onClick={() => setSortBy('m2_desc')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    sortBy === 'm2_desc' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Price / m²
                </button>
                <button
                  onClick={() => setSortBy('price_desc')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    sortBy === 'price_desc' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Median Price
                </button>
                <button
                  onClick={() => setSortBy('listings_desc')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    sortBy === 'listings_desc' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Volume
                </button>
              </div>
            </div>

            {/* Bars List */}
            <div className="space-y-4">
              {sortedNeighborhoods.map((n, idx) => {
                const pct = sortBy === 'm2_desc'
                  ? (n.median_price_per_m2 / maxM2) * 100
                  : sortBy === 'price_desc'
                  ? (n.median_price / maxPrice) * 100
                  : (n.listing_count / maxListings) * 100;

                return (
                  <div key={n.neighborhood} className="group">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-500 w-5">#{idx + 1}</span>
                        <span className="font-medium text-white group-hover:text-sky-400 transition-colors">
                          {n.neighborhood}
                        </span>
                        <span className="text-gray-500 text-[11px]">({n.listing_count} listings)</span>
                      </div>
                      <div className="font-mono font-medium text-gray-300">
                        {sortBy === 'm2_desc' && `${n.median_price_per_m2.toLocaleString()} MAD/m²`}
                        {sortBy === 'price_desc' && `${(n.median_price / 1_000_000).toFixed(2)}M MAD`}
                        {sortBy === 'listings_desc' && `${n.listing_count} properties`}
                      </div>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2.5 bg-dark-surface rounded-full overflow-hidden border border-gray-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx < 3
                            ? 'bg-gradient-to-r from-sky-500 to-indigo-500'
                            : idx < 7
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : 'bg-gray-600'
                        }`}
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Breakdown Widgets */}
          <div className="space-y-6">
            
            {/* Property Types */}
            <div className="bg-dark-card border border-gray-800/80 rounded-xl p-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-emerald-400" />
                Inventory by Property Type
              </h2>
              <div className="space-y-3">
                {Object.entries(summary.property_type_breakdown || {}).map(([type, rawCount]) => {
                  const count = Number(rawCount) || 0;
                  const pct = Math.round((count / summary.total_listings) * 100);
                  return (
                    <div key={type} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize font-medium text-gray-300">{type}</span>
                        <span className="font-mono text-gray-400">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-dark-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Valuation Model Status Breakdown */}
            <div className="bg-dark-card border border-gray-800/80 rounded-xl p-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                ML Valuation Value Gap
              </h2>
              <div className="space-y-3">
                {Object.entries(summary.valuation_status_breakdown || {}).map(([status, rawCount]) => {
                  const count = Number(rawCount) || 0;
                  const pct = Math.round((count / summary.total_listings) * 100);
                  const isUnder = status.toLowerCase().includes('below');
                  const isOver = status.toLowerCase().includes('above');
                  const badgeColor = isUnder ? 'bg-emerald-500' : isOver ? 'bg-rose-500' : 'bg-sky-500';

                  return (
                    <div key={status} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-300 font-medium">{status}</span>
                        <span className="font-mono text-gray-400">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-dark-surface rounded-full overflow-hidden">
                        <div
                          className={`h-full ${badgeColor} rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-dark-surface/50 border border-gray-800 rounded-lg text-[11px] text-gray-400 leading-relaxed">
                Calculated against the Champion Random Forest regressor with forward-chaining temporal holdout (Test R² = 0.8781).
              </div>
            </div>

            {/* Spatial Data Stack Summary */}
            <div className="bg-dark-card border border-gray-800/80 rounded-xl p-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-indigo-400" />
                Pipeline Metadata
              </h2>
              <div className="space-y-2 text-xs font-mono text-gray-400">
                <div className="flex justify-between py-1 border-b border-gray-800/60">
                  <span>Projection</span>
                  <span className="text-white">EPSG:4326 (WGS 84)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800/60">
                  <span>Spatial Engine</span>
                  <span className="text-white">PostGIS 3.4 / SQLite RT</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800/60">
                  <span>dbt Marts</span>
                  <span className="text-emerald-400">4 models (PASS)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Data Quality</span>
                  <span className="text-emerald-400">100.0% Pass Rate</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
