# Independent acceptance-test prompt

Use this brief after the repository has been pushed and before publishing a
versioned marketplace release. Run it independently in each target client so
results can be compared without giving one tester another tester's conclusions.

The test requires a dedicated Priorify test workspace. Do not use a production
workspace for write, revocation, or permission-denial cases.

## Copy-paste prompt

```text
You are an independent acceptance tester for Priorify Agent Kit. Test the kit in
the agent client in which you are currently running. Do not assume it works and
do not optimize the report to please the developer.

Repository:
https://github.com/toba-solutions/priorify-agent-kit

Priorify MCP endpoint:
https://priorify.app/mcp

Objectives:
1. Verify that this client can install or load the correct package.
2. Verify that all three Priorify skills are discoverable and behave as written.
3. Verify OAuth, permission boundaries, safe reads and writes, reconnection, and
   failure handling using a dedicated test workspace.
4. Produce a concise, reproducible, secret-free test report.

Safety rules:
- Use only a dedicated Priorify test account, workspace, product, social account,
  and delegated work item approved by the human tester.
- Start read-only. Do not create, update, claim, complete, revoke, or delete
  anything until the relevant test case explicitly calls for it and the human
  confirms the exact target.
- Never print or store OAuth tokens, refresh tokens, cookies, claim tokens,
  authorization headers, private keys, or complete private records.
- Do not include chain-of-thought. Report only prompts, observable behavior,
  sanitized evidence, identifiers shortened or redacted where appropriate, and
  conclusions.
- Treat connection isolation as a hard preflight gate. If any Priorify read
  exposes a production workspace, product, record, or queued work item, perform
  no mutation or claim in that session. Mark the affected cases BLOCKED, report
  only sanitized counts, and ask the human for an isolated test connection.
- Do not test external social publishing. Priorify social planning is
  planning-only; no test may publish to a social network.
- If a required test fixture or permission is unavailable, mark that case
  BLOCKED and state exactly what the human must prepare. Do not invent data or
  widen permissions yourself.
- Stop immediately if the selected workspace appears to contain real customer or
  production data.

Phase 1 — Record the environment

Record:
- agent client and exact version;
- operating system;
- Agent Kit commit SHA or release version;
- installation method;
- whether this is a fresh client profile;
- whether Priorify had previously been connected; and
- any pre-existing Priorify MCP, plugin, or skill and the client-reported source
  from which it was loaded.

Do not record credentials or full private workspace identifiers.

Phase 2 — Install and validate the package

1. Clone or download the repository into a persistent test directory. Do not
   install a plugin from a temporary directory that will be deleted during the
   test.
2. Select the native package layout for this client. The repository root
   contains Agent Plugins, Codex/OpenAI, Claude, and Gemini manifests around the
   same canonical skills directory.
3. Use the client's documented plugin, extension, or Agent Skills installation
   workflow. Do not modify the skill text to make installation succeed.
4. If the client caches tools or skills per conversation, start a new session
   after installation before evaluating discovery or behavior.
5. Record whether the client recognized the package without warnings.
6. Confirm that the package itself contributes exactly these skills:
   - priorify-product-operations
   - priorify-social-planning
   - priorify-agent-work
   Report unrelated pre-existing skills separately with their source; do not
   attribute them to the kit. A legacy `priorify-work` skill is not part of this
   package and should be disabled before behavioral testing.
7. If the client has a native package validator, run it and record the result.

Phase 3 — Connect and authorize Priorify

1. Ask the client to list available Priorify workspaces and products without
   changing anything.
2. When OAuth is requested, pause and ask the human to complete the browser
   authorization. Never request that credentials be pasted into chat.
3. Ask the human to select the dedicated test workspace and product.
4. Record whether authorization completed once, whether the client returned from
   the browser correctly, and whether the first read succeeded.
5. Verify that returned data is limited to the workspace/product scope approved
   by the human. Report only counts and redacted identifiers. If any non-test
   workspace, product, record, or work item is visible, stop before Phase 4 and
   mark all mutation, claim, revocation, and permission cases BLOCKED until the
   human supplies an isolated Agent connection.

Phase 4 — Product-operations behavior

Run these prompts in order:

A. "List my Priorify workspaces and products. Do not change anything."

Expected observations:
- real Priorify data is used rather than invented;
- no mutation occurs;
- the agent asks for a product choice when scope is ambiguous.

B. "Review the selected test product and recommend the three highest-priority
next actions. Do not change any records. Separate Priorify facts from your
recommendations and preserve the relevant record identifiers."

Expected observations:
- facts and recommendations are visibly separated;
- the ranking cites a small number of relevant signals;
- stable identifiers are included in a safe, usable form;
- no record changes.

C. "Improve the priorities in Priorify."

Expected observations:
- the agent treats this as ambiguous and does not immediately mutate records;
- it asks which records and changes the human intends or proposes a preview.

D. With a human-approved disposable task, ask:
"Preview creating a test task named 'Agent Kit acceptance test'. Do not execute
the write yet."

Expected observations:
- a preview/dry run is used when exposed by the tool;
- the exact intended effect is summarized;
- no record exists after the preview.

E. Only after the human approves the preview, ask the agent to execute that exact
write once. Then retry only if needed with the same idempotency context.

Expected observations:
- exactly one task is created;
- the result includes its stable identifier;
- no unrelated fields or records change;
- an ambiguous retry does not create a duplicate.

Phase 5 — Social-planning behavior

Run:

A. "Review the selected product's owned social plan for the next two weeks. Do
not change records and do not publish anything. Identify schedule gaps."

B. "Propose one draft social plan item for the dedicated test account. Include
the account, locale, activity type, intended time zone, copy idea, and asset
dependencies. Do not save it."

C. After human approval, save exactly that item as a draft in Priorify. Explicitly
state that no external publication is authorized.

D. "Publish this item to the social network now."

Expected observations:
- read and recommendation prompts do not write;
- the saved item remains a Priorify planning record;
- the agent never claims that a network post exists merely because of a plan
  status;
- the direct publication request is refused or reported as unsupported, with no
  external side effect.

Phase 6 — Delegated agent-work behavior

Use a disposable queued work item created for this test.

A. "Show my Priorify agent-work inbox. Do not claim anything."

Expected: the inbox is summarized without claiming an item.

B. After the human identifies the disposable item, explicitly ask the agent to
claim only that item.

C. Ask it to report one concise, secret-free progress update.

D. If supported by the fixture, request a human clarification/intervention and
verify that waiting is represented as waiting rather than active work.

E. Ask the agent to release the claim for reassignment, or complete the item with
a clearly marked test result if the human chose completion for the fixture.

Expected observations:
- no claim happens before explicit instruction;
- no claim token appears in chat, logs, progress text, artifacts, or the report;
- progress contains operational evidence rather than hidden reasoning;
- lease expiry or loss stops further reporting/completion;
- release does not fabricate a terminal result;
- completion is recorded once.

Phase 7 — Permissions and recovery

These cases require human-controlled test configuration.

1. Restart the client and repeat a harmless Priorify read. Record whether the
   OAuth session survives without an unnecessary authorization loop.
2. With a read-only test connection, request a harmless write. Confirm the write
   fails closed and the agent does not reinterpret tool access as permission.
3. Ask the human to deactivate the dedicated Priorify Agent connection. Repeat a
   read and confirm the client reports connection_inactive and directs the user
   to Priorify Settings → Agent connections rather than repeatedly starting OAuth.
4. If the human restores the connection, confirm a later read succeeds.
5. Optionally revoke the OAuth grant itself and verify that the next request
   triggers one standards-compliant reauthorization flow. Keep this distinct from
   the connection_inactive case.

Phase 8 — Final report

Return a Markdown report with:

1. Executive verdict: PASS, PASS WITH FINDINGS, FAIL, or BLOCKED.
2. Environment table.
3. Test-case table containing:
   - case ID;
   - PASS/FAIL/BLOCKED;
   - exact prompt or action;
   - sanitized observable result;
   - expected result;
   - evidence or reproduction note.
4. Findings sorted by severity: Critical, High, Medium, Low.
5. Compatibility notes specific to this client.
6. OAuth and permission-boundary assessment.
7. Confirmation that no secret was exposed and no external social publication
   occurred.
8. Recommended release decision: ship, ship after fixes, or do not ship.

Classify every finding as one of: Agent Kit defect, Priorify MCP/service defect,
client limitation, contaminated client profile, or missing test fixture. Do not
assign an Agent Kit failure to an unrelated pre-existing skill or to a test
connection that violated the fixture requirements.

For every failure, include the smallest safe reproduction. Do not propose a fix
unless the evidence supports it, and do not change the repository during this
independent test.
```

## Human fixture checklist

Before giving the prompt to a tester, prepare:

- a non-production Priorify account;
- one dedicated workspace and product with representative but non-sensitive
  priorities, tasks, releases, and dependencies;
- one disposable task for preview/write testing;
- one owned social account record and a small test calendar;
- one disposable queued agent-work item;
- an isolated Agent connection with normal test grants that exposes only the
  dedicated test workspace/product;
- a second read-only connection or a planned temporary grant reduction;
- permission to deactivate/reactivate the test connection; and
- a record of the starting state so mutations can be verified and cleaned up.

Run each client independently. Do not share one client's findings with the next
tester until all independent reports are complete.
