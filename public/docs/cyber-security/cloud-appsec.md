# Cloud security & AppSec at scale

**Cyber Security** · GOD tier · downloadable study notes

---

Cloud security: the same shared-responsibility model from the cloud course, now from an attacker's view. IAM attack paths (over-permissive roles, privilege escalation chains) are the #1 cloud risk. Hunt misconfigurations (public buckets, open security groups) with CSPM tooling; secure containers/K8s (no root, signed images, network policies).

AppSec at scale:
• STRIDE threat modelling (Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation).
• API security — authn/authz on every endpoint, rate limits, schema validation.
• Supply-chain security — pin dependencies, generate an SBOM, scan for known CVEs.
• A secure SDLC bakes security into every phase, not a final gate.

## Study image

Misconfig hunting + threat modeling at scale

## Checkpoint recap

1. **The most common high-impact cloud security risk is…**
   - Answer: Over-permissive IAM roles / misconfigurations
   - Why: Excessive IAM permissions and misconfigurations (e.g., public buckets) drive most cloud breaches.

---

© W3Codify — free during launch. Generated study notes.
