# AtlasEstate 3D - Spatial Model & Geospatial Engineering

## 1. Coordinate Reference Systems (CRS) & Projections

AtlasEstate 3D utilizes a dual-tier spatial reference approach:
1. **Global Standard (WGS 84 - EPSG:4326):** All input GeoJSON polygons, POIs, and property coordinates are stored and transmitted over the REST API in unprojected geodetic coordinates (latitude, longitude in decimal degrees). This guarantees seamless compatibility with MapLibre GL JS, Deck.gl, GeoJSON specifications, and client-side GPU shaders.
2. **Projected National Moroccan Coordinates (Lambert Conformal Conic - EPSG:26191 / Merchich Nord Maroc):** For high-precision cadastral metric distance calculations without trigonometric spherical distortions, the PostGIS database supports on-the-fly transformations using `ST_Transform(geom, 26191)`.

---

## 2. Geodesic Distance Calculations (Haversine Vectorization)

On the ingestion and feature engineering pipeline, geodesic distances between properties $(lat_1, lon_1)$ and Points of Interest $(lat_2, lon_2)$ are calculated using the vectorized Haversine formula on the WGS 84 mean earth radius ($R = 6,371.0088\text{ km}$):

$$\Delta lat = lat_2 - lat_1, \quad \Delta lon = lon_2 - lon_1$$

$$a = \sin^2\left(\frac{\Delta lat}{2}\right) + \cos(lat_1) \cdot \cos(lat_2) \cdot \sin^2\left(\frac{\Delta lon}{2}\right)$$

$$c = 2 \cdot \arctan2\left(\sqrt{a}, \sqrt{1 - a}\right)$$

$$d = R \cdot c$$

In the Gold feature pipeline, this is executed across 7 POI vectors simultaneously:
- City Center (Gueliz Central Axis)
- Jemaa el-Fnaa (Historic Medina Core)
- Marrakech-Menara International Airport (RAK)
- Gare de Marrakech (ONCF Railway & High-Speed Link)
- Carre Eden & Menara Mall (Commercial Centers)
- CHU Mohammed VI (Tertiary Healthcare)
- Educational institutions (American School, Cadi Ayyad University)

---

## 3. Spatial Indexing & PostGIS Implementation

PostGIS accelerates spatial bounding box queries and proximity joins via **GIST (Generalized Search Tree)** indexes implemented as dynamic R-Trees:

```sql
CREATE INDEX idx_properties_geom ON properties USING GIST (geom);
CREATE INDEX idx_neighborhoods_geom ON neighborhoods USING GIST (geom);
CREATE INDEX idx_pois_geom ON pois USING GIST (geom);
```

### Production Spatial Query Examples

#### Radius Geofencing (`ST_DWithin`)
Find all residential properties within a 1,500-meter radius of the central railway station:
```sql
SELECT 
    p.property_id,
    p.title,
    p.price,
    p.price_per_m2,
    ST_Distance(p.geom::geography, poi.geom::geography) AS distance_meters
FROM properties p
JOIN pois poi ON poi.name = 'Gare de Marrakech'
WHERE ST_DWithin(p.geom::geography, poi.geom::geography, 1500)
ORDER BY distance_meters ASC;
```

#### Point-in-Polygon Boundary Join (`ST_Contains`)
Aggregates median price per square meter directly from underlying parcel geometries:
```sql
SELECT 
    n.name AS neighborhood_name,
    COUNT(p.property_id) AS total_listings,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.price_per_m2)) AS median_ppm2,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.price)) AS median_price_mad
FROM neighborhoods n
LEFT JOIN properties p ON ST_Contains(n.geom, p.geom)
GROUP BY n.name
ORDER BY median_ppm2 DESC;
```

---

## 4. Multi-Attribute Spatial KNN Comparable Search Algorithm

When a user selects a property on the 3D map, AtlasEstate executes an intelligent multi-attribute comparable ranking engine that combines geodesic Euclidean proximity with structural physical likeness:

$$S_{\text{total}} = w_{\text{geo}} \cdot S_{\text{geo}} + w_{\text{price}} \cdot S_{\text{price}} + w_{\text{surf}} \cdot S_{\text{surf}} + w_{\text{rooms}} \cdot S_{\text{rooms}} + w_{\text{amenities}} \cdot S_{\text{amenities}}$$

Weights:
- Geodesic Distance ($w_{\text{geo}} = 0.35$): Penalizes properties farther than 2 km.
- Price Proximity ($w_{\text{price}} = 0.25$): Penalizes pricing divergences greater than ±20%.
- Surface Area Match ($w_{\text{surf}} = 0.20$): Penalizes deviations from target square footage.
- Room Count Match ($w_{\text{rooms}} = 0.10$): Matches bedroom and bathroom counts.
- Amenity Overlap ($w_{\text{amenities}} = 0.10$): Jaccard index over swimming pool, elevator, parking, and terrace.

This yields verified comparable listings with similarity percentages (e.g., *94.2% match within 350 meters*).
