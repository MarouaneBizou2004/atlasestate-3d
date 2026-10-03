import React from 'react';
import { Compass, BarChart3, Building2, Calculator, ShieldCheck, Info, Download, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalCount: number;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, totalCount, onOpenExport }) => {
  const navItems = [
    { id: 'explore', label: '3D Explorer', icon: Compass },
    { id: 'market', label: 'Market Analytics', icon: BarChart3 },
    { id: 'neighborhoods', label: 'Neighborhoods', icon: Building2 },
    { id: 'valuation', label: 'ML Valuation', icon: Calculator },
    { id: 'quality', label: 'Data Quality', icon: ShieldCheck },
    { id: 'about', label: 'Architecture', icon: Info },
  ];

  return (
    <header style={{
      height: '60px',
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 50,
      position: 'relative'
    }}>
      {/* Brand & City Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)'
        }}>
          <Layers size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.3px', color: '#f8fafc' }}>
              AtlasEstate <span style={{ color: '#38bdf8' }}>3D</span>
            </span>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #334155',
              fontWeight: 600
            }}>
              Marrakech, MA
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Geospatial Real Estate Intelligence</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#38bdf8' : '#94a3b8',
                backgroundColor: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Live Badge & Export Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          padding: '6px 12px',
          borderRadius: '6px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          fontSize: '12px',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
          <span>{totalCount.toLocaleString()} Verified Listings</span>
        </div>

        <button
          onClick={onOpenExport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '6px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s'
          }}
        >
          <Download size={14} />
          Export
        </button>
      </div>
    </header>
  );
};
