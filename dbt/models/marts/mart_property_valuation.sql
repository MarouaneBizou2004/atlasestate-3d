-- Mart model: mart_property_valuation
-- Analyzes valuation spread between asking and predicted price
-- Materialization: table

WITH props AS (
    SELECT * FROM properties
)
SELECT
    property_id,
    neighborhood,
    property_type,
    price AS asking_price,
    predicted_price,
    value_gap,
    value_gap_percent,
    valuation_status,
    surface_m2,
    price_per_m2
FROM props
WHERE predicted_price IS NOT NULL
