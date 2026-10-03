-- Intermediate model: int_property_enriched
-- Combines spatial indices and valuation estimates

WITH spatial AS (
    SELECT * FROM {{ ref('int_property_spatial') }}
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
    latitude,
    longitude,
    published_at,
    price_ratio_to_neighborhood,
    CASE 
        WHEN price_ratio_to_neighborhood > 1.20 THEN 'Premium Tier'
        WHEN price_ratio_to_neighborhood < 0.85 THEN 'Value Tier'
        ELSE 'Fair Market Tier'
    END AS neighborhood_tier_segment
FROM spatial
