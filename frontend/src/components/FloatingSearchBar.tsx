import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, MapPin, Landmark, Home, ArrowRight } from 'lucide-react';

interface SearchItem {
  id: string;
  type: 'district' | 'landmark' | 'property';
  title: string;
  subtitle: string;
  coords?: [number, number]; // [lng, lat]
  propertyId?: string;
}

interface FloatingSearchBarProps {
  onSelectProperty?: (propertyId: string) => void;
  onFlyToLocation?: (coords: [number, number], zoom: number) => void;
  allProperties?: any[];
  onFilterNeighborhood?: (name: string) => void;
}

const NOTABLE_LANDMARKS: { name: string; type: string; coords: [number, number] }[] = [
  { name: 'Koutoubia Mosque & Minaret', type: 'Monument', coords: [-7.9935, 31.6238] },
  { name: 'Menara Pavilion & Gardens', type: 'Heritage', coords: [-8.0210, 31.6130] },
  { name: 'Carré Eden Shopping Mall', type: 'Commercial Center', coords: [-8.0130, 31.6360] },
  { name: 'Marrakech Railway Station (Gare)', type: 'Transport Hub', coords: [-8.0180, 31.6300] },
  { name: 'Jardin Majorelle', type: 'Cultural Site', coords: [-8.0028, 31.6416] },
  { name: 'Palais de la Bahia', type: 'Historical Palace', coords: [-7.9820, 31.6217] },
];

const DISTRICTS: { name: string; coords: [number, number]; zoom: number }[] = [
  { name: 'Gueliz', coords: [-8.0125, 31.6346], zoom: 14.5 },
  { name: 'Hivernage', coords: [-8.0160, 31.6210], zoom: 14.5 },
  { name: 'Medina', coords: [-7.9890, 31.6270], zoom: 14.2 },
  { name: 'Palmeraie', coords: [-7.9600, 31.6700], zoom: 13.0 },
  { name: 'Agdal', coords: [-7.9875, 31.6000], zoom: 14.0 },
  { name: 'Targa', coords: [-8.0550, 31.6500], zoom: 14.0 },
  { name: 'Menara', coords: [-8.0250, 31.6150], zoom: 14.2 },
  { name: 'Semlalia', coords: [-8.0200, 31.6450], zoom: 14.5 },
  { name: 'Massira', coords: [-8.0500, 31.6300], zoom: 14.0 },
  { name: 'Daoudiate', coords: [-7.9950, 31.6550], zoom: 14.2 },
  { name: 'Mhamid', coords: [-8.0400, 31.5950], zoom: 13.8 },
  { name: 'Ennakhil', coords: [-7.9500, 31.6400], zoom: 13.5 },
  { name: 'Sidi Youssef Ben Ali', coords: [-7.9700, 31.6050], zoom: 14.0 },
];

