# Linux & networking essentials

**Cloud Computing** · Basics tier · downloadable study notes

---

Cloud runs on Linux and networks; fluency here is non-negotiable.

Linux: the shell, processes, SSH key auth, file permissions (rwx / chmod), and package management. You'll live in a terminal.

Networking:
• IP / subnets / CIDR — 10.0.0.0/16 is a network of 65k addresses; the /N is how many bits are fixed.
• DNS resolves names → IPs (Route 53).
• HTTP/TLS — request/response + encryption in transit.
• Load balancing spreads traffic across healthy instances (ALB/NLB).
• The OSI model is a layered map: L3 = IP, L4 = TCP/UDP, L7 = HTTP.

## Code

```bash
# connect with a key, fix its perms first
chmod 600 key.pem
ssh -i key.pem ec2-user@13.205.83.45

# CIDR: /24 = 256 addresses (last octet varies)
# 10.0.1.0/24  ->  10.0.1.0 ... 10.0.1.255
```

## Study image

CIDR blocks and where each protocol lives

## Checkpoint recap

1. **How many usable-ish addresses does a /24 CIDR block contain?**
   - Answer: 256
   - Why: A /24 fixes 24 bits, leaving 8 for hosts → 256 addresses (minus a few reserved).

---

© W3Codify — free during launch. Generated study notes.
