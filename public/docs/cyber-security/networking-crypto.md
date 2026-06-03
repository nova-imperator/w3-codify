# Networking & cryptography for security

**Cyber Security** · Basics tier · downloadable study notes

---

Networking for defenders: TCP/IP, common ports/protocols (80 HTTP, 443 HTTPS, 22 SSH, 53 DNS), TLS, and the OSI model as a *layered defence* map. Linux hardening basics (least privilege, disable unused services) shrink the attack surface.

Cryptography essentials:
• Symmetric (AES) — one shared key, fast.
• Asymmetric (RSA/ECC) — public/private key pair; enables TLS and signatures.
• Hashing (SHA-256) is one-way — it's *not* encryption. Use it for integrity.
• Password storage must use slow, salted hashes: bcrypt/argon2, never plain SHA or (worse) plaintext.
• TLS/PKI combines asymmetric key exchange with symmetric bulk encryption.

> Hashing ≠ encryption. Encryption is reversible with a key; a cryptographic hash is one-way. Storing passwords 'encrypted' (reversibly) is a vulnerability — hash with bcrypt/argon2.

## Study image

Encrypt (reversible) vs hash (one-way)

## Checkpoint recap

1. **How should user passwords be stored?**
   - Answer: Salted + hashed with bcrypt/argon2
   - Why: Passwords need slow, salted one-way hashes (bcrypt/argon2); encryption is reversible and Base64 is not security.

2. **Which is a one-way function?**
   - Answer: SHA-256 hashing
   - Why: Hashing is irreversible by design; AES/RSA are reversible with the key.

---

© W3Codify — free during launch. Generated study notes.
