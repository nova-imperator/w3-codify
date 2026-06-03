# Training that actually converges

**Machine Learning & Deep Learning** · Advanced tier · downloadable study notes

---

Getting a deep net to train is mostly about controlling the optimisation landscape.

• Initialization (He/Xavier) keeps activations from exploding or vanishing at layer 0.
• Batch / layer norm re-centre activations each step, dramatically stabilising and speeding training.
• Dropout randomly zeroes activations to fight overfitting; weight decay (L2) penalises large weights.
• Early stopping halts when validation loss stops improving.
• Gradient clipping caps exploding gradients (essential for RNNs/Transformers).
• Mixed precision (fp16/bf16) roughly halves memory and speeds up training on modern GPUs.

The vanishing/exploding gradient problem — gradients shrinking or blowing up through many layers — is why residual connections and normalisation exist.

> Debugging recipe: if loss is NaN → lower the LR or clip gradients. If train loss won't drop → model too small or LR too low. If train ≪ val → regularise (dropout, weight decay, more data).

## Study image

Normalization + good init = faster, stabler convergence

## Checkpoint recap

1. **Your training loss suddenly becomes NaN. The fastest first fix is…**
   - Answer: Lower the learning rate / clip gradients
   - Why: NaN loss almost always means exploding gradients — reduce the LR or apply gradient clipping first.

---

© W3Codify — free during launch. Generated study notes.
