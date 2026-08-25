<div align="center">
  <a href="https://priorify.app">
    <img src="assets/priorify-logo.png" alt="Priorify" width="112" height="112">
  </a>

  # Priorify Agent Kit

  **Give your coding agent a safe, shared operating context for product work.**

  [![Validate](https://github.com/toba-solutions/priorify-agent-kit/actions/workflows/validate.yml/badge.svg)](https://github.com/toba-solutions/priorify-agent-kit/actions/workflows/validate.yml)
  [![Release](https://img.shields.io/github/v/release/toba-solutions/priorify-agent-kit?display_name=tag)](https://github.com/toba-solutions/priorify-agent-kit/releases)
  [![License: MIT](https://img.shields.io/badge/License-MIT-C86B46.svg)](LICENSE)
  [![Agent Skills](https://img.shields.io/badge/standard-Agent%20Skills-2F6F66)](https://agentskills.io/)

  [Priorify](https://priorify.app) · [MCP documentation](https://priorify.app/docs/mcp) · [Releases](https://github.com/toba-solutions/priorify-agent-kit/releases)
</div>

Priorify Agent Kit is the official collection of portable Agent Skills and
plugin manifests for using [Priorify](https://priorify.app) through its hosted
MCP server. One repository works with Codex, Claude Code, Cursor, GitHub
Copilot, Gemini CLI, Grok, and other Agent Skills or Agent Plugins clients.

The kit contains instructions and connection metadata only. Product data stays
in Priorify, authentication uses OAuth, and every agent remains limited by the
workspace, product, capability, and approval boundaries selected by the user.

## Included skills

| Skill | Purpose |
| --- | --- |
| [`priorify-product-operations`](skills/priorify-product-operations/SKILL.md) | Review product context, prioritize work, plan delivery, and make authorized updates. |
| [`priorify-social-planning`](skills/priorify-social-planning/SKILL.md) | Review and maintain owned social calendars without pretending to publish externally. |
| [`priorify-agent-work`](skills/priorify-agent-work/SKILL.md) | Claim delegated work, report safe progress, request intervention, and return durable results. |

## Install

### Release and marketplace packages

Platform-specific archives are published on the
[latest release](https://github.com/toba-solutions/priorify-agent-kit/releases/latest):

| Client | Release package | Native manifest |
| --- | --- | --- |
| Cursor, VS Code/Copilot, Grok and Agent Plugins clients | `priorify-agent-plugin-<version>.zip` | [`plugin.json`](plugin.json) |
| ChatGPT marketplace and Codex | `priorify-openai-<version>.zip` | [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) |
| Claude Code and Cowork | `priorify-claude-<version>.zip` | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) |
| Gemini CLI | `priorify-gemini-<version>.zip` | [`gemini-extension.json`](gemini-extension.json) |

Clients that support Git or local ZIP installation can consume these packages
directly. ChatGPT availability requires approval and publication through
OpenAI's plugin directory; before that listing exists, the OpenAI archive is a
Codex/local-testing and marketplace-submission artifact. Other marketplace
listings will likewise be linked here only after approval.

### Install from source

Clone the repository:

```bash
git clone https://github.com/toba-solutions/priorify-agent-kit.git
cd priorify-agent-kit
```

Then use the native workflow for your client:

#### Claude Code

```bash
claude --plugin-dir /absolute/path/to/priorify-agent-kit
```

#### Gemini CLI

```bash
gemini extensions install https://github.com/toba-solutions/priorify-agent-kit
```

#### Grok CLI

Keep the clone in a persistent directory, then validate and install it:

```bash
grok plugin validate /absolute/path/to/priorify-agent-kit
grok plugin install /absolute/path/to/priorify-agent-kit --trust
```

Review the plugin before accepting `--trust`. Start a new Grok session after
installation so its advertised skill list and MCP configuration are refreshed.
If `grok inspect` shows a pre-existing `priorify-work` skill, disable that legacy
skill at its source before testing this kit; it is not part of Priorify Agent
Kit and can otherwise compete with the three canonical skills.

#### Agent Skills fallback

Codex, Cursor, GitHub Copilot, Gemini CLI, and other compatible clients can
discover skills placed in `.agents/skills`:

```bash
mkdir -p .agents/skills
cp -R /absolute/path/to/priorify-agent-kit/skills/* .agents/skills/
```

For native plugin installers, point the client at this repository or use its
platform-specific ZIP from a release. See [compatibility and installation
notes](docs/compatibility.md) for the supported package layouts.

## Connect Priorify

Every package points to the same Streamable HTTP MCP endpoint:

```text
https://priorify.app/mcp
```

Installation and authorization are separate. On first use, your client may ask
you to sign in to Priorify and approve a connection. That OAuth connection does
not automatically grant access to every workspace or capability.

If an authenticated call returns `connection_inactive`, open
**Priorify → Settings → Agent connections**. Repeating OAuth will not repair an
inactive workspace binding.

## Safety model

- Skills may recommend actions, but they do not authorize writes.
- Priority, status, assignment, budget, publication, and permission changes
  require explicit user intent.
- Priorify's previews, expected versions, idempotency keys, capability grants,
  and approval controls remain authoritative.
- Social planning records plans and lifecycle state; it does not publish to
  social networks.
- Agent-work claim tokens are secrets and must never appear in progress text,
  logs, or artifacts.
- No credentials or customer data are stored in this repository.

## Repository layout

```text
.
├── assets/                    # Repository-owned visual assets
├── skills/                    # Canonical portable skills
├── .codex-plugin/             # ChatGPT and Codex manifest
├── .claude-plugin/            # Claude plugin manifest
├── plugin.json                # Agent Plugins v1 manifest
├── mcp.json                   # Agent Plugins MCP connection
├── .mcp.json                  # Native OpenAI and Claude MCP connection
├── gemini-extension.json      # Gemini CLI extension manifest
├── scripts/                   # Build and validation tooling
└── dist/packages/             # Generated release packages (ignored by Git)
```

The root `skills/` directory is the only skill source of truth. Release bundles
are generated from it and must never be edited by hand.

## Development

Requirements: Node.js 22 or newer. No package installation is required.

```bash
npm run check
```

This builds the four release layouts and verifies manifest versions, canonical
skill metadata, MCP endpoints, repository URLs, package contents, and the
absence of credential-like material.

Optional native validation:

```bash
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py .
claude plugin validate .
gemini extensions validate .
```

See [CONTRIBUTING.md](CONTRIBUTING.md) before proposing changes and
[docs/releasing.md](docs/releasing.md) before creating a version tag.

For independent client acceptance, give a tester the copy-paste brief in
[docs/acceptance-test-prompt.md](docs/acceptance-test-prompt.md). It is designed
for Claude, Grok, and other tool-using agents and produces a comparable,
secret-free evidence report.

## Support and security

- Usage questions: [support@toba.solutions](mailto:support@toba.solutions)
- Product documentation: [priorify.app/docs/mcp](https://priorify.app/docs/mcp)
- Security reports: follow [SECURITY.md](SECURITY.md); do not open a public issue
  for a suspected vulnerability.

## License

The Agent Skills and packaging files in this repository are available under the
[MIT License](LICENSE). The Priorify service, trademarks, and hosted product are
not granted under this repository license.
