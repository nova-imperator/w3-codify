# Classic ML in practice

**Machine Learning & Deep Learning** · Basics tier · downloadable study notes

---

Before deep learning, master the workhorses — they win on tabular data constantly.

• Linear/logistic regression — fast, interpretable baselines. Always start here.
• Trees → ensembles — random forests (bagging) and gradient boosting (XGBoost/LightGBM) dominate Kaggle tabular competitions.
• k-means / PCA — clustering and dimensionality reduction for unsupervised structure.

Cross-validation (k-fold) gives a robust performance estimate instead of trusting one lucky split.

Pick the right metric. Accuracy is misleading on imbalanced data. Use precision when false positives are costly, recall when false negatives are costly, F1 to balance them, ROC-AUC for ranking quality, and RMSE/MAE for regression.

> Rule of thumb: gradient-boosted trees are the strongest default for tabular data; reach for deep nets when you have images, text, audio, or huge datasets.

## Study image

Precision vs recall vs F1 at a glance

## Checkpoint recap

1. **Fraud is 0.5% of transactions. Which metric is most misleading here?**
   - Answer: Plain accuracy
   - Why: A model that predicts 'never fraud' scores 99.5% accuracy while catching zero fraud. Accuracy is useless on heavy imbalance.

2. **Missing a cancer diagnosis is far worse than a false alarm. Optimise for…**
   - Answer: Recall
   - Why: Recall measures how many true positives you catch — you want to minimise missed cases (false negatives).

---

© W3Codify — free during launch. Generated study notes.
