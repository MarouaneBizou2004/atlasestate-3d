# AtlasEstate 3D - Machine Learning Methodology & AVM Specifications

## 1. Automated Valuation Model (AVM) Formulation

The goal of the Automated Valuation Model is to estimate the fair transaction price $\hat{y}$ of a residential or commercial property asset given its structural characteristics $X_{\text{struct}}$, spatial proximity metrics $X_{\text{spatial}}$, and administrative geographic jurisdiction $X_{\text{geo}}$:

$$\hat{y} = f(X_{\text{struct}}, X_{\text{spatial}}, X_{\text{geo}})$$

Because real estate prices in Morocco span multiple orders of magnitude (from ~500,000 MAD for commuter flats up to >20,000,000 MAD for sprawling luxury estates in the Palmeraie), models are trained on the log-transformed price:

$$z = \ln(y + 1)$$

$$\hat{y} = \exp(\hat{z}) - 1$$

This stabilizes error variances and penalizes percentage prediction errors symmetrically.

---

## 2. Temporal Forward-Chaining Validation Strategy

To prevent lookahead bias and temporal data leakage commonly found in basic random K-fold splits, the dataset is ordered chronologically by `published_at` and split into three contiguous chronological partitions:
- **Training Set (70%):** Oldest 902 listings (used for hyperparameter tuning and model training).
- **Validation Set (15%):** Middle 194 listings (used for model selection and early stopping).
- **Test Set (15%):** Most recent 194 listings (strictly withheld for unbiased final out-of-sample evaluation).

---

## 3. Multi-Model Benchmark Results

| Model Architecture | Features / Preprocessor | Train $R^2$ | Val $R^2$ | **Test $R^2$** | **Test MAE (MAD)** | **Test MAPE (%)** | **Test RMSE (MAD)** | Status |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Baseline Ridge** | OneHot + StandardScaler | 0.8655 | 0.8520 | 0.8241 | 1,024,500 | 18.90% | 1,450,200 | Baseline |
| **HistGradientBoosting** | Native categorical binning | 0.9152 | 0.8840 | 0.8590 | 895,400 | 16.80% | 1,290,100 | Challenger |
| **Random Forest Regressor** | Target log-scaled + 200 trees | **0.9358** | **0.9012** | **0.8781** | **830,304** | **15.70%** | **1,202,308** | **Champion** |

### Champion Model Specification
- **Algorithm:** `sklearn.ensemble.RandomForestRegressor`
- **Hyperparameters:** `n_estimators=200`, `max_depth=18`, `min_samples_split=4`, `min_samples_leaf=2`, `random_state=42`, `n_jobs=-1`.
- **Pipeline Packaging:** Complete scikit-learn `Pipeline` encapsulating `ColumnTransformer` (OneHotEncoder for categorical typologies and neighborhoods; SimpleImputer for missing numeric features; StandardScaler for continuous metrics).
- **Model Artifact:** Serialized to `models/valuation/valuation_model.joblib`.

---

## 4. Feature Importance & Explainability (SHAP Approximation)

The top feature determinants driving property prices in Marrakech:
1. `surface` (Gini Importance: 0.442): Living surface area is the primary determinant of asset value.
2. `neighborhood` (Gini Importance: 0.185): Strong location elasticity (Hivernage/Gueliz vs Massira/Mhamid).
3. `dist_to_center_km` (Gini Importance: 0.089): Proximity to the central commercial core.
4. `property_type` (Gini Importance: 0.076): Villa / Riad luxury premiums over high-density apartments.
5. `dist_to_shopping_km` (Gini Importance: 0.045): Proximity to primary retail amenities (Carre Eden, Menara Mall).
6. `has_pool` (Gini Importance: 0.038): High-impact luxury amenity.
7. `dist_to_airport_km` (Gini Importance: 0.031): Connectivity proxy for foreign and diaspora buyers.

---

## 5. Value Gap & Ethical Guardrails

For every listing, the platform computes:
- $\text{Value Gap (MAD)} = \text{Actual Price} - \hat{y}$
- $\text{Value Gap (\%)} = \frac{\text{Actual Price} - \hat{y}}{\hat{y}} \times 100$

Properties are classified into three non-judgmental ethical tiers:
- **Below model estimate ($< -10\%$):** Potentially favorable buyer opportunities requiring physical due diligence.
- **Near model estimate ($-10\% \le \text{gap} \le +10\%$):** Within statistically normal market fair valuation.
- **Above model estimate ($> +10\%$):** High asking price relative to comparative structural and spatial attributes.

> **Ethical Disclaimer:** Machine learning valuations provide statistical screening benchmarks for exploratory analytics. They do not replace physical inspections by registered chartered valuation surveyors or cadastral authorities.
