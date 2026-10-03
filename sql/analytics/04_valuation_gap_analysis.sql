-- ==============================================================================
-- Query: Distribution of Valuation Gap Relative to Machine Learning Estimates
-- ==============================================================================

SELECT 
    pv.valuation_status,
    COUNT(*) AS listings_count,
    ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER())::numeric, 1) AS percentage_of_market,
    ROUND(AVG(p.price)::numeric, 0) AS avg_asking_price,
    ROUND(AVG(pv.predicted_price)::numeric, 0) AS avg_model_price,
    ROUND(AVG(pv.value_gap)::numeric, 0) AS avg_gap_mad,
    ROUND(AVG(pv.value_gap_percent)::numeric, 2) AS avg_gap_percent
FROM property_valuations pv
JOIN properties p ON pv.property_id = p.property_id
GROUP BY pv.valuation_status
ORDER BY avg_gap_percent DESC;
