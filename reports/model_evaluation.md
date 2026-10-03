# Property Valuation Model Evaluation & Explainability
**Champion Architecture:** `Random Forest Regressor`  
**Training Split:** Strict Temporal Walk-Forward (70% Train, 15% Val, 15% Test)

---

## 1. Validation Benchmark Comparison

| Model Architecture | Val $R^2$ | Val MAPE | Val MAE (MAD) | Val RMSE (MAD) |
| :--- | :--- | :--- | :--- | :--- |
| **Baseline (Ridge Regression)** | 0.8655 | 31.09% | 1,147,349.83 MAD | 1,940,800.5 MAD |
| **Random Forest Regressor** | 0.9358 | 13.94% | 734,745.63 MAD | 1,341,258.82 MAD |
| **HistGradientBoosting Regressor** | 0.9152 | 15.76% | 863,077.08 MAD | 1,541,070.45 MAD |

---

## 2. Out-of-Sample Test Set Performance (Unseen Listings)

- **Coefficient of Determination ($R^2$):** **0.8781** (High explanatory power across diverse property types)
- **Mean Absolute Percentage Error (MAPE):** **15.7%**
- **Mean Absolute Error (MAE):** **830,303.76 MAD**
- **Root Mean Squared Error (RMSE):** **1,351,583.64 MAD**

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
