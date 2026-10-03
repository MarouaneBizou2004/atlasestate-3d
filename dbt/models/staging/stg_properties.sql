-- Staging model: stg_properties
-- Materialization: view

WITH source AS (
    SELECT * FROM properties
)
SELECT
    property_id,
    source,
    listing_url,
    city_id,
    neighborhood_id,
    neighborhood,
    property_type,
    transaction_type,
    CAST(latitude AS FLOAT) AS latitude,
    CAST(longitude AS FLOAT) AS longitude,
    CAST(price AS INTEGER) AS price,
    currency,
    CAST(surface_m2 AS INTEGER) AS surface_m2,
    CAST(price_per_m2 AS FLOAT) AS price_per_m2,
    CAST(bedrooms AS INTEGER) AS bedrooms,
    CAST(bathrooms AS INTEGER) AS bathrooms,
    CAST(rooms AS INTEGER) AS rooms,
    CAST(floor AS INTEGER) AS floor,
    CAST(total_floors AS INTEGER) AS total_floors,
    CAST(building_age AS INTEGER) AS building_age,
    CAST(furnished AS BOOLEAN) AS is_furnished,
    CAST(parking AS BOOLEAN) AS has_parking,
    CAST(elevator AS BOOLEAN) AS has_elevator,
    CAST(pool AS BOOLEAN) AS has_pool,
    CAST(garden AS BOOLEAN) AS has_garden,
    CAST(terrace AS BOOLEAN) AS has_terrace,
    CAST(balcony AS BOOLEAN) AS has_balcony,
    CAST(air_conditioning AS BOOLEAN) AS has_ac,
    CAST(security AS BOOLEAN) AS has_security,
    condition,
    description,
    published_at
FROM source
