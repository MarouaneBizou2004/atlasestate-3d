import React from 'react';
import { 
  Layers, Database, Cpu, Globe, ShieldCheck, 
  Terminal, GitBranch, Compass, Sparkles, BookOpen 
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const techStack = [
    {
      category: 'Geospatial & 3D Visualization',
      icon: <Globe className="w-5 h-5 text-sky-400" />,
      items: ['MapLibre GL JS', 'Deck.gl GeoJsonLayer', 'OpenStreetMap Geometries', 'PostGIS 3.4 Spatial Indexing', 'EPSG:4326 Projection']
    },
    {
      category: 'Data Engineering & Pipeline',
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      items: ['Medallion Architecture (Bronze/Silver/Gold)', 'Apache Parquet Columnar Storage', 'dbt Core Models & Tests', 'Apache Airflow DAG Orchestration', 'SQLite / PostgreSQL Dual Engine']
    },
    {
      category: 'Machine Learning & Valuation',
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      items: ['Random Forest Champion Ensemble', 'Forward-Chaining Temporal Split', 'SHAP-Style Feature Attribution', 'MAE / RMSE / MAPE / R² Evaluation', 'KNN Multi-Attribute Spatial Comparables']
    },
    {
      category: 'Backend & Service Layer',
      icon: <Terminal className="w-5 h-5 text-amber-400" />,
      items: ['FastAPI REST API', 'Pydantic v2 Schema Validation', 'SQLAlchemy ORM & Raw SQL', 'CORS Middleware', 'Uvicorn ASGI Engine']
    },
  ];

  return (
    <div className="flex-1 bg-dark-bg overflow-y-auto px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <div className="border-b border-gray-800 pb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Portfolio Project • Senior Data & Geospatial Engineering
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            AtlasEstate 3D
          </h1>
          <p className="text-lg text-gray-300 font-medium mt-1">
            3D Geospatial Real Estate Intelligence & Automated Valuation Platform for Morocco
          </p>
          <p className="text-sm text-gray-400 mt-3 max-w-3xl leading-relaxed">
            AtlasEstate 3D bridges modern spatial data engineering, cloud-native transformation pipelines, and automated machine learning valuation. Pilot-implemented on Marrakech across 13 administrative districts, the architecture is designed to scale natively across Casablanca, Rabat, Tangier, and all Moroccan urban centers.
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="bg-dark-card border border-gray-800/80 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-sky-400" />
            End-to-End System Architecture
          </h2>

          <div className="p-4 bg-dark-surface rounded-xl border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto leading-relaxed">
            <pre className="text-sky-300">
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
                                | - Walk-Forward Split   | ---> | - MapLibre 3D Pitch/Rot|
                                | - Random Forest Champ  |      | - 6 Visualization Modes|
                                | - SHAP Attribution     |      | - Property Explorer/AVM|
                                +------------------------+      +------------------------+`}
            </pre>
          </div>
        </div>

        {/* Tech Stack Cards */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Technology Stack & Tooling
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {techStack.map((stack, i) => (
              <div key={i} className="bg-dark-card border border-gray-800/80 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  {stack.icon}
                  <h3 className="font-semibold text-white text-sm">{stack.category}</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-400 font-mono">
                  {stack.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Data Provenance & Ethics */}
        <div className="bg-dark-card border border-gray-800/80 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Data Provenance, Quality & Ethical Disclaimers
          </h2>

          <div className="text-xs text-gray-400 space-y-3 leading-relaxed">
            <p>
              <strong className="text-white">Authentic Spatial Geometries:</strong> Administrative boundaries and Point of Interest (POI) coordinates are derived directly from OpenStreetMap data for Marrakech, Morocco. Geometries are projected in EPSG:4326 (WGS 84).
            </p>
            <p>
              <strong className="text-white">Listing Data Integrity:</strong> The dataset reflects 1,290 verified property listings sampled within legitimate Marrakech administrative polygons, calibrated against realistic market transaction brackets in Dirhams (MAD).
            </p>
            <p>
              <strong className="text-white">Algorithmic Valuation Caveat:</strong> The Automated Valuation Model (AVM) is an econometric and machine learning approximation intended for research, statistical screening, and market intelligence. It does not replace on-site chartered surveyor appraisals.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
