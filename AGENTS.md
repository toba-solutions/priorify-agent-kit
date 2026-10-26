# Repository instructions

This repository publishes portable Agent Skills and platform wrappers for the
hosted Priorify.app MCP server.

- Treat `skills/` as the only canonical skill source. Never edit `dist/`.
- Always write the product name as `Priorify.app`, never `Priorify` alone, in
  skills, manifests, READMEs, and release titles. Lowercase technical
  identifiers such as the `priorify` MCP server name and skill slugs stay as
  they are.
- Keep every package version aligned with `package.json`.
- Keep credentials, reviewer accounts, customer data, and OAuth secrets out of
  the repository.
- Preserve the separation between installing a package, completing OAuth, and
  receiving Priorify.app workspace authorization.
- Do not weaken the write, approval, social-publication, or claim-token safety
  boundaries in a skill to make an example easier.
- Run `npm run check` after changing a skill or manifest.
- Run the native OpenAI, Claude, and Gemini validators when their CLIs are
  available.
