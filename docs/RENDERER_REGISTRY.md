# Renderer Registry

`RendererRegistry<TRenderer>` (`src/neoarc-agentic-projection/renderer-registry.ts`)
is the mechanism that lets features add new `AgenticViewNode` renderers by
`(target, kind)` **without editing a central switch statement anywhere in the
kit**. This document is the extension recipe referenced by
`02A §Pluggable view nodes` and `13_CURSOR_WIRING_BLUEPRINT.md`.

## Why not a mega-switch

A single `switch (node.kind)` covering every feature's node kinds would mean
every new feature edits the same file, conflicts multiply across features
built in parallel, and unknown kinds have nowhere consistent to fall back
to. The registry inverts this: each feature registers its own renderers at
module-init time, and lookups always resolve to either a specific match or an
explicit fallback.

## Registering a renderer

```ts
import { RendererRegistry } from "@/src/neoarc-agentic-projection/renderer-registry"

type NodeRenderer = React.ComponentType<{ node: AgenticViewNode }>

const registry = new RendererRegistry<NodeRenderer>()

registry.register("conversation", "conversation.message", MessageNodeRenderer)
registry.registerFallback(GenericAgenticNodeFallback)
```

- Register by the **same `(target, kind)` pair** your `AgenticNodeDefinition`
  declares in its `match()`/`project()` — see `PROJECTION_MODEL.md`.
- Always register a fallback. `resolve()` only returns `undefined` if no
  fallback was ever registered, which the kit treats as a setup bug, not a
  normal runtime state.
- `registerAll([...])` registers many `(target, kind, renderer)` triples at
  once — useful for a feature package that owns several node kinds.

## Resolving at render time

```ts
const Renderer = registry.resolve(node.target, node.kind)
if (!Renderer) {
  // Only reachable if no fallback was registered — treat as a bug.
  return null
}
return <Renderer node={node} />
```

## Inspection

- `listRegistrations()` — every registered `(target, kind)` pair. The
  Execution Lab's registry status footer (`app/execution-lab/page.tsx`) uses
  this to show which renderers are live.
- `hasFallback()` — whether a fallback has been registered at all.
- `has(target, kind)` — whether a specific pair has an explicit registration
  (as opposed to resolving to the fallback).

## Slice 1 registration

`lib/showcase/registry-bootstrap.ts` registers exactly one specific renderer
— `("inspector", "foundation.summary")` → `FoundationSummaryCard` — plus the
`GenericAgenticNodeFallback` fallback used for the Execution Lab's `activity`
and `mission` scenario events, which intentionally have no specific renderer
yet, to demonstrate the fallback path end-to-end.

## Adding a new view node kind (future slices)

1. Define the payload/data types for the new kind in the relevant
   `neoarc-agentic-contracts` module.
2. Add an `AgenticNodeDefinition` in `neoarc-agentic-projection` (or a
   feature-local module that imports the seam types) with `match()` and
   `project()`.
3. Build the React renderer component in `neoarc-agentic-ui`.
4. Call `registry.register(target, kind, Renderer)` at your feature's
   bootstrap point — never inside the registry class itself.
5. Add a fixture/scenario exercising it in the Execution Lab.

This recipe is expanded with a full worked example in
`docs/ADDING_A_VIEW_NODE.md`, written in Slice 8 once multiple real node
families exist to draw the example from.
