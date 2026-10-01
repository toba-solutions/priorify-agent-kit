---
name: priorify-agent-work
description: Coordinate delegated agent work through Priorify. Use when an agent needs to inspect its inbox, claim or renew work, report safe progress, request human intervention, release a claim, or record a terminal result.
---

# Priorify Agent Work

Use Priorify as the durable coordination boundary, not as the runtime that performs the work. Begin with `get_agent_work_inbox` and follow the claim protocol returned for the selected item. Routine-backed and generic work can use different claim tools.

If dependencies block a queued item, read `get_work_dependency_graph` and leave it unclaimed until every prerequisite succeeds. `configure_work_dependencies` only records that sequence. `list_agents` reports identity readiness. `recommend_work_assignment` explains eligibility from grants, scope, labels, preference, and capacity. Neither tool assigns, claims, or executes the work. Read a human's intervention answer with `get_intervention_response`. Answering the intervention, and changing agent capacity or routing, stays with a person in Priorify.

After claiming work:

1. Treat the claim token as a secret. It appears only in a successful claim or renewal response. Keep it out of messages, logs, artifacts, and progress metadata.
2. Perform the work in the current agent runtime. Report concise operational receipts and meaningful phase changes, not hidden reasoning.
3. Renew the claim before its lease expires. Stop reporting or completing after expiry because another client may own the work.
4. Request a durable intervention when clarification, permission, approval, budget, or a handoff is required. Do not describe waiting as active execution.
5. Complete the item once with bounded results and artifact references, retrying an ambiguous response only with the same idempotency key. Release the claim for reassignment instead of inventing a terminal result.

A work claim does not authorize product mutations. Each business action still requires its own Priorify capability grant, user intent, and any applicable preview or approval. Never infer wider permission from assignment, agent identity, routing labels, or access to a tool.

If an authenticated call returns `connection_inactive`, direct the user to **Settings → Agent connections** in Priorify rather than repeating OAuth.
