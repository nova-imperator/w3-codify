# Multi-region & high availability

**Cloud Computing** · GOD tier · downloadable study notes

---

High availability is about surviving failure with minimal impact.

• Multi-AZ survives a datacentre outage; multi-region survives an entire region outage and serves users closer to home.
• Define your targets: RTO (how fast you recover) and RPO (how much data you can lose).
• DR strategies trade cost vs speed: backup-restore → pilot light → warm standby → active-active.
• Global data (replication, DynamoDB Global Tables) and edge (CloudFront) cut latency worldwide.

Active-active multi-region is the gold standard but the hardest — you must handle data consistency and conflict resolution.

> RTO = time to restore service; RPO = acceptable data loss window. They drive how much you spend on DR.

## Study image

Survive a region outage; serve users at the edge

## Checkpoint recap

1. **RPO (Recovery Point Objective) measures…**
   - Answer: How much data loss is acceptable
   - Why: RPO is the maximum tolerable data loss window; RTO is the time-to-recover.

---

© W3Codify — free during launch. Generated study notes.
