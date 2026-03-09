# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the Sales Reputation Protocol specification, schemas, or reference implementations, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, email: **felipe@play2sell.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 48 hours.
- **Assessment**: Within 7 days.
- **Fix or mitigation**: Within 30 days for critical issues.

## Scope

This policy covers:
- The protocol specification documents
- JSON Schemas and JSON-LD contexts
- API specification (OpenAPI)
- Reference implementations (when available)

## Cryptographic Considerations

The protocol relies on several cryptographic primitives. If you discover weaknesses in:
- BBS+ signature schemes as used in SRP credentials
- DID resolution implementations
- Proof verification logic
- Hash anchoring mechanisms

These are considered high-priority security concerns.

## Recognition

We will credit reporters in our CHANGELOG (with permission) and in security advisories.
