# Projection Model (Slice 1 — Foundation)

Owning package: `src/neoarc-agentic-projection`. This package is **optional**
— `neoarc-agentic-ui` must render correctly given view models directly (the
direct DTO → adapter → view model → component path) and never imports from
this package to do so. Projection is only for the second integration mode
described in `02A §Integration modes`:

```
backend/runtime event → product event adapter → AgenticEventEnvelope
  → optional projector → AgenticViewNode → Renderer Registry → controlled component
```

## Core types (`types.ts`)

| Type | Shape | Notes |
|---|---|---|
| `AgenticViewTarget` | `conversation \| activity \| trace \| provenance \| mission \| inspector` | Where a projected node is intended to render. New targets may be added later without changing meaning of existing ones. |
| `PublicationCadence` | `immediate \| animation-frame \| none` | `immediate` for terminal/structural changes; `animation-frame` coalesces high-frequency deltas; `none` lets the caller decide (e.g. batch replay). |
| `AgenticViewNodeVisibility` | `visible \| hidden \| collapsed` | Independent of the node's data. |
| `AgenticViewNode<TData>` | `key, kind, target, data, visibility, correlation?` | `key` **must** be a stable business identity — never derived from array position or "the latest unfinished item". |
| `MatchResult` | `{ matched: false } \| { matched: true, kind, target }` | Result of asking a node definition whether it recognizes an event. |
| `ProjectionContext` | `correlation?, findExistingNode?` | Passed into a definition's `project()`. Kept minimal in Slice 1. |
| `AgenticNodeDefinition<TPayload, TData>` | `kind, target, publicationCadence, match(), project()` | A feature-owned definition. Registering a new one never requires editing a central switch. |

## Replayability invariant

Because `AgenticViewNode.key` is required to be a stable business identity,
a projector that processes events one-by-one (live append) and one that
processes the same events all at once (full replay) must converge on the
same set of nodes keyed the same way. Slice 1 ships the seam and a single
foundation-scenario projector (`lib/showcase/generic-projector.ts`) as a
worked example; deterministic replay-convergence tests are formalized
starting in Slice 2 once a stateful node family (conversation) exists to
test against.

## Renderer Registry (`renderer-registry.ts`)

A generic `RendererRegistry<TRenderer>` keyed by `(target, kind)`:

- `register(target, kind, renderer)` / `registerAll(...)` — add renderers.
- `registerFallback(renderer)` — the renderer used when no `(target, kind)`
  match exists. **Every consumer must register a fallback** — see
  `RENDERER_REGISTRY.md`.
- `resolve(target, kind)` — returns the specific renderer, or the fallback,
  or `undefined` only if no fallback was ever registered.
- `unregister`, `has`, `listRegistrations()`, `hasFallback()` — inspection
  and lifecycle helpers used by the Execution Lab's registry status panel.

`TRenderer` is generic on purpose: `neoarc-agentic-ui` instantiates this with
a React component type (see `components/showcase/execution-lab/render-canvas.tsx`),
but the class itself has zero React or Next.js imports.

## Surface Registry (`surface-registry.ts`)

A named, ordered extension-point registry — deliberately **not** a general
plugin runtime (no lifecycle hooks, no dependency resolution, no dynamic
loading):

- `KnownAgenticSurface` — the ten initial named surfaces from `02A §Surface
  registry` (`agent.header`, `agent.context`, `conversation.before/node/after`,
  `composer.before/main/after`, `inspector.tabs`, `workspace.actions`).
- `AgenticSurface = KnownAgenticSurface | string` — products may register new
  surface names without a kit release.
- `register({ surface, extension, order?, id })` — `order` controls render
  order (lower first, default `0`); `id` allows a specific registration to be
  replaced or removed later.
- `list(surface)`, `listSurfaces()` — read access for the host layout and for
  Execution Lab inspection.

## What Slice 1 intentionally does not include

- No concrete `AgenticNodeDefinition`s for conversation, runtime, trace, or
  proposal event categories — those arrive with their respective slices.
- No React `<SurfaceSlot>`/`<RendererSlot>` host components yet — Slice 1
  only proves the registries work via the Execution Lab's render canvas,
  which resolves and renders directly. Reusable host components for surfaces
  are introduced when a feature actually needs one (Slice 2 forward).
