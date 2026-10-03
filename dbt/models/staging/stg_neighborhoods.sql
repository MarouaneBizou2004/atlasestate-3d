-- Staging model: stg_neighborhoods
-- Materialization: view

WITH source AS (
    SELECT * FROM neighborhoods
)
SELECT
    neighborhood_id,
    city_id,
    name AS neighborhood_name,
    name_ar AS neighborhood_name_ar,
    zone_type,
    description,
    CAST(median_price_m2 AS FLOAT) AS median_price_m2,
    CAST(active_listings_count AS INTEGER) AS active_listings_count
FROM source
