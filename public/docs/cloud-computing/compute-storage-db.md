# Compute, storage & managed databases

**Cloud Computing** · Advanced tier · downloadable study notes

---

The core building blocks you'll wire together constantly.

• Compute (EC2): virtual machines; choose instance families by workload (CPU/memory/GPU). Autoscaling adds/removes instances on demand.
• Storage: S3 (object storage — cheap, durable, versioned, lifecycle-tiered), EBS (block volumes attached to EC2).
• Managed DB (RDS/Aurora): the provider handles backups, patching, failover. Add read replicas to scale reads and caching (Redis/ElastiCache) to cut latency and DB load.
• DynamoDB/NoSQL for key-value/document workloads at massive scale.

Always enable backups + point-in-time recovery (PITR) — it's the difference between an incident and a catastrophe. (This mirrors W3Codify's own EC2 + RDS setup.)

> Read replicas scale reads, not writes. To scale writes you shard or move hot paths to a different store.

## Study image

EC2 + S3/EBS + RDS with replicas and cache

## Checkpoint recap

1. **Your read traffic is overwhelming the database. The standard fix is…**
   - Answer: Add read replicas
   - Why: Read replicas offload read queries; caching helps too. Writes need sharding, not replicas.

---

© W3Codify — free during launch. Generated study notes.
