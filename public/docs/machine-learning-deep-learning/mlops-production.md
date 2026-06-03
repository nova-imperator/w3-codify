# MLOps: serving, monitoring, CI/CD

**Machine Learning & Deep Learning** · GOD tier · downloadable study notes

---

A model in a notebook has zero value. MLOps is how it earns its keep in production.

• Versioning — version data (DVC) and models, not just code, so runs are reproducible.
• Serving — wrap the model in an API (FastAPI / TorchServe / vLLM), containerise with Docker, deploy to the cloud.
• Monitoring — track latency, errors, and data/concept drift (the live distribution diverging from training).
• A/B testing & shadow deploys — prove a new model is better before full rollout.
• CI/CD for ML — automated retraining, testing, and deployment pipelines, plus a feature store for consistent features across training and serving.

> Training/serving skew — features computed differently offline vs online — is the most common cause of 'great in eval, bad in prod'. A feature store fixes it.

## Study image

Version → train → serve → monitor → retrain

## Checkpoint recap

1. **Live accuracy slowly degrades over months though the code is unchanged. Most likely cause?**
   - Answer: Data/concept drift — the real-world distribution shifted
   - Why: Static models decay as the world changes (drift). Monitoring catches it and triggers retraining.

---

© W3Codify — free during launch. Generated study notes.
