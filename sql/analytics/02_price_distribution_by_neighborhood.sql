-- ==============================================================================
-- Query: Price Distribution and Quartiles by Neighborhood
-- Computes Q1, Median (Q2), Q3, Min, Max, and Outlier Thresholds
-- ==============================================================================

SELECT 
    n.name AS neighborhood,
    n.zone_type,
    COUNT(p.property_id) AS listings_count,
    ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY p.price)::numeric, 0) AS p25_price,
    ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY p.price)::numeric, 0) AS median_price,
    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY p.price)::numeric, 0) AS p75_price,
    ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY p.price_per_m2)::numeric, 0) AS p25_ppm2,
    ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY p.price_per_m2)::numeric, 0) AS median_ppm2,
    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY p.price_per_m2)::numeric, 0) AS p75_ppm2
FROM neighborhoods n
JOIN properties p ON n.neighborhood_id = p.neighborhood_id
GROUP BY n.neighborhood_id, n.name, n.zone_type
ORDER BY median_ppm2 DESC;
