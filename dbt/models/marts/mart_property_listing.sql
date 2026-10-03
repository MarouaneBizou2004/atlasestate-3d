-- Mart model: mart_property_listing
-- Materialization: table

WITH enriched AS (
    SELECT * FROM {{ ref('int_property_enriched') }}
)
SELECT
    property_id,
    neighborhood_id,
    neighborhood_name,
    zone_type,
    property_type,
    price,
    surface_m2,
    price_per_m2,
    bedrooms,
    bathrooms,
    has_pool,
    has_parking,
    has_elevator,
    has_terrace,
    neighborhood_tier_segment,
    latitude,
    longitude,
    published_at
FROM enriched
