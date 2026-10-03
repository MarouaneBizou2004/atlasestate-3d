-- Singular dbt test: assert_positive_surfaces
-- Fails if any property surface is less than 15 m2
SELECT 
    property_id, 
    surface_m2 
FROM {{ ref('stg_properties') }}
WHERE surface_m2 < 15 OR surface_m2 IS NULL;
