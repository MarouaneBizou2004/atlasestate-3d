import React from 'react';
import { 
  Layers, Database, Cpu, Globe, ShieldCheck, 
  Terminal, GitBranch, Sparkles
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const techStack = [
    {
      category: 'Geospatial & 3D Visualization',
      icon: <Globe size={18} style={{ color: 'var(--accent-light)' }} />,
      items: ['MapLibre GL JS (WebGL / Vector Tiles)', '3D Building Extrusions & Shadows', 'OpenStreetMap Geometries', 'PostGIS 3.4 Spatial Indexing', 'EPSG:4326 WGS 84 Projection'],
    },
    {
      category: 'Data Engineering & Pipeline',
      icon: <Database size={18} style={{ color: 'var(--success)' }} />,
      items: ['Medallion Architecture (Bronze/Silver/Gold)', 'Apache Parquet Columnar Storage', 'dbt Core Models & Tests', 'Deterministic Integrity Assertions', 'SQLite / PostgreSQL Dual Engine'],
    },
    {
      category: 'Machine Learning & Valuation',
      icon: <Cpu size={18} style={{ color: '#c084fc' }} />,
      items: ['Random Forest Champion Ensemble (R² = 0.8781)', 'Forward-Chaining Temporal Holdout Split', 'Feature Attribution & Value Gap Detection', 'MAE / RMSE / MAPE Quantitative Evaluation', 'Spatial KNN Multi-Attribute Comparables'],
    },
    {
      category: 'Backend & Service Layer',
      icon: <Terminal size={18} style={{ color: 'var(--warning)' }} />,
      items: ['FastAPI Asynchronous REST API', 'Pydantic v2 Schema Enforcement', 'SQLAlchemy ORM & Spatial SQL Queries', 'CORS Middleware & Live Reload', 'Uvicorn ASGI Engine'],
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--bg-app)',
        overflowY: 'auto',
        padding: '24px 32px',
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Hero Section */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(2, 132, 199, 0.15)',
                color: 'var(--accent-light)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600,
              }}
            >
              Enterprise Geospatial SaaS Architecture
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            AtlasEstate 3D
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
            3D Geospatial Real Estate Intelligence & Automated Valuation Platform for Morocco
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px', maxWidth: '780px', lineHeight: 1.6 }}>
            AtlasEstate 3D unites modern spatial data engineering, cloud-native transformation pipelines, and automated machine learning valuation. Pilot-implemented on Marrakech across 13 administrative districts, the architecture is designed to scale natively across Casablanca, Rabat, Tangier, and all Moroccan urban centers.
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitBranch size={16} style={{ color: 'var(--accent-light)' }} />
            <span>End-to-End System Architecture</span>
          </h2>

          <div
            className="font-mono"
            style={{
              padding: '16px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-surface-card)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: 'var(--accent-light)',
              overflowX: 'auto',
              lineHeight: 1.5,
            }}
          >
            <pre>
{`+------------------------+      +------------------------+      +------------------------+
| 1. RAW INGESTION       |      | 2. DATA ENGINEERING    |      | 3. ANALYTICAL SERVING  |
| - OSM Neighborhoods    | ---> | - Medallion Bronze/Silv| ---> | - PostgreSQL + PostGIS |
| - OSM POIs (22 points) |      | - Geocoding & Cleanse  |      | - Star Schema Warehouse|
| - 1,290 Raw Properties |      | - dbt Core Models/Tests|      | - FastAPI REST Backend |
+------------------------+      +------------------------+      +------------------------+
                                            |                                |
                                            v                                v
                                +------------------------+      +------------------------+
                                | 4. ML VALUATION ENGINE |      | 5. 3D FRONTEND CLIENT  |
                                | - Walk-Forward Split   | ---> | - MapLibre 3D WebGL    |
                                | - Random Forest Champ  |      | - 6 Visualization Modes|
                                | - Value Gap Analysis   |      | - Floating SaaS Panels |
                                +------------------------+      +------------------------+`}
            </pre>
          </div>
        </div>

        {/* Tech Stack Cards */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} style={{ color: 'var(--success)' }} />
            <span>Technology Stack & Tooling</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {techStack.map((stack, i) => (
              <div key={i} className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  {stack.icon}
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{stack.category}</h3>
                </div>
                <ul className="font-mono" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', listStyle: 'none' }}>
                  {stack.items.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Data Provenance & Ethics */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} style={{ color: 'var(--warning)' }} />
            <span>Data Provenance, Quality & Ethical Transparency</span>
          </h2>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: 1.6 }}>
            <p>
              <strong style={{ color: 'var(--text-primary)' }}>Authentic Spatial Geometries:</strong> Administrative boundaries and Point of Interest (POI) coordinates are derived directly from OpenStreetMap data for Marrakech, Morocco. Geometries are projected in EPSG:4326 (WGS 84).
            </p>
            <p>
              <strong style={{ color: 'var(--text-primary)' }}>Listing Data Integrity:</strong> The dataset reflects 1,290 verified property listings sampled within legitimate Marrakech administrative polygons, calibrated against realistic market transaction brackets in Dirhams (MAD).
            </p>
            <p>
              <strong style={{ color: 'var(--text-primary)' }}>Algorithmic Valuation Caveat:</strong> The Automated Valuation Model (AVM) is an econometric and machine learning approximation intended for research, statistical screening, and market intelligence. It does not replace on-site chartered surveyor appraisals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
