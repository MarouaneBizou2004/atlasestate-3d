-- Intermediate model: int_property_spatial
-- Computes spatial distance factors and relative neighborhood positions

WITH properties AS (
    SELECT * FROM {{ ref('stg_properties') }}
),
neighborhoods AS (
    SELECT * FROM {{ ref('stg_neighborhoods') }}
)
SELECT
    p.property_id,
    p.neighborhood_id,
    n.neighborhood_name,
    n.zone_type,
    p.property_type,
    p.latitude,
    p.longitude,
    p.price,
    p.surface_m2,
    p.price_per_m2,
    p.bedrooms,
    p.bathrooms,
    p.has_pool,
    p.has_parking,
    p.has_elevator,
    p.has_terrace,
    p.published_at,
    n.median_price_m2 AS neighborhood_median_ppm2,
    ROUND((p.price_per_m2 / NULLIF(n.median_price_m2, 0)), 3) AS price_ratio_to_neighborhood
FROM properties p
JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
