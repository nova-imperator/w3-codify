# Cloud building blocks & the shared model

**Cloud Computing** · Basics tier · downloadable study notes

---

The cloud is someone else's computer rented by the second — but the value is the service models on top.

• IaaS (EC2): you manage the OS and up.
• PaaS (App Runner, Beanstalk): you bring code, they run the platform.
• SaaS (Gmail): you just use it.

Regions are geographic areas; each contains multiple Availability Zones (isolated datacentres) — deploy across AZs for resilience.

The shared-responsibility model is the rule that prevents breaches: the provider secures the cloud *of* the cloud (hardware, hypervisor); you secure what's *in* it (your data, IAM, configs, patches). Misreading this line is behind most cloud incidents.

The Well-Architected pillars — operational excellence, security, reliability, performance, cost, sustainability — are the lens for every design decision.

> An S3 bucket left public is your responsibility, not AWS's. The provider secures infrastructure; you secure configuration and data.

## Study image

Provider secures the cloud; you secure what's in it

## Checkpoint recap

1. **Under the shared-responsibility model, a publicly exposed S3 bucket is whose fault?**
   - Answer: The customer's (configuration/data)
   - Why: Customers are responsible for data and configuration *in* the cloud; the provider secures the underlying infrastructure.

2. **Deploying across multiple Availability Zones primarily improves…**
   - Answer: Resilience to a datacentre failure
   - Why: AZs are isolated datacentres; spanning them survives a single-AZ outage.

---

© W3Codify — free during launch. Generated study notes.
