# NeoArc Agentic Experience Kit — Master Implementation Plan

Status: **APPROVED WITH CORRECTIONS**
Scope: This document is an implementation-control artifact. It does not modify, replace, or supersede the authoritative specification pack under `/docs/00_START_HERE.md` through `/docs/17_FINAL_PACK_MANIFEST.md`. Where any statement here conflicts with the authoritative pack, the authoritative pack wins.

---

## 0. Approved corrections (authoritative for all slices)

### Correction 1 — Reusable design-token ownership

`app/globals.css` (the Next.js showcase) is **not** the canonical owner of NeoArc Agentic Experience Kit semantic design tokens.

Ownership direction (must always hold):

```text
src/neoarc-agentic-ui/styles/tokens.css   ← semantic token contract (owned by the kit)
src/neoarc-agentic-ui/styles/themes.css   ← light/dark theme values (owned by the kit)
              ↓ imported by
app/globals.css                           ← showcase host consumes/maps tokens for Tailwind utilities
```

Never the reverse. The kit must render correctly (via CSS custom properties consumed directly in component class names) even if a consuming application never adds the optional Tailwind `@theme` mapping.

### Correction 2 — Reusable primitive ownership

`src/neoarc-agentic-ui` must have a clean extraction boundary and must **not** be structurally dependent on the showcase application's root `/components/ui` directory.

- `/components/ui` may continue to exist as the default v0/shadcn host scaffold for showcase-only chrome (e.g. Execution Lab controls that are explicitly not part of the reusable kit).
- Reusable NeoArc components live under `src/neoarc-agentic-ui/primitives/` (NeoArc-owned adapted primitives: buttons, badges, surfaces, tabs-like structures) and `src/neoarc-agentic-ui/foundation/` (the foundation component family), consuming only the primitives layer, plain React, `class-variance-authority`, and the kit's own `cn` utility.
- The package must be extractable (copy `src/neoarc-agentic-contracts`, `src/neoarc-agentic-projection`, `src/neoarc-agentic-ui`) without also copying `app/` or `/components/ui`.

---

## 1. Approved 8-slice plan

| Slice | Name | Delivers | Depends on |
|---|---|---|---|
| 1 | Foundation, Contracts, Registries, Execution Lab | 3 `src/` roots, tokens/themes, foundation contracts, `AgenticEventEnvelope`, `AgenticUIEvent`, projection seam, Renderer Registry, Surface Registry, 17 foundation components, Execution Lab v1 | none (greenfield) |
| 2 | Conversation, Projection, Streaming, Replay | Conversation contracts, 10 node kinds, replay convergence, 17 components | Slice 1 |
| 3 | Human Interaction & Proposals | Execution permission model, business decision model (kept separate), 4 + 16 components | Slices 1–2 |
| 4 | Runtime Missions/Tasks/Workflows | Mission/run/task contracts, hierarchical workflow view, 19 components | Slices 1, 3 |
| 5 | Trace & Provenance | Trace/provenance contracts, redaction/access model, 20 + 9 components | Slices 1–4 |
| 6 | Evidence, Citations, Artifacts | Evidence/citation/artifact contracts, 12 components, cross-surface composition | Slices 2, 3, 5 |
| 7 | Composite Reference Experiences | 4 showcase reference pages, zero new component families | Slices 1–6 |
| 8 | Harden, Document, Cursor Handoff | Audit only, canonical docs, manifests, golden fixtures, Cursor handoff | Slices 1–7 |

Each slice is executed in its own v0 chat/task, gated by the matching section of `docs/11_V0_GATE_CHECKLIST.md`, repaired only via the bounded scope of `docs/12_FIX_CURRENT_GATE.prompt.md` on failure, and checkpointed before the next slice begins.

## 2. Architectural stop conditions (any slice)

Work stops and returns to the user for review if a slice would require:

- Next.js routing/image/server-action APIs, Vercel SDKs, DeepSeek Harness, or Cordis inside `src/neoarc-agentic-*`;
- backend API calls, authentication, storage, or model-provider calls from reusable code;
- collapsing execution permission and business decision into one model;
- a single central switch statement for all node kinds;
- fabricated provenance, confidence, or hidden chain-of-thought;
- `neoarc-agentic-ui` requiring `neoarc-agentic-projection` to function;
- `neoarc-agentic-ui` requiring `/components/ui` or `app/` to be copied for extraction.

---

## 3. Slice 1 detail (this task)

### In scope

