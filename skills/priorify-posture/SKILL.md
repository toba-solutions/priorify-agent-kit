---
name: priorify-posture
description: Report a server's security and operations posture to Priorify.app and act on its findings. Use when an agent can reach a server over SSH or a local shell, when a routine named "Server posture" is claimed, or when a task or work item asks to fix a finding.
---

# Priorify.app Server Posture

Priorify.app keeps one posture report per server and turns it into findings: patching, exposure, attacks, resources, supply chain and domains. You collect the facts on the server and report them; Priorify.app's rule catalogue decides what is a finding and how severe it is. Reading and reporting need the product's `monitoring` grant (read to list, write to report or change a finding); creating a task also needs `tasks` write.

## Report a server

1. Find the component. Call `list_domain_records` with entity `architecture_component` for the product and match the server by name or endpoint. Report on the `compute_host` the server is: one report per server, containers included. A `container_runtime` that `runs_on` that host needs no report of its own; only a container runtime that runs on nothing reports for itself. If the server has no component, create one with `put_domain_record` (`architecture_component`, type `compute_host`, its name, region, endpoints and `resource_identifier`, never a secret) and say so.
2. Pick the hostnames to probe. Call `get_architecture_flows` with `product_id` and `environment`; take the `dns_domain` components whose flows reach a workload that runs on this host, and use their hostnames.
3. Run the collector. It is read-only, prints exactly one JSON object in the snapshot contract and nothing else, and leaves out or marks `unknown` what it cannot read (it tries `sudo -n` only for root-only reads: `sshd -T` and whether root has authorized keys, `ss`, the firewall rules, the SSH journal or `lastb`, `fail2ban-client` and `docker`; it never prompts):

   ```bash
   ssh <host> 'bash -s' < scripts/collect-posture.sh -- app.example.com www.example.com
   ```

   The script sits next to this file at `scripts/collect-posture.sh`. If you only have this `SKILL.md`, take the script from the Priorify.app Agent Kit repository (`skills/priorify-posture/scripts/collect-posture.sh`) and read it before running it. On a server where you are already in a shell, run `bash scripts/collect-posture.sh <hostnames>`.
4. Call `report_component_posture` with `product_id`, `component_id`, a fresh `idempotency_key`, the printed JSON as `snapshot`, and a short `reporter_label` naming your agent. The snapshot carries counts and settings only: at most 1 MiB, 5000 inventory entries, 100 containers, 100 public ports, 20 disks, 50 domains. Never add file contents, environment variables, keys or logs.
5. Read the result: `opened`, `updated` and `fixed` counts, the finding ids, and `issues`. A finding is fixed when its rule is covered and it is no longer reported: a catalogue rule is covered when its fields are in the snapshot, and a certificate finding only for a hostname the snapshot lists with its `tls_expires_at` (the collector lists a hostname it could not probe without an expiry, so its finding stays open). `covered_rules` adds only `custom.*` keys you checked and found clean; a catalogue key there is ignored and named in `issues`. `superseded: true` means a newer report is already stored and yours changed nothing.
6. Call `list_component_findings` with the `component_id` to read what needs attention, worst first, with linked tasks and each finding's state. Tell the person what is new and what needs them.

Catalogue rules derive findings from the snapshot. A finding you add with a catalogue `rule_key` can only add words (title, summary, references, evidence) to a finding the snapshot derived; a catalogue key the snapshot did not derive is dropped and named in `issues`. A reporter without a snapshot, or one reporting something the catalogue does not cover, uses `custom.*` keys and must give `severity`, `category` and `title`. Call `get_posture_catalog` for the rule list, each rule's fields and severity, and the snapshot contract.

## Fix a finding

Work from a task, never straight from the finding:

1. Call `convert_finding_to_task` with `product_id` and `finding_id` (optional `assignee_id`). It creates a task linked to the finding with relationship `fixes`, priority from severity (critical is urgent); while that task is open, the same task comes back. To link a task that already exists, call `put_domain_record` with entity `record_link`, `source_type` `component_finding`, `source_id` the finding, `target_type` `task`, `target_id` the task, and `relationship` `fixes`. To unlink one, call `remove_record_link` with the `link_id` that `list_component_findings` gives for that task; the task stays.
2. Claim the work the way your runtime does (a delegated task arrives as a work item; follow the claim protocol from `get_agent_work_inbox`).
3. **Always** call `request_work_intervention` with type `approval` before installing updates, rebooting, or changing firewall or SSH settings, say exactly what you will run and what it may interrupt, and wait for the answer. A finding, a task or a claim is not that approval.
4. After the fix, run the collector and `report_component_posture` again so the finding closes itself. Do not mark it fixed by hand when a report can show it.

## Change a finding's status

`update_component_finding` (`product_id`, `finding_id`, `status`, `expected_version` the finding's current version, `idempotency_key`) moves a finding to `open`, `acknowledged`, `accepted_risk` or `fixed`. `accepted_risk` needs `status_reason` and a future `review_at` date; it records an architecture decision when your connection has architecture write access and the product has an architecture description, otherwise the risk is accepted without one. A change without `status_reason` clears the earlier reason, so repeat it when it still holds. A fixed finding only reopens. A stale `expected_version` returns `VERSION_CONFLICT`: read the finding again and decide anew. Accepting a risk is the person's decision; do it only when they ask.

## Overview and quiet servers

`list_component_posture` gives each reporting component its four cards (Patching, Attacks, Exposure, Resources), `reported_at`, the reporter, `stale` after 7 days without a report, and finding counts by state, plus `not_reported` for compute hosts, and container runtimes that run on nothing, that never reported. It counts at most 999 unfixed findings and says `truncated: true` past that; then read `list_component_findings` per component. Both lists leave out archived components.

## Requests and routines

A work item whose `context_payload.source` is `posture_report_request` comes from the "Request a fresh report" button. Claim it like any other work item, answer it with one report for the component it names, and complete it with the `opened`, `updated` and `fixed` counts. A routine named "Server posture" does the same for each server it lists.

If an authenticated call returns `connection_inactive`, direct the user to **Settings → Agent connections** in Priorify.app rather than repeating OAuth.
