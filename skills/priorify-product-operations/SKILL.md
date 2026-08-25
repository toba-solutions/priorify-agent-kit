---
name: priorify-product-operations
description: Review, prioritize, plan, and update product operations in Priorify. Use when a request concerns Priorify workspaces, products, tasks, releases, routines, architecture, budgets, monitoring, or delivery state.
---

# Priorify Product Operations

Use the Priorify MCP server at `https://priorify.app/mcp` as the source of truth. If the user has not identified a workspace or product, resolve the available scope before querying deeper records.

For reviews and prioritization:

1. Read the relevant product context and open work before recommending changes.
2. Separate recorded facts from your recommendations.
3. Explain the small number of signals that determine the proposed order, such as urgency, impact, dependencies, risk, and blocked work.
4. Preserve stable Priorify identifiers in the result so the user can follow up precisely.

Do not change priority, status, assignment, budgets, publication state, permissions, or other records unless the user asks for that change. Before a consequential write, summarize the intended effect and use Priorify's preview, expected-version, idempotency, grant, and approval mechanisms whenever the matching tool exposes them. Never bypass a pending approval or infer permission from access to the tool.

Treat authentication separately from workspace authorization. A transport-level OAuth challenge may require connection or token refresh. An authenticated `connection_inactive` result means the user should review **Settings → Agent connections** in Priorify; repeatedly starting OAuth will not repair that workspace binding.

When data is incomplete or a tool is unavailable, state the missing evidence and give the most useful next query or user action instead of inventing state.
