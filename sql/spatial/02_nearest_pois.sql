-- ==============================================================================
-- Query: Find Nearest Points of Interest (POIs) for a Selected Property
-- Uses PostGIS ST_Distance with cross-join and ranking
-- ==============================================================================

WITH selected_property AS (
    SELECT property_id, geom 
    FROM properties 
    WHERE property_id = 'MAR-MUB-00001'
)
SELECT 
    poi.name AS poi_name,
    poi.category,
    poi.importance,
    ROUND(ST_Distance(poi.geom::geography, p.geom::geography)::numeric, 1) AS distance_meters
FROM pois poi
CROSS JOIN selected_property p
ORDER BY distance_meters ASC
LIMIT 10;
