# Authentication, sessions & access

**Cyber Security** · Advanced tier · downloadable study notes

---

Auth is where many breaches start.

• OAuth/OIDC delegate authentication; understand the flows and don't roll your own.
• JWT pitfalls — never trust the alg header (the alg:none attack), always verify the signature server-side, keep tokens short-lived.
• MFA stops most credential-stuffing; SSO centralises identity.
• Session management — secure, HttpOnly, SameSite cookies; rotate session IDs on login; expire idle sessions.
• Zero-trust — authenticate and authorise every request regardless of network location.

(This ties directly to W3Codify's own phone-OTP + JWT session auth.)

> The classic JWT bug: accepting alg: none or failing to verify the signature lets an attacker forge any token. Always pin the algorithm and verify server-side.

## Study image

Delegated auth + verified, short-lived tokens

## Checkpoint recap

1. **The JWT `alg: none` attack succeeds when the server…**
   - Answer: Fails to verify the token signature / accepts an unsigned algorithm
   - Why: If the server doesn't enforce a signed algorithm and verify it, an attacker forges tokens at will.

---

© W3Codify — free during launch. Generated study notes.
