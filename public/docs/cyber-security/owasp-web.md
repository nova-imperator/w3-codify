# Web app security & OWASP Top 10

**Cyber Security** · Advanced tier · downloadable study notes

---

The OWASP Top 10 catalogues the most critical web risks. The heavy hitters:

• Injection (SQLi) — untrusted input becomes part of a query. Fix: parameterised queries, never string concatenation.
• XSS — attacker script runs in a victim's browser. Fix: context-aware output encoding + CSP.
• CSRF — a victim's browser is tricked into a state-changing request. Fix: anti-CSRF tokens, SameSite cookies.
• Broken access control — users reach data/actions they shouldn't. Fix: enforce authorization server-side on every request.
• SSRF — the server is coaxed into requesting attacker-chosen URLs. Fix: allow-list outbound destinations.
• Security misconfiguration — defaults, verbose errors, open buckets.

Practice in a deliberately vulnerable lab (DVWA/Juice Shop), never on real targets.

## Code

```python
# VULNERABLE — string concatenation allows SQLi
cur.execute("SELECT * FROM users WHERE name = '" + name + "'")

# SAFE — parameterised query
cur.execute("SELECT * FROM users WHERE name = %s", (name,))
```

## Study image

Injection, XSS, CSRF, access control and friends

## Checkpoint recap

1. **The correct fix for SQL injection is…**
   - Answer: Parameterised/prepared statements
   - Why: Parameterised queries separate code from data so input can never alter the query structure.

2. **Broken access control is best prevented by…**
   - Answer: Enforcing authorization server-side on every request
   - Why: Authorization must be enforced on the server; UI hiding and client checks are trivially bypassed.

---

© W3Codify — free during launch. Generated study notes.
