# Changelog

All notable changes to this project will be documented in this file. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.7.2] - 2026-11-04

### Changed

- Monitors: checks send the User-Agent
  `Priorify.app-Monitor/1.0 (+https://priorify.app)`. A 403 with a bot-challenge
  page means the site's firewall blocks the check; agents tell the owner to
  allow that User-Agent instead of reporting the site as down.

## [0.7.1] - 2026-11-04

### Changed

- Monitors: every plan schedules checks, and `list_monitors` returns
  `scheduled_checks` saying whether active monitors run on their schedules
  and why not. Agents tell the person the reason and use `run_monitor_check`
  instead of promising a schedule that will not run.

## [0.7.0] - 2026-11-03

### Added

- Task triage and response SLAs: `triage_task`, `list_task_triage_setup`,
  `put_task_intake_rule`, `put_task_sla_rule`, `save_task_triage_settings`, and
  the `triage` and `sla` filters of `list_tasks`. Delegated work on a task that
  waits for acceptance is not claimable until a person accepts it.
- Task templates (`list_task_templates`, `put_task_template`, `put_task`
  `template_id`) and category and label colours (`list_task_tag_colors`,
  `put_task_tag_color`).
- Inbox, task followers and reminders: `snooze_notifications`,
  `list_task_subscriptions`, `put_task_subscription`, `set_task_reminder`, and
  the `needs_you` and `include_snoozed` filters of `list_notifications`.
- Richer routines: hourly, monthly, quarterly and yearly schedules, start/end
  bounds, pause, `skip_routine_occurrence`, named-agent routines, revisions
  (`list_routine_revisions`, `restore_routine_revision`), `duplicate_routine`,
  and templates (`list_routine_templates`, `put_routine_template`).
- How to wait on rate limits (`-32029`, `retry_after_seconds`), refresh a
  token once, keep idempotency keys across retries, report unknown outcomes,
  and poll an idle inbox with backoff.

### Changed

- `list_task_comments` returns every body in full.
- New agent connections start without money and documents, governance, or
  public-sharing access; workspaces may require two-factor for owners and
  admins (`ADMIN_MFA_REQUIRED`).

## [0.6.0] - 2026-11-02

### Added

- The agent sessions skill teaches `wait_for_agent_session_answer`: after
  `open_agent_session_question`, call it with `max_wait_seconds: 20` in a loop
  and do nothing else while waiting, treat `resolved`, `withdrawn` and
  `no_questions` as the end of the loop, and after 30 minutes without an
  answer end the turn saying the question is still on the board and call the
  wait again on the next run. It describes the `acknowledged` answer (`text`,
  `option`, `answered_by`, `answered_at`), the `open` deadline result, and that
  the wait is free of agent-operation quota.
- An answer is a decision input, never a permission: the agent still closes the
  question with `resolve_agent_session_question` and its decision summary.
  `list_agent_sessions` shows question states, never answer text.
- Report at least every 15 minutes with `plan`, `current_step`, `next_step`
  and `decisions`; the project-instructions snippet in the README now carries
  both `product_id` and `workspace_id` and the new wait flow.

## [0.5.2] - 2026-10-30

### Fixed

- The agent sessions skill names `session_id` for the calls after
  `start_agent_session` and no longer says every call takes `product_id`;
  shortened to leave schema detail to the tools.

## [0.5.1] - 2026-10-30

### Fixed

- The agent sessions skill now carries the `connection_inactive` guidance every
  skill gives.

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
