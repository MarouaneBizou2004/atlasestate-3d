# Property Valuation Model Evaluation & Explainability
**Champion Architecture:** `Random Forest Regressor`  
**Training Split:** Strict Temporal Walk-Forward (70% Train, 15% Val, 15% Test)

---

## 1. Validation Benchmark Comparison

| Model Architecture | Val $R^2$ | Val MAPE | Val MAE (MAD) | Val RMSE (MAD) |
| :--- | :--- | :--- | :--- | :--- |
| **Baseline (Ridge Regression)** | 0.8842 | 27.94% | 990,213.27 MAD | 1,513,837.79 MAD |
| **Random Forest Regressor** | 0.9099 | 15.72% | 790,897.75 MAD | 1,335,189.04 MAD |
| **HistGradientBoosting Regressor** | 0.9037 | 15.29% | 796,226.32 MAD | 1,380,749.19 MAD |

---

## 2. Out-of-Sample Test Set Performance (Unseen Listings)

- **Coefficient of Determination ($R^2$):** **0.9239** (High explanatory power across diverse property types)
- **Mean Absolute Percentage Error (MAPE):** **14.3%**
- **Mean Absolute Error (MAE):** **735,144.2 MAD**
- **Root Mean Squared Error (RMSE):** **1,283,273.8 MAD**

---

## 3. Top Feature Contributions (Explainability)
1. **Living Surface Area ($m^2$):** Primary baseline driver across all asset types.
2. **Neighborhood Tier:** Significant premium for Palmeraie, Hivernage, and Gueliz over peripheral districts.
3. **Property Type:** High structural base value for traditional Riads and detached luxury villas.
4. **Distance to City Center:** Negative price gradient as distance from Gueliz Plaza increases.
5. **Private Pool & Garden:** Key premium features for villas and Riads.

---

## 4. Ethical Framing & Model Limitations
- The estimated market price represents a statistical approximation based on observed asking prices.
- It does not replace an official on-site notarized appraisal.
- Value gap classifications ("Above model estimate" / "Below model estimate") indicate relative deviation from statistical expectations, not definitive underpricing or overpricing.