export const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
  onSelectProperty,
  onFlyToLocation,
  allProperties = [],
  onFilterNeighborhood,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global hotkey '/' or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter matching suggestions
  const filteredResults = useMemo<SearchItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default top suggestions
      return [
        { id: 'dist-gueliz', type: 'district', title: 'Gueliz', subtitle: 'Central Business & Modern District', coords: [-8.0125, 31.6346] },
        { id: 'dist-hivernage', type: 'district', title: 'Hivernage', subtitle: 'Luxury Hotels & Prime Residential', coords: [-8.0160, 31.6210] },
        { id: 'dist-palmeraie', type: 'district', title: 'Palmeraie', subtitle: 'Exclusive Luxury Estates & Resorts', coords: [-7.9600, 31.6700] },
        { id: 'lm-koutoubia', type: 'landmark', title: 'Koutoubia Mosque', subtitle: 'Iconic 3D Minaret Landmark', coords: [-7.9935, 31.6238] },
      ];
    }

    const items: SearchItem[] = [];

    // 1. Match Districts
    for (const dist of DISTRICTS) {
      if (dist.name.toLowerCase().includes(q)) {
        items.push({
          id: `dist-${dist.name}`,
          type: 'district',
          title: dist.name,
          subtitle: `District • ${dist.name}, Marrakech`,
          coords: dist.coords,
        });
      }
    }

    // 2. Match Landmarks
    for (const lm of NOTABLE_LANDMARKS) {
      if (lm.name.toLowerCase().includes(q) || lm.type.toLowerCase().includes(q)) {
        items.push({
          id: `lm-${lm.name}`,
          type: 'landmark',
          title: lm.name,
          subtitle: `3D Landmark • ${lm.type}`,
          coords: lm.coords,
        });
      }
    }

    // 3. Match Properties (by ID, title, or address)
    if (allProperties && allProperties.length > 0) {
      let count = 0;
      for (const p of allProperties) {
        if (count >= 5) break;
        const pId = (p.property_id || '').toLowerCase();
        const pTitle = (p.title || '').toLowerCase();
        const pNeigh = (p.neighborhood || '').toLowerCase();
        const pAddr = (p.street_address || '').toLowerCase();
        if (pId.includes(q) || pTitle.includes(q) || pNeigh.includes(q) || pAddr.includes(q)) {
          items.push({
            id: `prop-${p.property_id}`,
            type: 'property',
            title: p.title || `${p.property_type || 'Listing'} in ${p.neighborhood || 'Marrakech'}`,
            subtitle: `${p.street_address || p.neighborhood || 'Marrakech'} • ${(p.price || p.price_mad || 0).toLocaleString()} MAD • ${p.surface_m2 || '-'} m²`,
            propertyId: p.property_id,
            coords: p.latitude && p.longitude ? [p.longitude, p.latitude] : undefined,
          });
          count++;
        }
      }
    }

    return items;
  }, [query, allProperties]);

  const handleSelect = (item: SearchItem) => {
    if (item.type === 'district') {
      if (onFilterNeighborhood) {
        onFilterNeighborhood(item.title);
      }
      if (item.coords && onFlyToLocation) {
        onFlyToLocation(item.coords, 14.5);
      }
    } else if (item.type === 'landmark') {
      if (item.coords && onFlyToLocation) {
        onFlyToLocation(item.coords, 16.5);
      }
    } else if (item.type === 'property' && item.propertyId) {
      if (onSelectProperty) {
        onSelectProperty(item.propertyId);
      }
      if (item.coords && onFlyToLocation) {
        onFlyToLocation(item.coords, 16.5);
      }
    }
    inputRef.current?.blur();
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '16px',
        left: '20px',
        width: '340px',
        zIndex: 30,
      }}
    >
      {/* Search Input Bar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-md)',
          border: isOpen ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
          transition: 'border-color 0.2s ease',
        }}
      >
        <Search size={16} style={{ color: 'var(--accent-light)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search districts, 3D landmarks, ID..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            width: '100%',
            fontWeight: 500,
          }}
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px',
            }}
          >
            <X size={14} />
          </button>
        ) : (
          <kbd
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-surface-hover)',
              padding: '2px 5px',
              borderRadius: '4px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            /
          </kbd>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && filteredResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="glass-panel-elevated"
          style={{
            marginTop: '6px',
            borderRadius: '10px',
            overflow: 'hidden',
            maxHeight: '340px',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-default)',
          }}
        >
          <div
            style={{
              padding: '6px 12px',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-hover)',
            }}
          >
            {query ? 'Results' : 'Quick Suggestions'}
          </div>

          <div style={{ padding: '4px' }}>
            {filteredResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-testid="search-result-item"
                  data-item-type={item.type}
                  data-item-id={item.id}
                  data-property-id={item.propertyId || ''}
                  onClick={() => handleSelect(item)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                    border: isSelected ? '1px solid var(--border-subtle)' : '1px solid transparent',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                          item.type === 'district'
                            ? 'rgba(2, 132, 199, 0.15)'
                            : item.type === 'landmark'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(16, 185, 129, 0.15)',
                        color:
                          item.type === 'district'
                            ? 'var(--accent-light)'
                            : item.type === 'landmark'
                            ? 'var(--warning)'
                            : 'var(--success)',
                        flexShrink: 0,
                      }}
                    >
                      {item.type === 'district' && <MapPin size={14} />}
                      {item.type === 'landmark' && <Landmark size={14} />}
                      {item.type === 'property' && <Home size={14} />}
                    </div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={13} style={{ color: 'var(--text-muted)', opacity: isSelected ? 1 : 0.4 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
