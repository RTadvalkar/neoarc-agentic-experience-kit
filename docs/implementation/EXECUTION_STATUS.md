# NeoArc Agentic Experience Kit — Execution Status

This file is the source of truth for build lifecycle state. It is updated as implementation progresses so repository state — not chat history — records what has actually been built and gated.

```text
Slice 1  COMPLETE
Gate 1   PASS (full — hardening pass closed the earlier lint deviation)

Slice 2  READY (Gate 1 passed)
Gate 2   NOT EVALUATED

Slice 3  BLOCKED BY GATE 2
Gate 3   NOT EVALUATED

Slice 4  BLOCKED BY GATE 3
Gate 4   NOT EVALUATED

Slice 5  BLOCKED BY GATE 4
Gate 5   NOT EVALUATED

Slice 6  BLOCKED BY GATE 5
Gate 6   NOT EVALUATED

Slice 7  BLOCKED BY GATE 6
Gate 7   NOT EVALUATED

Slice 8  BLOCKED BY GATE 7
Gate 8   NOT EVALUATED
```

## Log

- Master plan approved with two architectural corrections (token ownership, primitive ownership). See `MASTER_IMPLEMENTATION_PLAN.md`.
- Slice 1 implementation started.
- Slice 1 implementation complete: `src/neoarc-agentic-contracts`, `src/neoarc-agentic-projection`, `src/neoarc-agentic-ui` (17 foundation components + primitives + kit-owned tokens/themes), showcase theme wiring, and the Execution Lab route (`app/execution-lab/page.tsx`) with scenario selector, 4 observability tabs, raw-event/projected-node inspectors, live event log, and registry status footer.
- Verified in browser: light/dark theme toggle, node selection populating both inspectors, `inspector.node.select` UI event appearing in the event log, registry status footer reflecting live registrations.
- `npx tsc --noEmit` and `npx next build` both pass cleanly; both routes (`/`, `/execution-lab`) prerender as static content.
- Gate 1 evaluated against `11_V0_GATE_CHECKLIST.md`: all items pass except lint, which is not evaluable — this scaffold ships no ESLint config (`eslint.config.*` absent) and none was added, since introducing a new lint setup is a tooling decision outside Slice 1's scope and was not requested. Flagging per standing instruction rather than silently adding a dependency; typecheck + build are the enforced quality gates for this slice.
- Docs written: `COMPONENT_CATALOG.md`, `DATA_MODEL.md`, `EVENT_MODEL.md`, `PROJECTION_MODEL.md`, `RENDERER_REGISTRY.md`, `SURFACE_REGISTRY.md`, `INTEGRATION_GUIDE.md`, `ACCESSIBILITY.md`, `TRACEABILITY_PRINCIPLES.md`.
- **Gate 1 hardening pass** (closed the one flagged deviation plus three follow-up findings):
  - Added a real, working ESLint setup (`eslint.config.mjs`, flat config, `eslint@9` + `eslint-config-next`) — no longer just flagged and skipped. This surfaced two genuine React purity bugs, both fixed: `ThemeProvider` now synchronizes with `localStorage`/`matchMedia` via `useSyncExternalStore` instead of a two-render `useEffect(setState)` dance; `Timestamp` now reads `Date.now()` once through a lazy `useState` initializer instead of calling it directly in the render body.
  - Added a **Foundation Component Gallery** (`components/showcase/execution-lab/component-gallery/`, fixtures in `lib/showcase/gallery-fixtures.ts`) as a second Execution Lab mode alongside Scenario Replay (`LabModeSwitch`, `app/execution-lab/page.tsx`) — every one of the 17 foundation components plus the load-bearing primitives (Badge, Surface, Spinner) now has a live, prop/state-driven demo, independent of the event -> projection -> renderer path. Gallery mode keeps the semantic UI event log visible so interactive components (EntitySwitcher) prove out real `AgenticUIEvent` emission.
  - Rebuilt `EntitySwitcher` on `@base-ui/react`'s `Select` parts instead of a hand-rolled `<button>` + absolutely-positioned `<ul>` — correct opening/focus behavior, roving keyboard nav (arrows/Home/End/type-ahead), Escape/click-outside close, focus restoration, and full ARIA listbox/option semantics now come from the primitive rather than being asserted in docs without matching code. `@base-ui/react` is plain, framework-neutral React, consistent with kit portability rules. Updated `COMPONENT_CATALOG.md` and `ACCESSIBILITY.md` to describe the real implementation.
  - Normalized `RuntimeStatus`'s `"succeeded"` member to `"completed"` across `foundation.ts`, `RuntimeStatusBadge`, `lib/showcase/fixtures.ts`, and `DATA_MODEL.md`/`COMPONENT_CATALOG.md`, aligning it with the normalized runtime event vocabulary (`run.completed`, `task.completed`) documented in `EVENT_MODEL.md` and flagging that a richer `RunStatus` may still arrive in Slice 4.
  - Re-verified after the pass: `npx eslint .`, `npx tsc --noEmit`, and `npx next build` all pass cleanly; both routes still prerender as static content. Browser-verified in both light and dark themes: Component Gallery renders and scrolls correctly, `EntitySwitcher` opens via click, exposes `combobox`/`listbox`/`option` ARIA roles, supports selection, updates `activeId`, and emits a real `gallery.entity_switcher.select` `AgenticUIEvent` visible in the live event log; Scenario Replay mode continues to work unchanged after the mode-switch refactor.
- Slice 2 is unblocked pending user confirmation to proceed.
