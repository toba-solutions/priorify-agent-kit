# Changelog

All notable changes to this project will be documented in this file. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Teach product operations the project, search, store, portfolio, upload, and
  workflow lifecycles now exposed by the Priorify MCP server.
- Keep owned social accounts, calendar items, product surfaces, and earned
  placements distinct.
- Require delegated work to respect dependency blocks, recommendation-only
  assignment, and human intervention answers.
- Tell Grok operators to refresh a cached MCP session after a catalogue change.
- Add a lockfile for the dependency-free package so the push-time audit can run.

## [0.1.0] - 2026-08-25

### Added

- Portable Agent Plugins package for the hosted Priorify MCP server.
- Native ChatGPT/Codex, Claude, and Gemini package manifests.
- Product operations, social planning, and delegated agent-work skills.
- Deterministic package generation, validation, and release automation.
- Independent cross-client acceptance-test instructions for Claude, Grok, and
  other tool-using agents.
- Repository-owned branding assets and commit-pinned GitHub Actions.

### Changed

- Added Grok-specific installation, trust, persistent-clone, new-session, and
  legacy-skill collision guidance based on independent client acceptance.
- Strengthened the acceptance-test preflight so any production data visible to
  the connection blocks all mutations and claims.
- Required reports to distinguish kit defects from client-profile and fixture
  limitations.

[Unreleased]: https://github.com/toba-solutions/priorify-agent-kit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/toba-solutions/priorify-agent-kit/releases/tag/v0.1.0