- `src/neoarc-agentic-contracts/` — `AgentSummary`, `ActorSummary`, `ContextRef`, `PermissionSet`, `ActionAvailability`, `RuntimeStatus`, `RiskLevel`, `TraceAccessLevel`, `RedactionState`, `AgenticEventEnvelope` (+ correlation), `AgenticUIEvent`.
- `src/neoarc-agentic-projection/` — `AgenticNodeDefinition`, `AgenticViewNode`, `AgenticViewTarget`, `MatchResult`, `ProjectionContext`, `PublicationCadence`, Renderer Registry (target + kind keyed, generic fallback), Surface Registry (named surfaces, no plugin runtime).
- `src/neoarc-agentic-ui/` — kit-owned tokens/themes (Correction 1), kit-owned primitives (Correction 2), 17 foundation components, barrel exports.
- Showcase (`app/`) — theme provider/toggle, Execution Lab route (scenario selector, Chat/Activity/Trace/Provenance tabs, render canvas, normalized-input inspector, projected-node inspector, semantic UI event log, replay-control placeholders, light/dark toggle, explicit "showcase/development" labeling).
- Documentation — `docs/COMPONENT_CATALOG.md`, `docs/DATA_MODEL.md`, `docs/EVENT_MODEL.md`, `docs/PROJECTION_MODEL.md`, `docs/RENDERER_REGISTRY.md`, `docs/SURFACE_REGISTRY.md`, `docs/INTEGRATION_GUIDE.md`, `docs/ACCESSIBILITY.md`, `docs/TRACEABILITY_PRINCIPLES.md`, plus `docs/wiring/`, `docs/contracts/`, `docs/examples/` scaffolding.

### Out of scope (explicitly deferred)

Conversation, proposals, runtime missions/workflows, Trace/Provenance content, evidence/artifacts, backend APIs, authentication, persistence, model-provider integration, DeepSeek Harness, Cordis.

### Expected public contracts (Slice 1)

```text
AgentSummary, ActorSummary, ContextRef, PermissionSet, ActionAvailability,
RuntimeStatus, RiskLevel, TraceAccessLevel, RedactionState,
AgenticEventEnvelope, EventCorrelation, AgenticUIEvent,
AgenticNodeDefinition, AgenticViewNode, AgenticViewTarget, MatchResult,
ProjectionContext, PublicationCadence
```

### Expected components (foundation family, 17)

`AgentAvatar, AgentIdentity, AgentStatusBadge, RuntimeStatusBadge, CapabilityBadge, RiskBadge, ContextBreadcrumb, EntitySwitcher, SectionHeader, InlineNotice, EmptyState, LoadingState, PermissionBlockedState, Timestamp, MetadataList, RedactedValue, TraceVisibilityBadge`

### Verification

1. `pnpm install` (if needed), `pnpm exec tsc --noEmit` (typecheck), `pnpm lint`, `pnpm build`.
2. Manual/browser verification of the Execution Lab route and light/dark toggle.
3. Evaluate every Gate 1 item in `docs/11_V0_GATE_CHECKLIST.md`.

### Gate 1 criteria (from `docs/11_V0_GATE_CHECKLIST.md`)

- Project runs; all three `src/neoarc-agentic-*` roots exist; reusable UI does not require projection; no DeepSeek/Cordis dependency; no backend/auth/storage implementation; renderer registry exists with generic fallback; surface registry exists; Execution Lab loads; light/dark theme works; type/lint/build checks pass; initial architecture docs exist.

---

## 4. Dependency graph (all slices)

```text
Slice 1 (foundation) ──▶ Slice 2 (conversation) ──▶ Slice 3 (human interaction) ──▶ Slice 4 (runtime)
                                                              │                          │
                                                              └────────────┬─────────────┘
                                                                           ▼
                                                                   Slice 5 (trace/provenance)
                                                                           │
                                                                           ▼
                                                                   Slice 6 (evidence/artifacts)
                                                                           │
                                                                           ▼
                                                                   Slice 7 (composite experiences)
                                                                           │
                                                                           ▼
                                                                   Slice 8 (harden/handoff)
```

## 5. Change discipline

Before every future task in this repository: inspect current structure, preserve existing public contracts, avoid duplicate concepts, implement only the requested slice, run available type/lint/build checks, update contracts/docs/fixtures, update the Execution Lab when relevant, and summarize contract changes/assumptions at the end of the task. Do not replatform working areas merely for cleanup.
