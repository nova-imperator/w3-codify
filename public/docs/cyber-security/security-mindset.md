# Security fundamentals & threat models

**Cyber Security** · Basics tier · downloadable study notes

---

Security starts with a mindset, not a tool.

The CIA triad is the goal of all security:
• Confidentiality — only authorised parties can read data.
• Integrity — data isn't tampered with.
• Availability — systems stay up for legitimate users.

Threat modelling asks: what are we protecting, from whom, and how might they get in (the attack surface)? Defense-in-depth layers controls so one failure isn't fatal.

Ethics & authorization first. Every offensive technique in this course is for authorized, legal, defensive purposes only. Labs are isolated and consented. Never touch a system you don't own or have written permission to test.

> Authorization is the line between security research and a crime. Get written scope before any test. No exceptions.

## Study image

Confidentiality · Integrity · Availability, layered

## Checkpoint recap

1. **A ransomware attack that encrypts files and blocks access primarily violates…**
   - Answer: Availability (and often confidentiality)
   - Why: Locking out legitimate users destroys availability; exfiltration before encryption also breaks confidentiality.

2. **Before testing a client's web app, the non-negotiable first step is…**
   - Answer: Obtain written authorization and scope
   - Why: Written authorization defines legal scope; without it, testing is a crime.

---

© W3Codify — free during launch. Generated study notes.
