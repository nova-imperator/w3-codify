# PyTorch deep-dive

**Machine Learning & Deep Learning** · Advanced tier · downloadable study notes

---

PyTorch is the lingua franca of research and increasingly production.

• Tensors are NumPy arrays that live on GPU and track gradients.
• autograd builds a dynamic graph as you compute, so loss.backward() just works.
• nn.Module packages parameters + a forward().
• DataLoader handles batching, shuffling, and parallel loading.
• Move tensors and model to the same device (cuda).
• Checkpoint model.state_dict() so long runs survive crashes; track experiments with Weights & Biases.

The canonical training loop is the same every time: iterate batches → forward → loss → zero_grad → backward → step.

## Code

```python
for epoch in range(epochs):
    model.train()
    for xb, yb in train_loader:
        xb, yb = xb.to(device), yb.to(device)
        loss = loss_fn(model(xb), yb)
        opt.zero_grad(); loss.backward(); opt.step()
    # validate + checkpoint
    torch.save(model.state_dict(), f"ckpt_{epoch}.pt")
```

## Study image

The training loop you'll write a thousand times

## Checkpoint recap

1. **Why call `opt.zero_grad()` every step?**
   - Answer: PyTorch accumulates gradients by default; without it they sum across steps
   - Why: Gradients accumulate in `.grad` by default. Forgetting `zero_grad()` sums gradients across batches and corrupts the update.

---

© W3Codify — free during launch. Generated study notes.
