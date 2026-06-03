# Incident response & threat hunting

**Cyber Security** · GOD tier · downloadable study notes

---

When prevention fails, incident response limits the damage.

IR lifecycle: prepare → identify → contain → eradicate → recover → lessons learned. Speed of containment matters most. Memory/disk forensics reconstruct what happened; preserve evidence and chain of custody.

Threat hunting is proactive: form a hypothesis ("an attacker would do X"), search telemetry for it, and build a permanent detection from what you find. Adversary emulation (ATT&CK-driven) validates that your detections actually fire.

Every incident ends in a blameless post-mortem — fix the system, not the person.

> Hunt hypothesis-first: pick an ATT&CK technique, look for its footprints in your logs, and convert any finding into a durable detection rule.

## Study image

Prepare → identify → contain → eradicate → recover

## Checkpoint recap

1. **In incident response, the step that most limits damage is…**
   - Answer: Containment
   - Why: Fast containment stops the bleeding; eradication and recovery follow.

---

© W3Codify — free during launch. Generated study notes.
