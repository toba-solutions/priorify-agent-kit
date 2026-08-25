# Repository instructions

This repository publishes portable Agent Skills and platform wrappers for the
hosted Priorify MCP server.

- Treat `skills/` as the only canonical skill source. Never edit `dist/`.
- Keep every package version aligned with `package.json`.
- Keep credentials, reviewer accounts, customer data, and OAuth secrets out of
  the repository.
- Preserve the separation between installing a package, completing OAuth, and
  receiving Priorify workspace authorization.
- Do not weaken the write, approval, social-publication, or claim-token safety
  boundaries in a skill to make an example easier.
- Run `npm run check` after changing a skill or manifest.
- Run the native OpenAI, Claude, and Gemini validators when their CLIs are
  available.
