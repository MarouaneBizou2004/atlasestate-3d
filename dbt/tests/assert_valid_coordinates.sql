-- Singular dbt test: assert_valid_coordinates
-- Fails if any property coordinate falls outside Morocco/Marrakech envelope
SELECT 
    property_id, 
    latitude, 
    longitude 
FROM {{ ref('stg_properties') }}
WHERE latitude < 31.40 OR latitude > 31.80
   OR longitude < -8.20 OR longitude > -7.80;
