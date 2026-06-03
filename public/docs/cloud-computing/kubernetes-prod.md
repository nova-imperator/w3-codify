# Kubernetes in production

**Cloud Computing** · Advanced tier · downloadable study notes

---

Kubernetes orchestrates containers across a cluster.

• Pod — the smallest unit, one or more containers.
• Deployment — declares desired replicas and handles rolling updates.
• Service — stable network endpoint for a set of pods; Ingress routes external HTTP.
• ConfigMaps/Secrets inject configuration.
• HPA autoscales pods on CPU/custom metrics.
• Health checks (liveness/readiness probes) let Kubernetes restart or hold traffic.
• Helm templates and versions your manifests; deploy with rolling or canary strategies.

A CrashLoopBackOff means a container keeps dying and restarting — check logs, the readiness probe, and resource limits first.

> Always set CPU/memory requests and limits. Without them one pod can starve the node and trigger cascading evictions.

## Study image

Deployment → Pods → Service → Ingress

## Checkpoint recap

1. **A pod is stuck in CrashLoopBackOff. The best first step is…**
   - Answer: Check the container logs and readiness/liveness probes
   - Why: CrashLoopBackOff = container repeatedly exiting; logs and probe/resource config reveal why.

2. **Which object gives a set of pods a stable network endpoint?**
   - Answer: Service
   - Why: A Service provides a stable virtual IP/DNS name in front of ephemeral pods.

---

© W3Codify — free during launch. Generated study notes.
