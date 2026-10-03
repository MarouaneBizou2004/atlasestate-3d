-- ==============================================================================
-- Query: Spatial Value Clustering & Hexagonal / Grid Spatial Aggregates
-- Groups properties into spatial clusters using ST_SnapToGrid for Heatmap rendering
-- ==============================================================================

SELECT 
    ROUND(AVG(p.latitude)::numeric, 4) AS cluster_lat,
    ROUND(AVG(p.longitude)::numeric, 4) AS cluster_lon,
    COUNT(p.property_id) AS point_count,
    ROUND(AVG(p.price_per_m2)::numeric, 0) AS cluster_avg_ppm2,
    ROUND(AVG(pv.value_gap_percent)::numeric, 2) AS cluster_avg_value_gap_pct
FROM properties p
JOIN property_valuations pv ON p.property_id = pv.property_id
GROUP BY 
    ROUND(p.latitude::numeric, 3),
    ROUND(p.longitude::numeric, 3)
HAVING COUNT(p.property_id) >= 2
ORDER BY point_count DESC;
