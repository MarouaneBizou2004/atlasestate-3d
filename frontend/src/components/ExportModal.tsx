import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Globe, FileJson } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredCount?: number;
  filters?: any;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, filteredCount = 1290 }) => {
  const [format, setFormat] = useState<'csv' | 'geojson' | 'json'>('csv');

  if (!isOpen) return null;

  const handleDownload = () => {
    window.open(`/api/export?format=${format}`, '_blank');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel-elevated"
        style={{
          borderRadius: '14px',
          padding: '24px',
          width: '420px',
          maxWidth: '92vw',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-default)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Export Filtered Spatial Data
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
          Export <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{filteredCount.toLocaleString()}</strong> active listings filtered in your spatial viewport.
        </p>

        {/* Format Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
          {[
            { id: 'csv', label: 'CSV Spreadsheet', desc: 'Tabular format for Excel / Pandas analytics', icon: FileSpreadsheet },
            { id: 'geojson', label: 'GeoJSON FeatureCollection', desc: 'Spatial vector format with EPSG:4326 coords', icon: Globe },
            { id: 'json', label: 'Raw JSON Array', desc: 'Structured JSON payload for API integration', icon: FileJson },
          ].map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = format === fmt.id;
            return (
              <div
                key={fmt.id}
                onClick={() => setFormat(fmt.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                <Icon size={18} style={{ color: isSelected ? 'var(--accent-light)' : 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {fmt.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {fmt.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Download size={13} />
            <span>Download Dataset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
