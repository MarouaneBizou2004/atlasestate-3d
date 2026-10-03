-- Mart model: mart_neighborhood_market
-- Aggregates real-time KPIs per neighborhood
-- Materialization: table

WITH listings AS (
    SELECT * FROM {{ ref('stg_properties') }}
),
neighborhoods AS (
    SELECT * FROM {{ ref('stg_neighborhoods') }}
)
SELECT
    n.neighborhood_id,
    n.neighborhood_name,
    n.zone_type,
    COUNT(l.property_id) AS active_listings_count,
    ROUND(AVG(l.price), 0) AS average_price_mad,
    ROUND(AVG(l.price_per_m2), 0) AS average_price_per_m2,
    ROUND(AVG(l.surface_m2), 1) AS average_surface_m2,
    ROUND(AVG(l.bedrooms), 1) AS average_bedrooms,
    ROUND(SUM(CASE WHEN l.has_pool THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(l.property_id), 0), 1) AS pool_prevalence_pct,
    ROUND(SUM(CASE WHEN l.has_parking THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(l.property_id), 0), 1) AS parking_prevalence_pct,
    ROUND(SUM(CASE WHEN l.has_elevator THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(l.property_id), 0), 1) AS elevator_prevalence_pct
FROM neighborhoods n
LEFT JOIN listings l ON n.neighborhood_id = l.neighborhood_id
GROUP BY n.neighborhood_id, n.neighborhood_name, n.zone_type
