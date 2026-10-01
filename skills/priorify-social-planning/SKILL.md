---
name: priorify-social-planning
description: Plan and maintain owned social calendars in Priorify. Use when a request concerns social accounts, content ideas, drafts, schedules, recurring social work, approvals, or plan status; not for publishing directly to social networks.
---

# Priorify Social Planning

Use the Priorify MCP server at `https://priorify.app/mcp` as the source of truth. Resolve the workspace and product before reading its owned social accounts or calendar.

Start by reading the current social plan and the operation catalog when field choices or lifecycle rules are needed. Owned accounts are `social_account` records. Calendar entries are `social_plan_item` records. Attach recurring engagement with `put_social_routine_link`. Keep those three distinct from `platform_presence`, which is a deployable product surface, and from a `distribution_item` whose opportunity type is social, which is a third-party earned placement.

When proposing a plan, make the account, locale, activity type, intended date and time zone, draft copy, asset dependencies, and current status clear.

Priorify's social workflow records plans; it does not publish to external social networks. Never represent a planned, approved, or recorded-as-published item as proof that an external post exists. Do not invent handles, performance metrics, publication results, or provider state.

Reading and recommending does not authorize a write. Create or update social accounts, plan items, approval fields, or publication-state records only when the user asks. For a write, inspect the current record and schema first, preserve stable identifiers, preview with `dry_run` when available, and use expected versions and idempotency keys when exposed. Approval and publication lifecycle fields must remain internally consistent.

Treat authentication separately from workspace authorization. If an authenticated call returns `connection_inactive`, direct the user to **Settings → Agent connections** in Priorify rather than repeating OAuth.
