# v0 Gate Checklist

Do not move to the next slice until the current gate passes.

---

# Gate 1 — Foundation

After Slice 1 verify:

- [ ] Project runs.
- [ ] `neoarc-agentic-contracts` exists.
- [ ] `neoarc-agentic-projection` exists.
- [ ] `neoarc-agentic-ui` exists.
- [ ] Reusable UI does not require projection.
- [ ] No DeepSeek/Cordis dependency.
- [ ] No backend/auth/storage implementation.
- [ ] Renderer registry exists.
- [ ] Generic node fallback exists or contract is established.
- [ ] Surface registry exists.
- [ ] Execution Lab loads.
- [ ] Light/dark theme works.
- [ ] Type/lint/build checks pass.
- [ ] Initial architecture docs exist.

---

# Gate 2 — Conversation & Replay

After Slice 2 verify:

- [ ] Conversation is controlled.
- [ ] Renderer registry is actually used.
- [ ] No central mega-switch for all future node types.
- [ ] Unknown node kind has safe fallback.
- [ ] Stable node keys survive updates.
- [ ] Streaming updates are visually smooth.
- [ ] Networking is not inside reusable components.
- [ ] Replay controls work.
- [ ] Complete replay and incremental append converge in tests/fixtures.
- [ ] No hidden chain-of-thought appears.

---

# Gate 3 — Human Interaction & Proposals

After Slice 3 verify:

- [ ] Clarification exists.
- [ ] Execution permission exists.
- [ ] Business proposal decision exists separately.
- [ ] Permission and proposal models are not one enum.
- [ ] UI waits for authoritative success state.
- [ ] Pending human interaction can be summarized.
- [ ] Stale/error/permission-blocked states exist.
- [ ] Semantic UI event payloads are visible in Execution Lab.

---

# Gate 4 — Runtime

After Slice 4 verify:

- [ ] Missions/runs/tasks are distinct enough to understand.
- [ ] Hierarchical workflow view works.
- [ ] Active/error branches remain visible.
- [ ] Waiting-for-human state is prominent.
- [ ] AgentTask can link supplied inputs/knowledge/relationships/tools/outputs.
- [ ] Missing links are not invented.
- [ ] Retry/cancel/error states exist.
- [ ] No workflow-engine-specific backend terminology leaks into generic contracts.

---

# Gate 5 — Trace & Provenance

After Slice 5 verify:

- [ ] Trace is chronological/forensic.
- [ ] Provenance is lineage-oriented.
- [ ] Chat/Activity/Trace/Provenance are distinct.
- [ ] System instruction identity/version can be represented.
- [ ] Runtime recipe identity/version can be represented.
- [ ] Model policy identity/version can be represented.
- [ ] Resolved model route is optional/permission-aware.
- [ ] Knowledge usage distinguishes retrieved/selected/supplied/cited.
- [ ] Relationship usage is explicit.
- [ ] Redaction/unavailable states work.
- [ ] No hidden chain-of-thought.
- [ ] Architecture Agent Run replays across all four views.

---

# Gate 6 — Evidence & Artifacts

After Slice 6 verify:

- [ ] Evidence composes with conversation/proposals/trace.
- [ ] Citation handling works.
- [ ] Missing/unavailable source has explicit state.
- [ ] Artifact versions/status work.
- [ ] Confidence is never fabricated.
- [ ] Provenance links use supplied data only.

---

# Gate 7 — Composite Experiences

After Slice 7 verify:

- [ ] Agent Workspace reuses shared components.
- [ ] Async Mission Center reuses shared runtime contracts.
- [ ] Proposal Review reuses proposal/evidence primitives.
- [ ] Execution Investigation reuses Trace/Provenance.
- [ ] Reference pages do not create duplicate component families.
- [ ] Integration Inspector explains model/event/UI flow.
- [ ] Showcase-only code is visibly separate.

---

# Gate 8 — Final Handoff

After Slice 8 verify:

- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Build passes.
- [ ] Tests pass if present.
- [ ] Public exports are clean.
- [ ] All canonical docs exist.
- [ ] Component manifest valid JSON.
- [ ] Event manifest valid JSON.
- [ ] Renderer manifest valid JSON.
- [ ] Surface manifest valid JSON.
- [ ] Golden sample execution events exist.
- [ ] Cursor handoff is complete.
- [ ] No critical knowledge remains only in v0 chat.
- [ ] Git checkpoint/commit exists before cancelling v0.
