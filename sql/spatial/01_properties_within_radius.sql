-- ==============================================================================
-- Query: Find Properties within a Given Radius (e.g. 2,000 meters) of a Point
-- Uses PostGIS ST_DWithin on Geography / Geometry with spatial GIST index
-- Point: Gueliz Center (31.6346 N, 8.0125 W)
-- ==============================================================================

SELECT 
    p.property_id,
    p.property_type,
    p.price,
    p.surface_m2,
    p.price_per_m2,
    n.name AS neighborhood,
    ROUND(ST_Distance(
        p.geom::geography, 
        ST_SetSRID(ST_MakePoint(-8.0125, 31.6346), 4326)::geography
    )::numeric, 1) AS distance_meters
FROM properties p
JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
WHERE ST_DWithin(
    p.geom::geography,
    ST_SetSRID(ST_MakePoint(-8.0125, 31.6346), 4326)::geography,
    2000 -- 2 km radius
)
ORDER BY distance_meters ASC
LIMIT 50;
