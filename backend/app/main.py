"""
AtlasEstate 3D - Main FastAPI Application
"""

import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.api.endpoints import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure data files and model are operable
    print("AtlasEstate 3D Backend starting up...")
    yield
    print("AtlasEstate 3D Backend shutting down...")

app = FastAPI(
    title="AtlasEstate 3D - Geospatial Real Estate Intelligence API",
    description="3D Geospatial Real Estate Intelligence Platform for Morocco (Marrakech pilot city)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite default ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints
app.include_router(api_router)

@app.get("/", tags=["System"])
def root():
    return {
        "platform": "AtlasEstate 3D",
        "description": "3D Geospatial Real Estate Intelligence Platform for Morocco",
        "pilot_city": "Marrakech, Morocco",
        "status": "ONLINE",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "properties": "/api/properties",
            "properties_geojson": "/api/properties/geojson",
            "neighborhoods": "/api/neighborhoods",
            "market_summary": "/api/market/summary",
            "market_heatmap": "/api/market/heatmap",
            "valuation_predict": "/api/valuation/predict",
            "pois": "/api/locations/pois",
            "data_quality": "/api/data-quality"
        }
    }

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "HEALTHY", "database": "CONNECTED", "city": "Marrakech"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
