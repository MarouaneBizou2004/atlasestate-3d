import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapMode } from '../types';
import { RotateCcw, Layers, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface MapContainerProps {
  propertiesGeoJSON: any;
  neighborhoodsGeoJSON: any;
  poisGeoJSON: any;
  mapMode: MapMode;
  selectedPropertyId: string | null;
  onSelectProperty: (propertyId: string) => void;
  onSelectNeighborhood?: (neighborhoodId: string) => void;
}

const MAP_STYLES = {
  dark: 'https://tiles.openfreemap.org/styles/dark',
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  bright: 'https://tiles.openfreemap.org/styles/bright',
};

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
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [activeStyle, setActiveStyle] = useState<'dark' | 'liberty' | 'bright'>('dark');
  const [styleLoaded, setStyleLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[activeStyle],
      center: [-8.0125, 31.6346], // Marrakech center (Gueliz)
      zoom: 12.8,
      pitch: 45, // 3D Camera Tilt
      bearing: -15,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
    });

    map.on('style.load', () => {
      setupLayers(map);
      setStyleLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Handle Style Switcher
  const handleStyleChange = (styleKey: 'dark' | 'liberty' | 'bright') => {
    if (!mapRef.current || styleKey === activeStyle) return;
    setActiveStyle(styleKey);
    setStyleLoaded(false);
    mapRef.current.setStyle(MAP_STYLES[styleKey]);
  };

  // Configure All Spatial Layers
  const setupLayers = (map: maplibregl.Map) => {
    // -------------------------------------------------------------------------
    // 1. 3D Buildings Layer from Vector Tiles (OpenMapTiles source)
    // -------------------------------------------------------------------------
    if (map.getSource('openmaptiles') && !map.getLayer('3d-buildings')) {
      // Find label layer to place buildings below text labels
      const layers = map.getStyle().layers || [];
      let labelLayerId: string | undefined;
      for (const layer of layers) {
        if (layer.type === 'symbol' && layer.layout && (layer.layout as any)['text-field']) {
          labelLayerId = layer.id;
          break;
        }
      }

      try {
        map.addLayer(
          {
            id: '3d-buildings',
            source: 'openmaptiles',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 13.5,
            paint: {
              'fill-extrusion-color': activeStyle === 'dark' ? '#1e293b' : '#cbd5e1',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13.5,
                0,
                15.5,
                ['coalesce', ['get', 'render_height'], ['get', 'height'], 14]
              ],
              'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
              'fill-extrusion-opacity': 0.65,
            },
          },
          labelLayerId
        );
      } catch (err) {
        console.warn('Vector 3D buildings not supported on this style:', err);
      }
    }

    // -------------------------------------------------------------------------
    // 2. Neighborhoods GeoJSON Source & Layers
    // -------------------------------------------------------------------------
    if (!map.getSource('neighborhoods-data')) {
      map.addSource('neighborhoods-data', {
        type: 'geojson',
        data: neighborhoodsGeoJSON || { type: 'FeatureCollection', features: [] },
      });
    }

    // A. Subtle Neighborhood Boundaries Outline
    if (!map.getLayer('neighborhoods-outline')) {
      map.addLayer({
        id: 'neighborhoods-outline',
        type: 'line',
        source: 'neighborhoods-data',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 1.5,
          'line-opacity': 0.5,
          'line-dasharray': [2, 1],
        },
      });
    }

    // B. Neighborhood District Label Text
    if (!map.getLayer('neighborhoods-labels')) {
      map.addLayer({
        id: 'neighborhoods-labels',
        type: 'symbol',
        source: 'neighborhoods-data',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.1,
          'text-anchor': 'center',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#94a3b8',
          'text-halo-color': '#0f172a',
          'text-halo-width': 1.5,
        },
      });
    }

    // C. Neighborhood 3D Extrusions (HIDDEN by default, visible only in Mode 4 & 5)
    if (!map.getLayer('neighborhoods-3d-extrusions')) {
      map.addLayer({
        id: 'neighborhoods-3d-extrusions',
        type: 'fill-extrusion',
        source: 'neighborhoods-data',
        layout: {
          visibility: 'none', // Strictly hidden on startup!
        },
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'median_price_per_m2'], ['get', 'median_price_m2'], 15000],
            7000, '#0284c7',
            12000, '#0ea5e9',
            18000, '#eab308',
            24000, '#f97316',
            32000, '#ef4444'
          ],
          'fill-extrusion-height': [
            'coalesce',
            ['get', 'extrusion_height_ppm2'],
            ['*', ['coalesce', ['get', 'median_price_per_m2'], 15000], 0.015]
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.65,
        },
      });
    }

    // -------------------------------------------------------------------------
    // 3. Properties GeoJSON Source & Layers
    // -------------------------------------------------------------------------
    if (!map.getSource('properties-data')) {
      map.addSource('properties-data', {
        type: 'geojson',
        data: propertiesGeoJSON || { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 40,
      });
    }

    // A. Clusters Circles (Modern dark badge with colored ring)
    if (!map.getLayer('clusters-layer')) {
      map.addLayer({
        id: 'clusters-layer',
        type: 'circle',
        source: 'properties-data',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#0f172a',
          'circle-radius': ['step', ['get', 'point_count'], 14, 25, 18, 75, 23, 150, 28],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': [
            'step',
            ['get', 'point_count'],
            '#38bdf8', 25,
            '#10b981', 75,
            '#f59e0b', 150,
            '#ef4444'
          ],
          'circle-opacity': 0.9,
        },
      });
    }

    // B. Cluster Count Numbers
    if (!map.getLayer('cluster-count-labels')) {
      map.addLayer({
        id: 'cluster-count-labels',
        type: 'symbol',
        source: 'properties-data',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 11,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        },
        paint: {
          'text-color': '#f8fafc',
        },
      });
    }

    // C. Individual Property Pins (Unclustered Explorer Mode)
    if (!map.getLayer('unclustered-points')) {
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
            14000, '#10b981',
            22000, '#f59e0b',
            32000, '#ef4444'
          ],
          'circle-radius': 5.5,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#0f172a',
          'circle-opacity': 0.95,
        },
      });
    }

    // D. Value Gap Points (Mode 6)
    if (!map.getLayer('value-gap-points')) {
      map.addLayer({
        id: 'value-gap-points',
        type: 'circle',
        source: 'properties-data',
        filter: ['!', ['has', 'point_count']],
        layout: {
          visibility: 'none',
        },
        paint: {
          'circle-color': [
            'match',
            ['get', 'valuation_status'],
            'Below model estimate', '#22c55e',
            'Near model estimate', '#38bdf8',
            'Above model estimate', '#ef4444',
            '#94a3b8'
          ],
          'circle-radius': 6.5,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95,
        },
      });
    }

    // E. Continuous Heatmap Layer (Mode 2)
    if (!map.getLayer('properties-heatmap')) {
      map.addLayer({
        id: 'properties-heatmap',
        type: 'heatmap',
        source: 'properties-data',
        layout: {
          visibility: 'none',
        },
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'price_per_m2'], 7000, 0.2, 35000, 1],
          'heatmap-intensity': 1.3,
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
          'heatmap-radius': 24,
          'heatmap-opacity': 0.8,
        },
      });
    }

    // -------------------------------------------------------------------------
    // 4. Interactive Event Handlers
    // -------------------------------------------------------------------------
    // Property Pin Click
    const handlePropClick = (e: any) => {
      if (!e.features || !e.features[0]) return;
      const feat = e.features[0];
      const propId = feat.properties.property_id;
      onSelectProperty(propId);

      map.flyTo({
        center: (feat.geometry as any).coordinates,
        zoom: 15.5,
        pitch: 55,
        speed: 1.2,
      });
    };

    map.on('click', 'unclustered-points', handlePropClick);
    map.on('click', 'value-gap-points', handlePropClick);

    // Cluster Click -> Zoom In
    map.on('click', 'clusters-layer', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters-layer'] });
      if (!features[0]) return;
      const clusterId = features[0].properties.cluster_id;
      (map.getSource('properties-data') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;
        map.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom + 0.8,
        });
      });
    });

    // Hover Tooltip on Property Pin
    map.on('mouseenter', 'unclustered-points', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      if (!e.features || !e.features[0] || !popupRef.current) return;
      const f = e.features[0];
      const coords = (f.geometry as any).coordinates.slice();
      const p = f.properties;

      const html = `
        <div style="font-family: sans-serif; padding: 6px; font-size: 11px; color: #f8fafc; background: #0f172a; border-radius: 6px; min-width: 140px;">
          <div style="font-weight: 700; color: #38bdf8; margin-bottom: 2px;">${p.property_type ? p.property_type.toUpperCase() : 'PROPERTY'}</div>
          <div style="font-size: 13px; font-weight: 700;">${(p.price || 0).toLocaleString()} MAD</div>
          <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">
            ${p.surface_m2 || p.surface || 0} m² • ${Math.round(p.price_per_m2 || 0).toLocaleString()} MAD/m²
          </div>
          <div style="color: #64748b; font-size: 10px; margin-top: 2px;">${p.neighborhood || ''}</div>
        </div>
      `;

      popupRef.current.setLngLat(coords).setHTML(html).addTo(map);
    });

    map.on('mouseleave', 'unclustered-points', () => {
      map.getCanvas().style.cursor = '';
      if (popupRef.current) popupRef.current.remove();
    });

    map.on('mouseenter', 'clusters-layer', () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', 'clusters-layer', () => (map.getCanvas().style.cursor = ''));

    // Hover Tooltip on 3D Neighborhood Extrusions
    map.on('mouseenter', 'neighborhoods-3d-extrusions', (e) => {
      if (mapMode !== 'neighborhood' && mapMode !== 'activity') return;
      map.getCanvas().style.cursor = 'pointer';
      if (!e.features || !e.features[0] || !popupRef.current) return;
      const f = e.features[0];
      const p = f.properties;

      const html = `
        <div style="font-family: sans-serif; padding: 8px; font-size: 11px; color: #f8fafc; background: #0f172a; border-radius: 6px; min-width: 160px;">
          <div style="font-weight: 700; color: #38bdf8; font-size: 13px;">${p.name}</div>
          <div style="color: #cbd5e1; margin-top: 4px;">Median Price/m²: <strong style="color: #10b981;">${(p.median_price_per_m2 || p.median_price_m2 || 0).toLocaleString()} MAD</strong></div>
          <div style="color: #cbd5e1; margin-top: 2px;">Active Listings: <strong style="color: #38bdf8;">${p.active_listings_count || 0} units</strong></div>
        </div>
      `;

      popupRef.current.setLngLat(e.lngLat).setHTML(html).addTo(map);
    });

    map.on('mouseleave', 'neighborhoods-3d-extrusions', () => {
      map.getCanvas().style.cursor = '';
      if (popupRef.current) popupRef.current.remove();
    });

    // Apply active map mode immediately
    applyMapMode(map, mapMode);
  };

  // Switch Map Mode Visibility
  const applyMapMode = (map: maplibregl.Map, mode: MapMode) => {
    const setVis = (layerId: string, visible: boolean) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    if (mode === 'explorer') {
      setVis('unclustered-points', true);
      setVis('clusters-layer', true);
      setVis('cluster-count-labels', true);
      setVis('value-gap-points', false);
      setVis('properties-heatmap', false);
      setVis('neighborhoods-3d-extrusions', false);
      setVis('neighborhoods-outline', true);
      setVis('neighborhoods-labels', true);
    } else if (mode === 'heatmap') {
      setVis('properties-heatmap', true);
      setVis('unclustered-points', false);
      setVis('clusters-layer', false);
      setVis('cluster-count-labels', false);
      setVis('value-gap-points', false);
      setVis('neighborhoods-3d-extrusions', false);
      setVis('neighborhoods-outline', true);
      setVis('neighborhoods-labels', true);
    } else if (mode === 'density') {
      setVis('clusters-layer', true);
      setVis('cluster-count-labels', true);
      setVis('unclustered-points', true);
      setVis('properties-heatmap', false);
      setVis('value-gap-points', false);
      setVis('neighborhoods-3d-extrusions', false);
      setVis('neighborhoods-outline', true);
      setVis('neighborhoods-labels', true);
    } else if (mode === 'neighborhood') {
      setVis('neighborhoods-3d-extrusions', true);
      setVis('unclustered-points', true);
      setVis('clusters-layer', false);
      setVis('cluster-count-labels', false);
      setVis('properties-heatmap', false);
      setVis('value-gap-points', false);
      setVis('neighborhoods-outline', false);
      setVis('neighborhoods-labels', true);
      if (map.getLayer('neighborhoods-3d-extrusions')) {
        map.setPaintProperty('neighborhoods-3d-extrusions', 'fill-extrusion-height', [
          'coalesce',
          ['get', 'extrusion_height_ppm2'],
          ['*', ['coalesce', ['get', 'median_price_per_m2'], 15000], 0.015]
        ]);
      }
    } else if (mode === 'activity') {
      setVis('neighborhoods-3d-extrusions', true);
      setVis('unclustered-points', false);
      setVis('clusters-layer', false);
      setVis('cluster-count-labels', false);
      setVis('properties-heatmap', false);
      setVis('value-gap-points', false);
      setVis('neighborhoods-outline', false);
      setVis('neighborhoods-labels', true);
      if (map.getLayer('neighborhoods-3d-extrusions')) {
        map.setPaintProperty('neighborhoods-3d-extrusions', 'fill-extrusion-height', [
          'coalesce',
          ['get', 'extrusion_height_density'],
          ['*', ['coalesce', ['get', 'active_listings_count'], 20], 3.0]
        ]);
      }
    } else if (mode === 'value_gap') {
      setVis('value-gap-points', true);
      setVis('unclustered-points', false);
      setVis('clusters-layer', false);
      setVis('cluster-count-labels', false);
      setVis('properties-heatmap', false);
      setVis('neighborhoods-3d-extrusions', false);
      setVis('neighborhoods-outline', true);
      setVis('neighborhoods-labels', true);
    }
  };

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

  // Update Mode Visibility on mode change
  useEffect(() => {
    if (!mapRef.current) return;
    applyMapMode(mapRef.current, mapMode);
  }, [mapMode]);

  // Camera Controls
  const handleResetCamera = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [-8.0125, 31.6346],
        zoom: 12.8,
        pitch: 45,
        bearing: -15,
        speed: 1.2,
      });
    }
  };

  const handleTogglePitch = () => {
    if (mapRef.current) {
      const currentPitch = mapRef.current.getPitch();
      mapRef.current.easeTo({
        pitch: currentPitch > 20 ? 0 : 55,
        duration: 800,
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Bottom Left Controls: Camera & Style */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
        }}
      >
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
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          <RotateCcw size={14} color="#38bdf8" /> Reset 3D View
        </button>

        <button
          onClick={handleTogglePitch}
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
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Compass size={14} color="#38bdf8" /> 2D / 3D Tilt
        </button>

        {/* Style Switcher Selector */}
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          {(['dark', 'liberty', 'bright'] as const).map((styleKey) => (
            <button
              key={styleKey}
              onClick={() => handleStyleChange(styleKey)}
              style={{
                backgroundColor: activeStyle === styleKey ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: activeStyle === styleKey ? '#38bdf8' : '#94a3b8',
                border: activeStyle === styleKey ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: activeStyle === styleKey ? 700 : 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {styleKey}
            </button>
          ))}
        </div>
      </div>

      {/* Active Mode Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '10px 14px',
          zIndex: 10,
          fontSize: '11px',
          color: '#cbd5e1',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Mode: {mapMode.replace('_', ' ').toUpperCase()}
        </div>
        {mapMode === 'value_gap' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }}
              ></span>
              <span>Below Model Estimate (Underpriced)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8' }}
              ></span>
              <span>Near Model Estimate (Fair Value)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}
              ></span>
              <span>Above Model Estimate (Premium Ask)</span>
            </div>
          </div>
        ) : mapMode === 'neighborhood' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
              Height = Median Price/m²
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#0284c7' }}></span>
              <span>&lt; 12k MAD/m²</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#eab308' }}></span>
              <span>12k - 20k MAD/m²</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#ef4444' }}></span>
              <span>&gt; 25k MAD/m²</span>
            </div>
          </div>
        ) : mapMode === 'activity' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
              Height = Active Listing Volume
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#38bdf8' }}></span>
              <span>Extruded Administrative Polygons</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8' }}
              ></span>
              <span>&lt; 10k MAD/m²</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}
              ></span>
              <span>10k - 18k MAD/m²</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}
              ></span>
              <span>18k - 25k MAD/m²</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}
              ></span>
              <span>&gt; 25k MAD/m²</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
