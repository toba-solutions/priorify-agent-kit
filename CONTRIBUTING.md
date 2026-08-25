# Contributing

Thank you for helping make Priorify work naturally across agent clients.

## Before opening an issue

- Use [Priorify support](mailto:support@toba.solutions) for account,
  authentication, billing, or private workspace questions.
- Use a GitHub issue for reproducible packaging problems, compatibility gaps,
  documentation improvements, and skill behavior that can be discussed
  publicly.
- Report security vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## Development workflow

1. Fork the repository and create a focused branch.
2. Edit canonical skill content only under `skills/`.
3. Keep instructions portable. Vendor-specific UI or dependency metadata
   belongs in the appropriate manifest or `agents/` file.
4. Preserve user authorization boundaries. A skill must not convert tool
   availability into permission to mutate Priorify data.
5. Run:

   ```bash
   npm run check
   ```

6. Include the user scenario and observable behavior you tested in the pull
   request. Avoid tests that only match prose without exercising a meaningful
   invariant.

## Writing skills

- Keep the frontmatter name equal to the skill directory name.
- Make the description precise enough for reliable automatic discovery.
- Include only Priorify-specific guidance that changes agent decisions.
- Keep detailed schemas and tool catalogs out of `SKILL.md`; MCP tool schemas
  remain authoritative.
- Separate recorded Priorify facts from model recommendations.
- Never include secrets, customer information, chain-of-thought, or private
  reviewer material.

## Pull requests

Keep pull requests small and explain compatibility implications. By submitting
a contribution, you agree that it may be distributed under this repository's
MIT License.
