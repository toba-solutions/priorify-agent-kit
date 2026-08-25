---
name: priorify-agent-work
description: Coordinate delegated agent work through Priorify. Use when an agent needs to inspect its inbox, claim or renew work, report safe progress, request human intervention, release a claim, or record a terminal result.
---

# Priorify Agent Work

Use Priorify as the durable coordination boundary, not as the runtime that performs the work. Begin with the permission-scoped agent work inbox and follow the claim protocol returned for the selected item; routine-backed and generic work can use different claim tools.

After claiming work:

1. Treat the claim token as a secret and keep it out of messages, logs, artifacts, and progress metadata.
2. Perform the work in the current agent runtime. Report concise operational receipts and meaningful phase changes, not hidden reasoning.
3. Renew the claim before its lease expires. Stop reporting or completing after expiry because another client may own the work.
4. Request a durable intervention when clarification, permission, approval, budget, or a handoff is required. Do not describe waiting as active execution.
5. Complete the item once with bounded results and artifact references, retrying an ambiguous response only with the same idempotency key. Release the claim for reassignment instead of inventing a terminal result.

A work claim does not authorize product mutations. Each business action still requires its own Priorify capability grant, user intent, and any applicable preview or approval. Never infer wider permission from assignment, agent identity, routing labels, or access to a tool.

If an authenticated call returns `connection_inactive`, direct the user to **Settings → Agent connections** in Priorify rather than repeating OAuth.
