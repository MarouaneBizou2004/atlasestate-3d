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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '24px',
        width: '420px',
        maxWidth: '90vw',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>Export Filtered Market Data</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
          Export <strong>{filteredCount.toLocaleString()}</strong> active listings currently filtered in your view.
        </p>

        {/* Format Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {[
            { id: 'csv', label: 'CSV Spreadsheet', desc: 'Tabular format for Excel / Pandas', icon: FileSpreadsheet },
            { id: 'geojson', label: 'GeoJSON FeatureCollection', desc: 'Spatial vector format with coordinates', icon: Globe },
            { id: 'json', label: 'Raw JSON Array', desc: 'Structured JSON payload for APIs', icon: FileJson },
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
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? '#1e293b' : 'transparent',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                  cursor: 'pointer'
                }}
              >
                <Icon size={20} color={isSelected ? '#38bdf8' : '#94a3b8'} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#f8fafc' : '#cbd5e1' }}>
                    {fmt.label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{fmt.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
              cursor: 'pointer',
              fontSize: '12px'
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
              borderRadius: '6px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <Download size={14} /> Download File
          </button>
        </div>
      </div>
    </div>
  );
};
