# Tooling: Burp, nmap & traffic analysis

**Cyber Security** · Advanced tier · downloadable study notes

---

Pentesting tools, used only within authorised scope:

• nmap — host discovery, port scanning, service/version enumeration. The recon foundation.
• Burp Suite — an intercepting proxy. Repeater replays/edits requests; Intruder automates payloads; the proxy reveals everything the browser sends.
• Wireshark — packet capture and analysis; read a pcap to understand traffic, spot plaintext creds, or analyse an attack.
• Metasploit — exploitation framework, lab-only.

Recon → enumeration → exploitation → reporting is the methodology; thorough recon makes the rest easy.

## Code

```bash
# service + version scan of an AUTHORIZED target
nmap -sV -sC -p- 10.0.10.5

# -sV  detect versions   -sC  default scripts   -p-  all ports
```

## Study image

Recon → enumerate → exploit → report

## Checkpoint recap

1. **Which Burp Suite tool replays and manually tweaks a single HTTP request?**
   - Answer: Repeater
   - Why: Repeater is for manual request replay/editing; Intruder automates payload sets.

---

© W3Codify — free during launch. Generated study notes.
