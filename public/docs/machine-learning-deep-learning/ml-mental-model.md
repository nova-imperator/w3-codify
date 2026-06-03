# The ML mental model & workflow

**Machine Learning & Deep Learning** · Basics tier · downloadable study notes

---

Machine learning is the discipline of writing programs that improve from data instead of from hand-coded rules. Before any model, fix the mental model.

The three learning paradigms
• Supervised — you have labelled examples (x, y); the model learns a mapping x → y (classification, regression).
• Unsupervised — only x; the model finds structure (clustering, dimensionality reduction).
• Reinforcement — an agent takes actions and learns from rewards.

The workflow that never changes
1. Frame the problem and pick a metric *before* modelling.
2. Split data into train / validation / test — and split *before* you look at it.
3. Fit on train, tune on validation, and touch test once.

Bias–variance: underfitting (high bias) means the model is too simple; overfitting (high variance) means it memorised the training set and fails to generalise. The whole game is finding the sweet spot.

Data leakage is the silent killer: any time information from the future or from the test set sneaks into training, your offline metrics lie. Scaling before splitting, target-derived features, and duplicated rows across splits are the classic culprits.

> Leakage check: fit every transformer (scalers, encoders, imputers) on the *training fold only*, then apply to validation/test. Fitting on the full dataset is the #1 cause of 'great offline, terrible in production'.

## Study image

Frame → split → fit → validate → test once

## Checkpoint recap

1. **You scale all features using the mean/std of the entire dataset, then split into train/test. What's wrong?**
   - Answer: Data leakage: test statistics influenced training
   - Why: The scaler saw test data, so information leaked into training and your test score is optimistic. Fit the scaler on train only.

2. **A model scores 99% on training data but 70% on validation. This is most likely…**
   - Answer: Overfitting (high variance)
   - Why: A large train/validation gap is the signature of overfitting — the model memorised the training set.

---

© W3Codify — free during launch. Generated study notes.
