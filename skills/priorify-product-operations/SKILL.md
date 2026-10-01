---
name: priorify-product-operations
description: Review, prioritize, plan, and update product operations in Priorify. Use when a request concerns workspaces, products, projects, tasks, workflows, releases, routines, architecture, budgets, monitoring, SEO, store metrics, portfolio readiness, integrations, uploads, approvals, or delivery state.
---

# Priorify Product Operations

Use the Priorify MCP server at `https://priorify.app/mcp` as the source of truth. If the user has not identified a workspace or product, resolve the available scope before querying deeper records. Tool schemas stay authoritative. Follow the lifecycle below when the similarly named call would do the wrong thing.

For reviews and prioritization:

1. Read the relevant product context and open work before recommending changes.
2. Separate recorded facts from your recommendations.
3. Explain the small number of signals that determine the proposed order, such as urgency, impact, dependencies, risk, and blocked work.
4. Preserve stable Priorify identifiers in the result so the user can follow up precisely.

Match the record's lifecycle:

- Projects. A task belongs to at most one project, or to none. Read `get_project_schema` before writing a new planning record type. Charter writes use `put_project`, planning records use `put_project_record`, and a native task on its current project uses `put_project_task`. Move a task by removing its project link, then linking the destination. Restore an archived project before changing its tasks. A projects grant still requires separate task write access for task edits. Saved project updates are immutable server-captured snapshots.
- Search and store. Period comparisons, coverage, cohorts, and position bands are `get_seo_analysis`. Save that comparison as a task with `create_seo_investigation`. The same evidence returns the existing task. The investigation name and copied link stay in the browser. Import one completed Search Console property window with `trigger_integration_sync` and `history_range`. `get_store_metric_summary` returns daily totals summed across territories. Per-country figures are paged `store_metric` rows.
- Portfolio and links. `get_portfolio_product_summaries` returns rows for products this connection may read. `compute_product_completeness` scores one product. Create a related-record link with `put_domain_record` and entity `record_link`. Remove that link with `remove_record_link` and leave both records in place. A link has no archive state and cannot be edited. Replace one by removing it and creating another.
- Files and credentials. File bytes never belong in a tool argument. Prepare the signed upload, upload the bytes to the returned URL, then finalize. That lifecycle covers task and comment attachments, identity images, assets, and expense documents. Long-lived integration credentials and authenticated monitor setup stay in the signed-in browser. Start Ads OAuth from MCP, let the browser complete consent, then read status and finalize from MCP.
- Workflows. A draft can change. Publishing creates an immutable version plus durable run state. `decide_workflow_step` submits requested input or resumes a delay. Human-approval gates are visible over MCP, and only a person in the Priorify dashboard can decide them. A workflows grant still requires the task, routine, or agent-work permission a node uses.

Creating a workspace, billing, legal acceptance, accepting an invitation, transferring ownership, deleting a workspace, inviting an owner, assigning an agent, changing agent capacity or routing, and answering an intervention stay in the signed-in UI. `save_workspace` updates an existing workspace. `recommend_work_assignment` explains eligibility and leaves the work unassigned.

Do not change priority, status, assignment, budgets, publication state, permissions, or other records unless the user asks for that change. Before a consequential write, summarize the intended effect and use Priorify's preview, expected-version, idempotency, grant, and approval mechanisms whenever the matching tool exposes them. Never bypass a pending approval or infer permission from access to the tool.

Treat authentication separately from workspace authorization. A transport-level OAuth challenge may require connection or token refresh. An authenticated `connection_inactive` result means the user should review **Settings → Agent connections** in Priorify; repeatedly starting OAuth will not repair that workspace binding. If a documented tool or schema field is missing after a Priorify release, refresh the client's MCP session and start a new conversation when that client caches tools per session.

When data is incomplete or a tool is unavailable, state the missing evidence and give the most useful next query or user action instead of inventing state.
