# Governance

This document describes how the Sales Reputation Protocol (SRP) is governed.

## Principles

1. **Openness** — The protocol is developed in the open. All discussions, decisions, and changes happen on GitHub.
2. **Meritocracy** — Influence is earned through contributions, not affiliation.
3. **Consensus-seeking** — We aim for rough consensus. Unanimity is not required, but objections must be addressed.
4. **Vendor neutrality** — The protocol serves the ecosystem, not any single company.

## Roles

### Lead Maintainer

The Lead Maintainer has final authority on protocol decisions and is responsible for the overall direction of the project.

| Role | Person | GitHub |
|------|--------|--------|
| Lead Maintainer | Felipe Santos | [@felipeplay2sellcom](https://github.com/felipeplay2sellcom) |

### Core Maintainers

Core Maintainers review and merge PRs, participate in RFC decisions, and help shape the protocol direction. Core Maintainers are added by invitation from the Lead Maintainer based on sustained, high-quality contributions.

*Seeking initial Core Maintainers — see [Contributing](CONTRIBUTING.md).*

### Contributors

Anyone who submits a PR, opens an issue, reviews an RFC, or participates in discussions.

## Decision-Making Process

### Editorial Changes
Typos, formatting, clarifications that don't change protocol semantics.
- **Process**: PR + one maintainer approval.
- **Timeline**: Merged within 7 days.

### Substantive Changes
New features, modified behavior, API changes, scoring model adjustments.
- **Process**: RFC required → 14-day review → maintainer consensus.
- **Timeline**: 14–30 days.

### Breaking Changes
Changes that would make existing implementations non-conformant.
- **Process**: RFC required → 30-day review → explicit approval from Lead Maintainer.
- **Timeline**: 30–60 days.
- **Versioning**: Breaking changes trigger a new spec version.

## Versioning

The protocol uses **Semantic Versioning**:
- **PATCH** (0.1.x): Editorial fixes, clarifications.
- **MINOR** (0.x.0): New features, additive changes (backward-compatible).
- **MAJOR** (x.0.0): Breaking changes.

During the `0.x.y` phase, the protocol is in draft status and minor versions may include breaking changes.

## Conflict Resolution

1. Attempt to resolve through discussion on the relevant issue or PR.
2. If unresolved, escalate to Core Maintainers for a vote (simple majority).
3. If still unresolved, the Lead Maintainer makes the final decision.

## Future Governance

As the protocol matures and gains adoption, governance may transition to:
- A **Technical Steering Committee** with representatives from implementing organizations.
- A **neutral foundation** (e.g., under the Linux Foundation or similar body).

This transition will be proposed via RFC when the community reaches sufficient size and diversity.
