-- ==============================================================================
-- Query: Spatial Point-in-Polygon Aggregation by Neighborhood
-- Computes real-time median price/m2, surface distribution, and polygon density
-- ==============================================================================

SELECT 
    n.neighborhood_id,
    n.name AS neighborhood_name,
    n.zone_type,
    COUNT(p.property_id) AS total_listings,
    ROUND(AVG(p.price)::numeric, 0) AS avg_price_mad,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.price)::numeric, 0) AS median_price_mad,
    ROUND(AVG(p.price_per_m2)::numeric, 0) AS avg_price_m2,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.price_per_m2)::numeric, 0) AS median_price_m2,
    ROUND(AVG(p.surface_m2)::numeric, 1) AS avg_surface_m2,
    ROUND(ST_Area(n.geom::geography) / 1000000.0, 2) AS area_sq_km,
    ROUND((COUNT(p.property_id) / (ST_Area(n.geom::geography) / 1000000.0))::numeric, 1) AS listing_density_per_sq_km
FROM neighborhoods n
LEFT JOIN properties p ON ST_Contains(n.geom, p.geom)
GROUP BY n.neighborhood_id, n.name, n.zone_type, n.geom
ORDER BY median_price_m2 DESC;
