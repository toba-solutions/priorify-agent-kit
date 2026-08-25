# Releasing

## Before tagging

1. Update the version in `package.json`, `plugin.json`,
   `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, and
   `gemini-extension.json`.
2. Move the relevant `CHANGELOG.md` entries from **Unreleased** into a heading
   for the new version and release date.
3. Run `npm run check`.
4. Run the native validators when available:

   ```bash
   python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py .
   claude plugin validate .
   gemini extensions validate .
   ```

5. Review the generated package trees under `dist/packages/` and confirm that
   no credential, reviewer account, private URL, or customer data is present.

## Tag and release

Commit the version change, then create and push a signed or annotated `vX.Y.Z`
tag. The release workflow verifies that the tag equals the manifest version,
builds four clean ZIP archives, creates SHA-256 checksums, and publishes a
GitHub release with generated notes.

Marketplace submissions remain explicit operator actions. Do not store portal
credentials or reviewer-account passwords in this repository or GitHub release
notes.
