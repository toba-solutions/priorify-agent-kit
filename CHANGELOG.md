# Changelog

All notable changes to this project will be documented in this file. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-10-30

### Added

- Live agent sessions in the new `priorify-agent-sessions` skill:
  `start_agent_session`, `report_agent_session`,
  `open_agent_session_question`, `resolve_agent_session_question`,
  `end_agent_session`, and `list_agent_sessions`. It covers the stable
  `client_session_key`, reporting at milestones only, questions a person
  answers in the chat, the three outcomes, and why a session never claims,
  completes, or authorizes anything.
- The project-instructions snippet that makes an agent report each chat, in the
  README.

## [0.4.0] - 2026-10-30

### Added

- Sub-tasks and links between tasks: `put_task` with `parent_task_id`,
  `list_task_relations`, `put_task_relation`, and `remove_task_relation`,
  including how to close a duplicate.
- The shared manual board order: `reorder_tasks` and `manual_position` in
  `list_tasks`.
- Comment threads, mentions, and reactions: `add_task_comment` with
  `parent_comment_id` and the mention syntax, `resolve_task_comment_thread`,
  and `put_task_comment_reaction`.
- Saved task views: `list_task_views` and the filter syntax views use.
- Agent work: inbox mentions and `mark_task_mentions_read`, and work that
  waits on open blocking tasks (`task_blocked`, `task_blockers`).

## [0.3.0] - 2026-10-26

### Added

- Custom task board columns: `list_task_columns` and `put_task` with
  `board_column_id`.
- Completeness checks that name what is missing, what satisfies each check,
  and which gaps need a person; scores in `list_products`.
- Metrics snapshots as structured timeline events.

### Changed

- Say that ids are omitted on create, that the first asset of a type becomes
  current, and that integration setup requests need only integrations write.

## [0.2.1] - 2026-10-26

### Changed

- Name the product Priorify.app in every skill, manifest, and package README.

## [0.2.0] - 2026-10-26

### Changed

- Teach product operations the project, search, store, portfolio, upload, and
  workflow lifecycles now exposed by the Priorify.app MCP server.
- Keep owned social accounts, calendar items, product surfaces, and earned
  placements distinct.
- Require delegated work to respect dependency blocks, recommendation-only
  assignment, and human intervention answers.
- Tell Grok operators to refresh a cached MCP session after a catalogue change.
- Add a lockfile for the dependency-free package so the push-time audit can run.
- Teach product operations the Knowledge lifecycle: scoped collections, hidden
  private collections and the access handoff, page revisions, file uploads and
  authenticated downloads, links, tasks from pages, and public-sharing consent.
- Document `put_task` waiting details and how to clear them.
- Document `delete_budget_settings` for removing one currency's budget limits.

## [0.1.0] - 2026-08-25

### Added

- Portable Agent Plugins package for the hosted Priorify.app MCP server.
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

[Unreleased]: https://github.com/toba-solutions/priorify-agent-kit/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/toba-solutions/priorify-agent-kit/releases/tag/v0.2.1
[0.2.0]: https://github.com/toba-solutions/priorify-agent-kit/releases/tag/v0.2.0
[0.1.0]: https://github.com/toba-solutions/priorify-agent-kit/releases/tag/v0.1.0
