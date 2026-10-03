import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapMode } from '../types';
import { Navigation, Compass, Layers, Maximize, RotateCcw } from 'lucide-react';

interface MapContainerProps {
  propertiesGeoJSON: any;
  neighborhoodsGeoJSON: any;
  poisGeoJSON: any;
  mapMode: MapMode;
  selectedPropertyId: string | null;
  onSelectProperty: (propertyId: string) => void;
  onSelectNeighborhood?: (neighborhoodId: string) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  propertiesGeoJSON,
  neighborhoodsGeoJSON,
  poisGeoJSON,
  mapMode,
  selectedPropertyId,
  onSelectProperty,
  onSelectNeighborhood,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [-8.0125, 31.6346], // Marrakech center (Gueliz)
      zoom: 12.8,
      pitch: 45, // 3D Tilt
      bearing: -15, // Slight angle
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', () => {
      // 1. Add 3D Buildings Source (Synthetic OSM procedural buildings)
      // Adds authentic height to urban core
      map.addSource('buildings-3d', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            // Gueliz Plaza & Avenue Mohammed V procedural blocks
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [-8.0140, 31.6360], [-8.0110, 31.6360], [-8.0110, 31.6330], [-8.0140, 31.6330], [-8.0140, 31.6360]
                ]]
              },
              properties: { height: 28, base_height: 0, color: '#1e293b' }
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [-8.0180, 31.6310], [-8.0150, 31.6310], [-8.0150, 31.6280], [-8.0180, 31.6280], [-8.0180, 31.6310]
                ]]
              },
              properties: { height: 22, base_height: 0, color: '#334155' }
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [-8.0080, 31.6240], [-8.0050, 31.6240], [-8.0050, 31.6210], [-8.0080, 31.6210], [-8.0080, 31.6240]
                ]]
              },
              properties: { height: 35, base_height: 0, color: '#1e293b' }
            }
          ]
        }
      });

      map.addLayer({
        id: '3d-buildings-layer',
        type: 'fill-extrusion',
        source: 'buildings-3d',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': 0.75
        }
      });

      // 2. Add Neighborhoods 3D Extrusion Source
      map.addSource('neighborhoods-data', {
        type: 'geojson',
        data: neighborhoodsGeoJSON || { type: 'FeatureCollection', features: [] },
      });

      // Neighborhood Polygons Border
      map.addLayer({
        id: 'neighborhoods-outline',
        type: 'line',
        source: 'neighborhoods-data',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 1.5,
          'line-opacity': 0.6,
        },
      });

      // Neighborhood 3D Extrusions Layer
      map.addLayer({
        id: 'neighborhoods-3d-extrusions',
        type: 'fill-extrusion',
        source: 'neighborhoods-data',
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['get', 'median_price_per_m2'],
            7000, '#0284c7',
            12000, '#0ea5e9',
            18000, '#eab308',
            25000, '#f97316',
            35000, '#ef4444'
          ],
          'fill-extrusion-height': ['get', 'extrusion_height_ppm2'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.35,
        },
      });

      // 3. Add Properties GeoJSON Source
      map.addSource('properties-data', {
        type: 'geojson',
        data: propertiesGeoJSON || { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Clusters Circles
      map.addLayer({
        id: 'clusters-layer',
        type: 'circle',
        source: 'properties-data',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#0284c7', 20,
            '#38bdf8', 50,
            '#f59e0b', 100,
            '#ef4444'
          ],
          'circle-radius': ['step', ['get', 'point_count'], 16, 20, 22, 50, 28, 100, 36],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#0f172a',
          'circle-opacity': 0.85
        }
      });

      // Cluster Count Labels
      map.addLayer({
        id: 'cluster-count-labels',
        type: 'symbol',
        source: 'properties-data',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Unclustered Property Points (Explorer Mode)
      map.addLayer({
        id: 'unclustered-points',
        type: 'circle',
        source: 'properties-data',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'price_per_m2'],
            7000, '#38bdf8',
            15000, '#10b981',
            22000, '#f59e0b',
            35000, '#ef4444'
          ],
          'circle-radius': 6.5,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      });

      // Value Gap Points (Mode 6)
      map.addLayer({
        id: 'value-gap-points',
        type: 'circle',
        source: 'properties-data',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'valuation_status'],
            'Below model estimate', '#22c55e',
            'Near model estimate', '#38bdf8',
            'Above model estimate', '#ef4444',
            '#94a3b8'
          ],
          'circle-radius': 7.5,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#0f172a',
          'circle-opacity': 0.95
        },
        layout: {
          visibility: 'none'
        }
      });

      // Continuous Heatmap Layer (Mode 2)
      map.addLayer({
        id: 'properties-heatmap',
        type: 'heatmap',
        source: 'properties-data',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'price_per_m2'], 7000, 0.2, 40000, 1],
          'heatmap-intensity': 1.2,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.2, '#0284c7',
            0.4, '#10b981',
            0.6, '#eab308',
            0.8, '#f97316',
            1, '#ef4444'
          ],
          'heatmap-radius': 25,
          'heatmap-opacity': 0.8
        },
        layout: {
          visibility: 'none'
        }
      });

      // 4. Property Marker Click Interaction
      map.on('click', 'unclustered-points', (e) => {
        if (!e.features || !e.features[0]) return;
        const feat = e.features[0];
        const propId = feat.properties.property_id;
        onSelectProperty(propId);
        
        map.flyTo({
          center: (feat.geometry as any).coordinates,
          zoom: 15.5,
          pitch: 55,
          speed: 1.2
        });
      });

      map.on('click', 'value-gap-points', (e) => {
        if (!e.features || !e.features[0]) return;
        const feat = e.features[0];
        const propId = feat.properties.property_id;
        onSelectProperty(propId);
        
        map.flyTo({
          center: (feat.geometry as any).coordinates,
          zoom: 15.5,
          pitch: 55,
          speed: 1.2
        });
      });

      // Cluster Click -> Zoom In
      map.on('click', 'clusters-layer', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters-layer'] });
        const clusterId = features[0].properties.cluster_id;
        (map.getSource('properties-data') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          map.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom + 0.5
          });
        });
      });

      // Cursor Pointers
      map.on('mouseenter', 'unclustered-points', () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', 'unclustered-points', () => (map.getCanvas().style.cursor = ''));
      map.on('mouseenter', 'clusters-layer', () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', 'clusters-layer', () => (map.getCanvas().style.cursor = ''));
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update Data Sources when Props Change
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (map.getSource('properties-data') && propertiesGeoJSON) {
      (map.getSource('properties-data') as any).setData(propertiesGeoJSON);
    }
    if (map.getSource('neighborhoods-data') && neighborhoodsGeoJSON) {
      (map.getSource('neighborhoods-data') as any).setData(neighborhoodsGeoJSON);
    }
  }, [propertiesGeoJSON, neighborhoodsGeoJSON]);

  // Handle Map Modes Visibility & Extrusions
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (!map.isStyleLoaded()) return;

    // Reset visibility
    const setVis = (layerId: string, visible: boolean) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    if (mapMode === 'explorer') {
      setVis('unclustered-points', true);
      setVis('clusters-layer', true);
      setVis('cluster-count-labels', true);
      setVis('value-gap-points', false);
      setVis('properties-heatmap', false);
      setVis('neighborhoods-3d-extrusions', false);
    } else if (mapMode === 'heatmap') {
      setVis('properties-heatmap', true);
      setVis('unclustered-points', false);
      setVis('clusters-layer', false);
      setVis('cluster-count-labels', false);
      setVis('value-gap-points', false);
      setVis('neighborhoods-3d-extrusions', false);
    } else if (mapMode === 'density') {
      setVis('clusters-layer', true);
      setVis('cluster-count-labels', true);
      setVis('unclustered-points', true);
      setVis('properties-heatmap', false);
      setVis('value-gap-points', false);
      setVis('neighborhoods-3d-extrusions', false);
    } else if (mapMode === 'neighborhood') {
      setVis('neighborhoods-3d-extrusions', true);
      setVis('unclustered-points', true);
      setVis('clusters-layer', false);
      setVis('cluster-count-labels', false);
      setVis('properties-heatmap', false);
      setVis('value-gap-points', false);
      map.setPaintProperty('neighborhoods-3d-extrusions', 'fill-extrusion-height', ['get', 'extrusion_height_ppm2']);
    } else if (mapMode === 'activity') {
      setVis('neighborhoods-3d-extrusions', true);
      setVis('unclustered-points', false);
      setVis('clusters-layer', false);
      setVis('cluster-count-labels', false);
      setVis('properties-heatmap', false);
      setVis('value-gap-points', false);
      map.setPaintProperty('neighborhoods-3d-extrusions', 'fill-extrusion-height', ['get', 'extrusion_height_density']);
    } else if (mapMode === 'value_gap') {
      setVis('value-gap-points', true);
      setVis('unclustered-points', false);
      setVis('clusters-layer', false);
      setVis('cluster-count-labels', false);
      setVis('properties-heatmap', false);
      setVis('neighborhoods-3d-extrusions', false);
    }
  }, [mapMode]);

  const handleResetCamera = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [-8.0125, 31.6346],
        zoom: 12.8,
        pitch: 45,
        bearing: -15,
        speed: 1.2
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Map Controls */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        zIndex: 10
      }}>
        <button
          onClick={handleResetCamera}
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            color: '#f8fafc',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
          }}
        >
          <RotateCcw size={14} color="#38bdf8" /> Reset 3D View
        </button>
      </div>

      {/* Active Mode Legend Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '10px 14px',
        zIndex: 10,
        fontSize: '11px',
        color: '#cbd5e1'
      }}>
        <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Mode: {mapMode.replace('_', ' ').toUpperCase()}
        </div>
        {mapMode === 'value_gap' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
              <span>Below Model Estimate (&lt; -7.5%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8' }}></span>
              <span>Near Model Estimate (Fair)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
              <span>Above Model Estimate (&gt; +7.5%)</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8' }}></span>
              <span>&lt; 10k MAD/m²</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span>10k - 18k MAD/m²</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
              <span>18k - 25k MAD/m²</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
              <span>&gt; 25k MAD/m²</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
