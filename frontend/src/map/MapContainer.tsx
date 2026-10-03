import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapMode } from '../types';
import { RotateCcw, Compass, Sun, Moon, Globe, Map as MapIcon } from 'lucide-react';

interface MapContainerProps {
  propertiesGeoJSON: any;
  neighborhoodsGeoJSON: any;
  poisGeoJSON: any;
  mapMode: MapMode;
  selectedPropertyId: string | null;
  onSelectProperty: (propertyId: string | null) => void;
  onSelectNeighborhood?: (neighborhoodId: string) => void;
  onSelectBuilding?: (buildingData: { title: string; neighborhood: string; properties: any[] }) => void;
}

// Basemap Styles with Satellite 3D and Vector options
const MAP_STYLES: Record<string, any> = {
  dark: 'https://tiles.openfreemap.org/styles/dark',
  satellite: {
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: '&copy; Esri, Maxar, Earthstar Geographics'
      },
      'openmaptiles': {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet'
      }
    },
    layers: [
      {
        id: 'esri-satellite-layer',
        type: 'raster',
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  },
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  bright: 'https://tiles.openfreemap.org/styles/bright',
};

// Enable Right-to-Left (RTL) text shaping for proper Arabic street and landmark rendering
try {
  if (typeof (maplibregl as any).getRTLTextPluginStatus === 'function' && (maplibregl as any).getRTLTextPluginStatus() === 'unavailable') {
    (maplibregl as any).setRTLTextPlugin(
      '/mapbox-gl-rtl-text.js',
      (err: any) => {
        if (err) {
          console.warn('Local RTL plugin failed, loading from CDN:', err);
          (maplibregl as any).setRTLTextPlugin(
            'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js',
            null,
            true
          );
        }
      },
      true // Lazy: loads as soon as Arabic/RTL text is encountered
    );
  }
} catch (e) {
  console.warn('RTL plugin already initialized or not supported:', e);
}

