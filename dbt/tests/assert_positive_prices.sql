-- Singular dbt test: assert_positive_prices
-- Fails if any property has non-positive price
SELECT 
    property_id, 
    price 
FROM {{ ref('stg_properties') }}
WHERE price <= 0 OR price IS NULL;
