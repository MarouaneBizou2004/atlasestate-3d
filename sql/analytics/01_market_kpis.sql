-- ==============================================================================
-- Query: Core Market KPIs for Executive Dashboard
-- Total Listings, Median Price, Average Price, Median Price/m2, Avg Surface, Room Counts
-- ==============================================================================

SELECT 
    COUNT(*) AS total_listings,
    ROUND(AVG(price)::numeric, 0) AS average_price_mad,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)::numeric, 0) AS median_price_mad,
    ROUND(AVG(price_per_m2)::numeric, 0) AS average_price_per_m2,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price_per_m2)::numeric, 0) AS median_price_per_m2,
    ROUND(AVG(surface_m2)::numeric, 1) AS average_surface_m2,
    ROUND(AVG(bedrooms)::numeric, 1) AS average_bedrooms,
    ROUND(AVG(bathrooms)::numeric, 1) AS average_bathrooms,
    COUNT(DISTINCT neighborhood_id) AS total_neighborhoods,
    COUNT(DISTINCT property_type) AS total_property_types
FROM properties;
