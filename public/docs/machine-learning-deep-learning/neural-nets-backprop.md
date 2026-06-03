# Neural networks & backpropagation

**Machine Learning & Deep Learning** · Advanced tier · downloadable study notes

---

A neural network is a stack of linear → nonlinearity layers. The linear part is Wx + b; the nonlinearity (ReLU, GELU) is what lets the network model curves instead of just lines.

Forward pass: push inputs through the layers to get a prediction and a loss.

Backward pass (backprop): apply the chain rule from the loss backwards to compute ∂loss/∂W for every weight. Then gradient descent nudges each weight against its gradient:

W ← W − η · ∂loss/∂W

where η is the learning rate. SGD uses mini-batches; Adam adds per-parameter adaptive step sizes and momentum, which is why it's the default optimiser. Learning-rate schedules (warmup, cosine decay) squeeze out the last few points of accuracy.

## Code

```python
import torch, torch.nn as nn

net = nn.Sequential(
    nn.Linear(784, 256), nn.ReLU(),
    nn.Linear(256, 10),
)
opt = torch.optim.Adam(net.parameters(), lr=1e-3)
loss_fn = nn.CrossEntropyLoss()

# one training step
logits = net(x)               # forward
loss = loss_fn(logits, y)
opt.zero_grad()
loss.backward()               # backprop fills .grad
opt.step()                    # gradient descent update
```

## Study image

Forward computes loss; backprop computes every gradient

## Checkpoint recap

1. **What is the role of a nonlinear activation like ReLU?**
   - Answer: Without it, stacked linear layers collapse into a single linear map
   - Why: Composing linear layers is still linear. Nonlinearities give the network the capacity to model complex, curved functions.

2. **In `W ← W − η · grad`, what does a too-large η cause?**
   - Answer: Divergence / overshooting the minimum
   - Why: Too large a learning rate overshoots and the loss can oscillate or blow up; too small is stable but slow.

---

© W3Codify — free during launch. Generated study notes.
