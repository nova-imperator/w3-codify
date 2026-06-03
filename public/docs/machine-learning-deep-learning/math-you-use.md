# The math you actually use

**Machine Learning & Deep Learning** · Basics tier · downloadable study notes

---

You don't need proofs — you need fluent intuition for four things.

Linear algebra. Data is matrices; a layer is a matrix multiply Wx + b. Think in shapes: a batch of 32 images flattened to 784 features is (32, 784); a weight matrix (784, 128) maps it to (32, 128).

Calculus. Training = minimising a loss by following its gradient downhill. The chain rule is the entire reason backprop works: it composes local derivatives layer by layer.

Probability. Models output distributions. Cross-entropy compares a predicted distribution to the true label; softmax turns raw scores ("logits") into probabilities.

Maximum likelihood. "Pick the parameters that make the observed data most probable" — minimising cross-entropy or MSE is exactly MLE under the right noise assumption.

## Code

```python
import numpy as np

def softmax(logits):
    z = logits - logits.max()        # numerical stability
    e = np.exp(z)
    return e / e.sum()

def cross_entropy(probs, label):
    return -np.log(probs[label] + 1e-12)

p = softmax(np.array([2.0, 1.0, 0.1]))
print(p, cross_entropy(p, 0))
```

## Study image

Following the gradient downhill to a minimum

## Checkpoint recap

1. **Why subtract the max before exponentiating in softmax?**
   - Answer: Numerical stability — avoids overflow in exp()
   - Why: Subtracting the max keeps exponents ≤ 0 so exp() never overflows; the resulting probabilities are unchanged.

---

© W3Codify — free during launch. Generated study notes.
