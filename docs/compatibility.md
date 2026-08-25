# Compatibility and installation

Priorify Agent Kit uses the open Agent Skills folder format for its canonical
instructions and supplies several thin package manifests around the same
`skills/` directory.

| Client family | Repository support | Release artifact |
| --- | --- | --- |
| Agent Plugins clients | Root `plugin.json`, `mcp.json`, and `skills/` | `priorify-agent-plugin-<version>.zip` |
| ChatGPT and Codex | Root `.codex-plugin/plugin.json`, `.mcp.json`, and `skills/` | `priorify-openai-<version>.zip` |
| Claude Code and Cowork | Root `.claude-plugin/plugin.json`, `.mcp.json`, and `skills/` | `priorify-claude-<version>.zip` |
| Gemini CLI | Root `gemini-extension.json` and `skills/` | `priorify-gemini-<version>.zip` |
| Skills-only clients | Root `skills/` or copied `.agents/skills/` directories | Any package containing `skills/` |

## Grok CLI

Grok can validate and install the Agent Plugins layout from a local clone:

```bash
grok plugin validate /absolute/path/to/priorify-agent-kit
grok plugin install /absolute/path/to/priorify-agent-kit --trust
```

Use a persistent clone rather than a temporary directory because the installed
plugin may retain a reference to that path. Review the cloned source before
accepting `--trust`.

Start a new Grok session after installation. An already-open conversation may
keep the skill and MCP advertisement with which it started even when
`grok inspect` can see the newly installed plugin.

Grok may also discover compatible skills from another client's configuration.
Before testing, use `grok inspect` to identify their source. A legacy skill named
`priorify-work` is not supplied by this kit; disable it in the client directory
that owns it, or test with a clean profile, so it cannot compete with:

- `priorify-product-operations`
- `priorify-social-planning`
- `priorify-agent-work`

Client output such as `1 skill dir(s)` refers to the plugin's one top-level
`skills/` directory, not the number of `SKILL.md` files beneath it. Likewise,
`skills/*/agents/openai.yaml` contains OpenAI-facing skill metadata; it is not a
top-level Grok agent definition.

## Standards and client documentation

- [Agent Skills specification](https://agentskills.io/specification)
- [Agent Plugins specification](https://agent-plugins.org/specification)
- [OpenAI skills](https://developers.openai.com/codex/skills)
- [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins)
- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Claude Code plugins](https://code.claude.com/docs/en/plugins)
- [Cursor plugins](https://cursor.com/docs/reference/plugins)
- [GitHub Copilot Agent Skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)
- [Gemini CLI Agent Skills](https://geminicli.com/docs/cli/using-agent-skills/)
- [Gemini CLI extensions](https://geminicli.com/docs/extensions/)
- [Grok skills and plugins](https://docs.x.ai/build/features/skills-plugins-marketplaces)

## Authentication

All packages point to `https://priorify.app/mcp`. The MCP client is responsible
for OAuth discovery, browser authorization, and secure credential storage. The
package contains no token and cannot pre-authorize a Priorify workspace.

After OAuth, Priorify still applies the exact Agent connection, workspace,
product, capability, access-level, and sensitive-action policy selected by the
user.

## Marketplace status

The source and release packages can be installed directly where clients permit
Git or ZIP installation. Marketplace availability is maintained separately
because every marketplace has its own review and publication process.
