-- Staging model: stg_pois
-- Materialization: view

WITH source AS (
    SELECT * FROM pois
)
SELECT
    poi_id,
    city_id,
    name AS poi_name,
    category AS poi_category,
    CAST(importance AS FLOAT) AS importance,
    CAST(latitude AS FLOAT) AS latitude,
    CAST(longitude AS FLOAT) AS longitude
FROM source
