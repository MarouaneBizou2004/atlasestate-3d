import React, { useState, useEffect } from 'react';
import { NeighborhoodStat } from '../types';
import { fetchNeighborhoodStats } from '../services/api';
import { 
  MapPin, Search, ArrowUpDown, Building, Home, 
  ExternalLink, Layers, Sparkles, AlertCircle, RefreshCw 
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
      <div className="flex-1 flex items-center justify-center bg-dark-bg">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
          <p className="text-gray-400 font-mono text-sm">Loading administrative districts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-bg p-6">
        <div className="bg-dark-card border border-rose-500/30 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={loadData}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Retry
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                13 Administrative Districts
              </span>
              <span className="text-xs text-gray-500 font-mono">OpenStreetMap Polygon Polygons</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
              Marrakech Neighborhood Directory
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Detailed spatial metrics, listing density, and valuation profiles for all urban zones.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search district name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-card border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* Neighborhood Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNeighborhoods.map((n) => {
            const isPremium = n.median_price_per_m2 > 17000;
            return (
              <div 
                key={n.neighborhood}
                className="bg-dark-card border border-gray-800 hover:border-sky-500/50 rounded-xl p-5 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
                          {n.neighborhood}
                        </h3>
                        {isPremium && (
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-medium rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> High Demand
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        Marrakech Wilaya Zone
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-dark-surface border border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-dark-surface/60 rounded-lg border border-gray-800/60 font-mono text-xs">
                    <div>
                      <div className="text-gray-500 text-[10px] uppercase">Median Price / m²</div>
                      <div className="text-white font-semibold text-sm mt-0.5">
                        {n.median_price_per_m2.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">MAD</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-[10px] uppercase">Median Listing</div>
                      <div className="text-white font-semibold text-sm mt-0.5">
                        {(n.median_price / 1_000_000).toFixed(2)}M <span className="text-[10px] text-gray-500 font-normal">MAD</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-[10px] uppercase">Active Inventory</div>
                      <div className="text-sky-400 font-semibold text-sm mt-0.5">
                        {n.listing_count} <span className="text-[10px] text-gray-500 font-normal">units</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-[10px] uppercase">Avg Surface</div>
                      <div className="text-white font-semibold text-sm mt-0.5">
                        {Math.round(n.avg_surface)} <span className="text-[10px] text-gray-500 font-normal">m²</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">
                    Avg Price: {(n.avg_price / 1_000_000).toFixed(2)}M MAD
                  </span>
                  {onSelectNeighborhood && (
                    <button
                      onClick={() => onSelectNeighborhood(n.neighborhood)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      <span>Explore in 3D</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-dark-card border border-gray-800/80 rounded-xl overflow-hidden mt-8">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Complete District Comparison Table
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Click table headers to toggle sorting by administrative metrics.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-dark-surface/80 text-gray-400 border-b border-gray-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th 
                    className="p-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Neighborhood</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="p-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('listings')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Active Listings</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="p-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('m2')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Median Price/m²</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="p-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Median Price</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-4">Avg Surface</th>
                  <th className="p-4">Min Price</th>
                  <th className="p-4">Max Price</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {filteredNeighborhoods.map((n) => (
                  <tr key={n.neighborhood} className="hover:bg-dark-surface/40 transition-colors">
                    <td className="p-4 font-sans font-medium text-white flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      {n.neighborhood}
                    </td>
                    <td className="p-4 text-sky-400 font-semibold">{n.listing_count}</td>
                    <td className="p-4 font-semibold text-emerald-400">
                      {n.median_price_per_m2.toLocaleString()} MAD
                    </td>
                    <td className="p-4">{(n.median_price / 1_000_000).toFixed(2)}M MAD</td>
                    <td className="p-4">{Math.round(n.avg_surface)} m²</td>
                    <td className="p-4 text-gray-400">{(n.min_price / 1_000_000).toFixed(2)}M</td>
                    <td className="p-4 text-gray-400">{(n.max_price / 1_000_000).toFixed(2)}M</td>
                    <td className="p-4 text-right">
                      {onSelectNeighborhood && (
                        <button
                          onClick={() => onSelectNeighborhood(n.neighborhood)}
                          className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded text-[11px] font-sans font-medium transition-colors"
                        >
                          View 3D
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
