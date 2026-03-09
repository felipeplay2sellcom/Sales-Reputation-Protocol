# Contributing to the Sales Reputation Protocol

Thank you for your interest in contributing to the Sales Reputation Protocol (SRP). This document explains how to participate in the development of this open standard.

## Ways to Contribute

### 1. Report Issues
- Found a gap in the spec? [Open an issue](https://github.com/felipeplay2sellcom/Sales-Reputation-Protocol/issues).
- Found an inconsistency between documents? Report it.
- Have a use case that isn't covered? Tell us.

### 2. Propose Changes
- **Minor fixes** (typos, clarifications, formatting): Open a Pull Request directly.
- **Substantive changes** (new event types, scoring modifications, API changes): Submit an [RFC](rfcs/RFC-TEMPLATE.md) first.

### 3. Implement
- Build SDKs, tools, or integrations based on the protocol.
- Add your implementation to the [implementations list](docs/implementations.md).

### 4. Review
- Review open PRs and RFCs. Constructive feedback is valuable.

## Pull Request Process

1. **Fork** the repository and create a branch from `main`.
2. **Make your changes** following the style of existing documents.
3. **Update relevant documentation** if your change affects the spec, API, or schemas.
4. **Write a clear PR description** explaining what changed and why.
5. **Reference any related issues** or RFCs.

### PR Review

- PRs require at least **one maintainer approval** before merging.
- **Editorial changes** (typos, formatting, link fixes) are merged within 7 days.
- **Substantive changes** require an RFC and a 14-day review period.

## RFC Process

For significant changes to the protocol, submit a Request for Comments (RFC):

1. Copy `rfcs/RFC-TEMPLATE.md` to `rfcs/0000-your-proposal-name.md`.
2. Fill in the template with your proposal.
3. Open a PR with the RFC. The PR number becomes the RFC number.
4. The community has **14 days** to discuss the RFC.
5. Maintainers decide to **accept**, **revise**, or **defer** the RFC.

## Style Guide

- **Specification documents**: Use clear, precise language. Prefer "MUST", "SHOULD", "MAY" per [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).
- **Code examples**: Use JSON for data structures, TypeScript for code samples.
- **Schemas**: Follow [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html) conventions.
- **API**: Follow [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0) conventions.

## Code of Conduct

All participants are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inclusive experience for everyone.

## Questions?

- Open a [Discussion](https://github.com/felipeplay2sellcom/Sales-Reputation-Protocol/discussions) for general questions.
- Tag `@felipeplay2sellcom` for urgent matters.

## License

By contributing, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