// Calculate distance in meters between two lat/lon points
function calcDistMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  propertiesGeoJSON,
  neighborhoodsGeoJSON,
  poisGeoJSON,
  mapMode,
  selectedPropertyId,
  onSelectProperty,
  onSelectNeighborhood,
  onSelectBuilding,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [activeStyle, setActiveStyle] = useState<'dark' | 'satellite' | 'liberty' | 'bright'>('dark');
  const [styleLoaded, setStyleLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[activeStyle],
      center: [-8.0125, 31.6346], // Marrakech center (Gueliz)
      zoom: 13.5,
      pitch: 52, // 3D Camera Tilt
      bearing: -18,
      antialias: true,
      maxPitch: 75,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 14,
    });

    map.on('style.load', () => {
      setupLightingAndAtmosphere(map);
      setupLayers(map);
      setStyleLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Handle Style Switcher
  const handleStyleChange = (styleKey: 'dark' | 'satellite' | 'liberty' | 'bright') => {
    if (!mapRef.current || styleKey === activeStyle) return;
    setActiveStyle(styleKey);
    setStyleLoaded(false);
    mapRef.current.setStyle(MAP_STYLES[styleKey]);
  };

  // Configure Realistic 3D Directional Lighting & Sun Shadows
  const setupLightingAndAtmosphere = (map: maplibregl.Map) => {
    try {
      map.setLight({
        anchor: 'viewport',
        color: activeStyle === 'dark' ? '#fed7aa' : '#ffffff',
        intensity: activeStyle === 'dark' ? 0.6 : 0.45,
        position: [1.35, 75, 42],
      });
    } catch (err) {
      console.warn('Map lighting setup error:', err);
    }
  };

  // Helper to find properties near a coordinate
  const findNearbyProperties = (lng: number, lat: number, maxDistanceMeters = 120): any[] => {
    if (!propertiesGeoJSON || !propertiesGeoJSON.features) return [];
    const matches: any[] = [];
    for (const feat of propertiesGeoJSON.features) {
      const coords = feat.geometry?.coordinates;
      if (coords && coords.length === 2) {
        const d = calcDistMeters(lat, lng, coords[1], coords[0]);
        if (d <= maxDistanceMeters) {
          matches.push({ ...feat.properties, distance: d });
        }
      }
    }
    matches.sort((a, b) => a.distance - b.distance);
    return matches;
  };

  // Configure All Spatial Layers
  const setupLayers = (map: maplibregl.Map) => {
    // -------------------------------------------------------------------------
    // 1. Realistic 3D Buildings Layer from Vector Tiles (OpenMapTiles source)
    // -------------------------------------------------------------------------
    if (map.getSource('openmaptiles') && !map.getLayer('3d-buildings')) {
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
            minzoom: 13,
            paint: {
              'fill-extrusion-color':
                activeStyle === 'satellite'
                  ? 'rgba(255, 255, 255, 0.28)'
                  : activeStyle === 'dark'
                  ? [
                      'interpolate',
                      ['linear'],
                      ['coalesce', ['get', 'render_height'], ['get', 'height'], 12],
                      6, '#182234',
                      15, '#1e293b',
                      25, '#293548',
                      40, '#334155',
                      60, '#38bdf8',
                    ]
                  : '#cbd5e1',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13, 0,
                15.5, ['coalesce', ['get', 'render_height'], ['get', 'height'], 14],
              ],
              'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
              'fill-extrusion-opacity': activeStyle === 'satellite' ? 0.45 : 0.88,
            },
          },
          labelLayerId
        );
      } catch (err) {
        console.warn('Vector 3D buildings layer not supported on this style:', err);
      }
    }

    // -------------------------------------------------------------------------
    // 2. Iconic 3D Architectural Landmarks Layer (Koutoubia, Menara, Gare, Carre Eden)
    // -------------------------------------------------------------------------
    if (!map.getSource('landmarks-3d')) {
      map.addSource('landmarks-3d', {
        type: 'geojson',
        data: '/marrakech_3d_landmarks.geojson',
      });
    }

    if (!map.getLayer('landmarks-3d-layer')) {
      map.addLayer({
        id: 'landmarks-3d-layer',
        type: 'fill-extrusion',
        source: 'landmarks-3d',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': 0.95,
        },
      });
    }

    // -------------------------------------------------------------------------
    // 3. Neighborhoods GeoJSON Source & Layers
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
          'line-opacity': 0.6,
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
          'text-letter-spacing': 0.12,
          'text-anchor': 'center',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': activeStyle === 'satellite' ? '#ffffff' : '#94a3b8',
          'text-halo-color': '#0f172a',
          'text-halo-width': 2,
        },
      });
    }

    // C. Neighborhood 3D Extrusions (Visible ONLY in Mode 4 & Mode 5)
    if (!map.getLayer('neighborhoods-3d-extrusions')) {
      map.addLayer({
        id: 'neighborhoods-3d-extrusions',
        type: 'fill-extrusion',
        source: 'neighborhoods-data',
        layout: {
          visibility: 'none',
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
            32000, '#ef4444',
          ],
          'fill-extrusion-height': [
            'coalesce',
            ['get', 'extrusion_height_ppm2'],
            ['*', ['coalesce', ['get', 'median_price_per_m2'], 15000], 0.015],
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.65,
        },
      });
    }

    // -------------------------------------------------------------------------
    // 4. Properties GeoJSON Source & Layers
    // -------------------------------------------------------------------------
    if (!map.getSource('properties-data')) {
      map.addSource('properties-data', {
        type: 'geojson',
        data: propertiesGeoJSON || { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 36,
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
            '#ef4444',
          ],
          'circle-opacity': 0.92,
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
            32000, '#ef4444',
          ],
          'circle-radius': 6.5,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
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
            '#94a3b8',
          ],
          'circle-radius': 7,
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
            1, '#ef4444',
          ],
          'heatmap-radius': 24,
          'heatmap-opacity': 0.8,
        },
      });
    }

    // -------------------------------------------------------------------------
    // 5. Selected Property 3D Visual Highlight Layers
    // -------------------------------------------------------------------------
    if (!map.getSource('selected-property-source')) {
      map.addSource('selected-property-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }

    // A. Glowing Ground Pulsing Halo
    if (!map.getLayer('selected-property-halo')) {
      map.addLayer({
        id: 'selected-property-halo',
        type: 'circle',
        source: 'selected-property-source',
        paint: {
          'circle-radius': 18,
          'circle-color': 'rgba(56, 189, 248, 0.25)',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#38bdf8',
          'circle-opacity': 0.95,
        },
      });
    }

    // B. Vertical 3D Highlight Core
    if (!map.getLayer('selected-property-beacon-3d')) {
      map.addLayer({
        id: 'selected-property-beacon-3d',
        type: 'circle',
        source: 'selected-property-source',
        paint: {
          'circle-radius': 8,
          'circle-color': '#f8fafc',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#0f172a',
          'circle-opacity': 1,
        },
      });
    }

    // -------------------------------------------------------------------------
    // 6. Comprehensive Interactive Event Listeners (Fixing 3D Clicks!)
    // -------------------------------------------------------------------------

    // A. Direct Property Pin Click
    const handleDirectPropClick = (e: any) => {
      if (!e.features || !e.features[0]) return;
      const feat = e.features[0];
      const propId = feat.properties?.property_id;
      if (!propId) return;

      onSelectProperty(propId);

      const coords = (feat.geometry as any).coordinates;
      if (coords) {
        map.flyTo({
          center: coords,
          zoom: 16,
          pitch: 58,
          speed: 1.2,
        });
      }
    };

    map.on('click', 'unclustered-points', handleDirectPropClick);
    map.on('click', 'value-gap-points', handleDirectPropClick);

    // B. 3D Building Click: Search properties in this building footprint
    map.on('click', '3d-buildings', (e) => {
      const clickLng = e.lngLat.lng;
      const clickLat = e.lngLat.lat;

      // Find nearby property listings belonging to or near this building
      const nearbyUnits = findNearbyProperties(clickLng, clickLat, 90);

      if (nearbyUnits.length === 1) {
        // Single unit building (e.g. villa or private house)
        onSelectProperty(nearbyUnits[0].property_id);
        map.flyTo({ center: [clickLng, clickLat], zoom: 16, pitch: 58, speed: 1.2 });
      } else if (nearbyUnits.length > 1) {
        // Multi-unit residential or commercial building
        if (onSelectBuilding) {
          onSelectBuilding({
            title: nearbyUnits[0].title || 'Urban Residential Complex',
            neighborhood: nearbyUnits[0].neighborhood || 'Gueliz',
            properties: nearbyUnits,
          });
        } else {
          onSelectProperty(nearbyUnits[0].property_id);
        }
        map.flyTo({ center: [clickLng, clickLat], zoom: 15.5, pitch: 55, speed: 1.2 });
      } else {
        // Building clicked but no listing mapped inside it: show nearest available property
        const widerSearch = findNearbyProperties(clickLng, clickLat, 300);
        if (widerSearch.length > 0) {
          onSelectProperty(widerSearch[0].property_id);
        }
      }
    });

    // C. 3D Landmark Click (Koutoubia, Menara, Gare de Marrakech, Carre Eden)
    map.on('click', 'landmarks-3d-layer', (e) => {
      if (!e.features || !e.features[0]) return;
      const f = e.features[0];
      const p = f.properties;
      const clickLng = e.lngLat.lng;
      const clickLat = e.lngLat.lat;

      const nearbyListings = findNearbyProperties(clickLng, clickLat, 450);

      if (nearbyListings.length > 0 && onSelectBuilding) {
        onSelectBuilding({
          title: `Landmark: ${p.name}`,
          neighborhood: p.category ? p.category.replace('_', ' ').toUpperCase() : 'Marrakech',
          properties: nearbyListings,
        });
      } else if (nearbyListings.length > 0) {
        onSelectProperty(nearbyListings[0].property_id);
      }

      map.flyTo({ center: [clickLng, clickLat], zoom: 15.5, pitch: 58, speed: 1.2 });
    });

    // D. Cluster Bubble Click
    map.on('click', 'clusters-layer', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters-layer'] });
      if (!features[0]) return;
      const clusterId = features[0].properties.cluster_id;

      // Check zoom level: if user is already zoomed in, show properties in that cluster
      const currentZoom = map.getZoom();
      if (currentZoom >= 13.5 && onSelectBuilding) {
        const clusterCoords = (features[0].geometry as any).coordinates;
        const clusterProps = findNearbyProperties(clusterCoords[0], clusterCoords[1], 150);
        if (clusterProps.length > 0) {
          onSelectBuilding({
            title: `Property Cluster (${clusterProps.length} units)`,
            neighborhood: clusterProps[0].neighborhood || 'Marrakech',
            properties: clusterProps,
          });
          return;
        }
      }

      (map.getSource('properties-data') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;
        map.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom + 1.2,
        });
      });
    });

    // E. 3D Neighborhood Extrusion Click
    map.on('click', 'neighborhoods-3d-extrusions', (e) => {
      if (!e.features || !e.features[0]) return;
      const f = e.features[0];
      const name = f.properties?.name;
      if (name && onSelectNeighborhood) {
        onSelectNeighborhood(name);
      }
    });

    // F. General Canvas Click (Clicking Empty Space Deselects)
    map.on('click', (e) => {
      // Check if click hit any interactive layer
      const hits = map.queryRenderedFeatures(e.point, {
        layers: [
          'unclustered-points',
          'value-gap-points',
          '3d-buildings',
          'landmarks-3d-layer',
          'clusters-layer',
          'neighborhoods-3d-extrusions',
        ],
      });

      if (hits.length === 0) {
        onSelectProperty(null);
      }
    });

    // -------------------------------------------------------------------------
    // 7. Interactive Hover Cursor & Tooltip State
    // -------------------------------------------------------------------------
    const interactiveLayers = [
      'unclustered-points',
      'value-gap-points',
      'clusters-layer',
      '3d-buildings',
      'landmarks-3d-layer',
      'neighborhoods-3d-extrusions',
    ];

    interactiveLayers.forEach((layerId) => {
      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
      });
    });

    // Hover Tooltip on Property Pin
    map.on('mouseenter', 'unclustered-points', (e) => {
      if (!e.features || !e.features[0] || !popupRef.current) return;
      const f = e.features[0];
      const coords = (f.geometry as any).coordinates.slice();
      const p = f.properties;

      const html = `
        <div style="font-family: sans-serif; padding: 6px; font-size: 11px; color: #f8fafc; background: #0f172a; border-radius: 6px; min-width: 140px; border: 1px solid #334155;">
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
      if (popupRef.current) popupRef.current.remove();
    });

    // Hover Tooltip on Landmark
    map.on('mouseenter', 'landmarks-3d-layer', (e) => {
      if (!e.features || !e.features[0] || !popupRef.current) return;
      const f = e.features[0];
      const p = f.properties;

      const html = `
        <div style="font-family: sans-serif; padding: 6px 8px; font-size: 11px; color: #f8fafc; background: #0f172a; border-radius: 6px; min-width: 150px; border: 1px solid #334155;">
          <div style="font-weight: 700; color: #f59e0b; font-size: 12px; margin-bottom: 2px;">🏛️ ${p.name}</div>
          <div style="color: #cbd5e1; font-size: 10px; line-height: 1.4;">${p.description}</div>
          <div style="color: #38bdf8; font-size: 10px; margin-top: 4px; font-family: monospace;">Elevation: ${p.height}m</div>
        </div>
      `;

      popupRef.current.setLngLat(e.lngLat).setHTML(html).addTo(map);
    });

    map.on('mouseleave', 'landmarks-3d-layer', () => {
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
      setVis('landmarks-3d-layer', true);
    } else if (mode === 'heatmap') {
      setVis('properties-heatmap', true);
      setVis('unclustered-points', false);
      setVis('clusters-layer', false);
      setVis('cluster-count-labels', false);
      setVis('value-gap-points', false);
      setVis('neighborhoods-3d-extrusions', false);
      setVis('neighborhoods-outline', true);
      setVis('neighborhoods-labels', true);
      setVis('landmarks-3d-layer', false);
    } else if (mode === 'density') {
      setVis('clusters-layer', true);
      setVis('cluster-count-labels', true);
      setVis('unclustered-points', true);
      setVis('properties-heatmap', false);
      setVis('value-gap-points', false);
      setVis('neighborhoods-3d-extrusions', false);
      setVis('neighborhoods-outline', true);
      setVis('neighborhoods-labels', true);
      setVis('landmarks-3d-layer', true);
    } else if (mode === 'neighborhood') {
      setVis('neighborhoods-3d-extrusions', true);
      setVis('unclustered-points', true);
      setVis('clusters-layer', false);
      setVis('cluster-count-labels', false);
      setVis('properties-heatmap', false);
      setVis('value-gap-points', false);
      setVis('neighborhoods-outline', false);
      setVis('neighborhoods-labels', true);
      setVis('landmarks-3d-layer', true);
      if (map.getLayer('neighborhoods-3d-extrusions')) {
        map.setPaintProperty('neighborhoods-3d-extrusions', 'fill-extrusion-height', [
          'coalesce',
          ['get', 'extrusion_height_ppm2'],
          ['*', ['coalesce', ['get', 'median_price_per_m2'], 15000], 0.015],
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
      setVis('landmarks-3d-layer', true);
      if (map.getLayer('neighborhoods-3d-extrusions')) {
        map.setPaintProperty('neighborhoods-3d-extrusions', 'fill-extrusion-height', [
          'coalesce',
          ['get', 'extrusion_height_density'],
          ['*', ['coalesce', ['get', 'active_listings_count'], 20], 3.0],
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
      setVis('landmarks-3d-layer', true);
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

  // Update Selected Property 3D Visual Highlight
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (!map.getSource('selected-property-source')) return;

    if (!selectedPropertyId || !propertiesGeoJSON || !propertiesGeoJSON.features) {
      (map.getSource('selected-property-source') as any).setData({
        type: 'FeatureCollection',
        features: [],
      });
      return;
    }

    const matchFeat = propertiesGeoJSON.features.find(
      (f: any) => f.properties?.property_id === selectedPropertyId
    );

    if (matchFeat && matchFeat.geometry) {
      (map.getSource('selected-property-source') as any).setData({
        type: 'FeatureCollection',
        features: [matchFeat],
      });
    }
  }, [selectedPropertyId, propertiesGeoJSON]);

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
        zoom: 13.5,
        pitch: 52,
        bearing: -18,
        speed: 1.2,
      });
    }
  };

  const handleTogglePitch = () => {
    if (mapRef.current) {
      const currentPitch = mapRef.current.getPitch();
      mapRef.current.easeTo({
        pitch: currentPitch > 25 ? 0 : 58,
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
          {[
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'satellite', label: 'Satellite 3D', icon: Globe },
            { id: 'liberty', label: 'Streets', icon: MapIcon },
            { id: 'bright', label: 'Light', icon: Sun },
          ].map((style) => {
            const Icon = style.icon;
            const isSelected = activeStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => handleStyleChange(style.id as any)}
                style={{
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: isSelected ? '#38bdf8' : '#94a3b8',
                  border: isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={12} />
                <span>{style.label}</span>
              </button>
            );
          })}
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
