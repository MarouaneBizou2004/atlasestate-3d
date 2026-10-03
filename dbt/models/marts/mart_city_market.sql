-- Mart model: mart_city_market
-- High-level market overview by property type
-- Materialization: table

WITH listings AS (
    SELECT * FROM {{ ref('stg_properties') }}
)
SELECT
    property_type,
    COUNT(property_id) AS total_listings,
    ROUND(AVG(price), 0) AS average_price_mad,
    ROUND(AVG(price_per_m2), 0) AS average_price_per_m2,
    ROUND(AVG(surface_m2), 1) AS average_surface_m2,
    ROUND(AVG(bedrooms), 1) AS average_bedrooms,
    ROUND(AVG(bathrooms), 1) AS average_bathrooms
FROM listings
GROUP BY property_type
