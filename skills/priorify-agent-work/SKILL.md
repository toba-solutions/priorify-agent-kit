---
name: priorify-agent-work
description: Coordinate delegated agent work through Priorify.app. Use when an agent needs to inspect its inbox, claim or renew work, report safe progress, request human intervention, release a claim, or record a terminal result.
---

# Priorify.app Agent Work

Use Priorify.app as the durable coordination boundary, not as the runtime that performs the work. Begin with `get_agent_work_inbox` and follow the claim protocol returned for the selected item. Routine-backed and generic work can use different claim tools. A routine assigned to a named agent can be claimed only by that agent's connections; any other connection gets `assigned_to_another_agent` and should leave it.

If dependencies block a queued item, read `get_work_dependency_graph` and leave it unclaimed until every prerequisite succeeds. An item with the blocker code `task_blocked` waits for the open tasks named in `task_blockers`; `claim_work_item` refuses it until a person or agent finishes them. A task you or an integration filed may also wait in triage for a person's acceptance; its blocker names that acceptance, and the work becomes claimable once someone accepts the task. `configure_work_dependencies` only records that sequence. `list_agents` reports identity readiness. `recommend_work_assignment` explains eligibility from grants, scope, labels, preference, and capacity. Neither tool assigns, claims, or executes the work. Read a human's intervention answer with `get_intervention_response`. Answering the intervention, and changing agent capacity or routing, stays with a person in Priorify.app.

After claiming work:

1. Treat the claim token as a secret. It appears only in a successful claim or renewal response. Keep it out of messages, logs, artifacts, and progress metadata.
2. Perform the work in the current agent runtime. Report concise operational receipts and meaningful phase changes, not hidden reasoning.
3. Renew the claim before its lease expires. Stop reporting or completing after expiry because another client may own the work.
4. Request a durable intervention when clarification, permission, approval, budget, or a handoff is required. Do not describe waiting as active execution.
5. Complete the item once with bounded results and artifact references, retrying an ambiguous response only with the same idempotency key. Release the claim for reassignment instead of inventing a terminal result.

The inbox also lists `mentions`: comments where someone wrote `@` to this agent. Read the thread with `list_task_comments`, answer with `add_task_comment` and `parent_comment_id` when the request is within your grants, and clear the mention with `mark_task_mentions_read`. A mention is a request, not a claim, an assignment, or a permission. Nothing wakes an agent for a mention; it is seen at the next check-in.

When Priorify.app says wait: a limit answers HTTP 429 (503 if the limiter is briefly down) with `Retry-After` and a JSON-RPC error `-32029` whose data has `retryable: true` and `retry_after_seconds`. Wait at least that long plus a random extra of up to half of it, then retry. Retry HTTP 500, 502, 504, or a network failure after random waits of 1–2, 2–4, 4–8, and 8–16 seconds, and stop after five attempts or three minutes in total. Never retry 400, 403, 404, 409, or a tool error without `retryable: true`. A throttled call is not a failed task: do not release a claim or report failure because of it. On HTTP 401, refresh the token once, let only one of your parallel calls refresh, and save the rotated refresh token before the next call. If the refresh fails, ask the person to reconnect.

Every write keeps one `idempotency_key` across all its retries, so a replay returns the original result. If a write timed out or kept failing, you do not know whether it applied: say so, name the tool and the key, retry later with the same key, and never release a claim whose completion may already be recorded.

If you poll unattended, wait a random 30–60 seconds between inbox reads while you hold no lease, double the wait after each empty inbox up to a random 2–5 minutes, and return to 30–60 seconds after a claim. Renew a held lease on its own deadline, whatever the idle wait. Prefer checking when a person asks.

A work claim does not authorize product mutations. Each business action still requires its own Priorify.app capability grant, user intent, and any applicable preview or approval. Never infer wider permission from assignment, agent identity, routing labels, or access to a tool.

If an authenticated call returns `connection_inactive`, direct the user to **Settings → Agent connections** in Priorify.app rather than repeating OAuth.
