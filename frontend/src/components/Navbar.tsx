import React from 'react';
import { 
  Compass, 
  BarChart3, 
  Building2, 
  Calculator, 
  ShieldCheck, 
  Layers, 
  Download, 
  Sun, 
  Moon, 
  Bookmark,
  Search,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalCount: number;
  onOpenExport: () => void;
  favoritesCount?: number;
  onOpenFavorites?: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalCount,
  onOpenExport,
  favoritesCount = 0,
  onOpenFavorites,
  onOpenSearch,
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'explore', label: '3D Explorer', icon: Compass },
    { id: 'market', label: 'Market Analytics', icon: BarChart3 },
    { id: 'neighborhoods', label: 'Neighborhoods', icon: Building2 },
    { id: 'valuation', label: 'ML Valuation', icon: Calculator },
    { id: 'quality', label: 'Data Quality', icon: ShieldCheck },
    { id: 'about', label: 'Architecture', icon: Layers },
  ];

  return (
    <header
      className="glass-panel"
      style={{
        height: '56px',
        margin: '8px 12px 0 12px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '12px',
        zIndex: 50,
        position: 'relative',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Brand & City Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 16px rgba(2, 132, 199, 0.45)',
          }}
        >
          <Sparkles size={18} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '-0.3px',
                color: 'var(--text-primary)',
              }}
            >
              ATLAS<span style={{ color: 'var(--accent-light)' }}>ESTATE</span> 3D
            </span>
            <span
              className="glass-pill"
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                color: 'var(--accent-light)',
                border: '1px solid var(--border-default)',
                fontWeight: 600,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              Marrakech
            </span>
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              letterSpacing: '0.2px',
              fontWeight: 500,
            }}
          >
            3D REAL ESTATE INTELLIGENCE PLATFORM
          </div>
        </div>
      </div>

      {/* Navigation Segment Tabs */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'var(--bg-surface-hover)',
          padding: '3px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 12px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon
                size={14}
                style={{
                  color: isActive ? 'var(--accent-light)' : 'var(--text-muted)',
                }}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Inventory, Search, Favorites, Theme, Export */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Verified Inventory Indicator */}
        <div
          className="glass-pill"
          style={{
            padding: '5px 10px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--success)',
              display: 'inline-block',
              boxShadow: '0 0 8px var(--success-glow)',
            }}
          />
          <span className="font-mono">{totalCount.toLocaleString()}</span>
          <span style={{ color: 'var(--text-muted)' }}>Listings</span>
        </div>

        {/* Quick Search Shortcut Trigger (if provided) */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="glass-pill"
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
            }}
            title="Search districts, landmarks, properties (Ctrl+K)"
          >
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Quick Search</span>
            <kbd
              style={{
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px',
                padding: '1px 4px',
                fontSize: '9px',
                fontFamily: 'monospace',
                color: 'var(--text-muted)',
              }}
            >
              /
            </kbd>
          </button>
        )}

        {/* Favorites Counter Button */}
        {onOpenFavorites && (
          <button
            onClick={onOpenFavorites}
            className="glass-pill"
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              color: favoritesCount > 0 ? 'var(--accent-light)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: favoritesCount > 0 ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              background: 'transparent',
            }}
            title="Saved Favorites"
          >
            <Bookmark size={13} fill={favoritesCount > 0 ? 'currentColor' : 'none'} />
            <span className="font-mono">{favoritesCount}</span>
          </button>
        )}

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="glass-pill"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            border: '1px solid var(--border-subtle)',
            background: 'transparent',
            transition: 'color 0.15s ease',
          }}
          title={theme === 'dark' ? 'Switch to Light GIS Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Export Data Button */}
        <button
          onClick={onOpenExport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--accent)',
            color: '#ffffff',
            border: 'none',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
        >
          <Download size={13} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
