# Surface Registry

`SurfaceRegistry<TExtension>` (`src/neoarc-agentic-projection/surface-registry.ts`)
is a lightweight, named extension-point registry for injecting content into
fixed slots of a host layout. It is deliberately **not** a general plugin
runtime — see `02A §Surface registry`.

## Initial named surfaces

| Surface | Typical use |
|---|---|
| `agent.header` | Agent identity/status area at the top of a workspace. |
| `agent.context` | Context breadcrumb / entity switcher area. |
| `conversation.before` | Content injected before the conversation stream. |
| `conversation.node` | Per-message/per-node injected content. |
| `conversation.after` | Content injected after the conversation stream. |
| `composer.before` | Content above the message composer. |
| `composer.main` | The composer itself (for full replacement scenarios). |
| `composer.after` | Content below the composer. |
| `inspector.tabs` | Additional inspector tabs (Trace/Provenance/etc.). |
| `workspace.actions` | Header-level action buttons for a workspace shell. |

`AgenticSurface = KnownAgenticSurface | string` — a product can register
under a brand-new surface name any time, without waiting for a kit release.

## Registering an extension

```ts
import { SurfaceRegistry } from "@/src/neoarc-agentic-projection/surface-registry"

type SurfaceExtension = React.ReactNode

const surfaces = new SurfaceRegistry<SurfaceExtension>()

surfaces.register({
  surface: "workspace.actions",
  id: "export-transcript-button",
  extension: <ExportTranscriptButton />,
  order: 10,
})
```

- `id` must be stable and unique per registration so it can be replaced
  (re-registering with the same `id` overwrites in place) or removed later
  via `unregister(surface, id)`.
- `order` controls render order within a surface (lower renders first,
  default `0`). Use it to control left-to-right or top-to-bottom placement
  when multiple features extend the same surface.

## Reading extensions

```ts
const actions = surfaces.list("workspace.actions") // readonly TExtension[], in order
```

Host layout components render whatever is registered for their surface, in
order, without knowing which feature registered it.

## Inspection

`listSurfaces()` returns every surface name that currently has at least one
registration — used for debugging and for a future Execution Lab surface
inspector (not built in Slice 1; the registry status footer currently only
surfaces the renderer registry, since no feature registers a surface
extension yet).

## What this is not

- Not a dependency graph or lifecycle system — there is no "this extension
  requires that extension" concept.
- Not dynamically loaded — registrations happen via direct module-level
  calls at app bootstrap, same as the renderer registry.
- Not a replacement for props/composition for anything that isn't a genuine
  "let another feature inject UI into my fixed layout" need. Most
  composition in the kit (e.g. `09_COMPOSITE_REFERENCE_EXPERIENCES`) should
  still prefer ordinary component composition over surfaces.

See `docs/ADDING_A_SURFACE_EXTENSION.md` (written in Slice 8) for a full
worked example once a real feature actually needs to extend a host surface.
