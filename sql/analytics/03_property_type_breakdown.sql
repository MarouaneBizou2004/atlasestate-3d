-- ==============================================================================
-- Query: Breakdown of Market Metrics by Property Type
-- ==============================================================================

SELECT 
    property_type,
    COUNT(*) AS total_count,
    ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER())::numeric, 1) AS share_pct,
    ROUND(AVG(price)::numeric, 0) AS avg_price,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)::numeric, 0) AS median_price,
    ROUND(AVG(price_per_m2)::numeric, 0) AS avg_price_m2,
    ROUND(AVG(surface_m2)::numeric, 0) AS avg_surface_m2,
    ROUND(AVG(bedrooms)::numeric, 1) AS avg_bedrooms,
    ROUND(AVG(bathrooms)::numeric, 1) AS avg_bathrooms
FROM properties
GROUP BY property_type
ORDER BY total_count DESC;
