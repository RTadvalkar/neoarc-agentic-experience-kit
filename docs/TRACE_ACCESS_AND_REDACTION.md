> **Execution provenance != hidden chain-of-thought.**

# Trace Access and Redaction (Slice 5 — Trace & Provenance)

This document is the policy contract referenced by `RedactedValue`'s own
doc comment in `COMPONENT_CATALOG.md`: **the UI is not security-
authoritative.** Every component in this kit that renders trace/provenance
content only ever displays what a product/backend adapter already decided
to supply. None of them ever fetch a broader payload and filter it
client-side, and none of them ever decide on their own that a field is too
sensitive to show — that decision is made upstream, once, by the adapter.

## 1. `TraceAccessLevel` — four supplied roles

```ts
type TraceAccessLevel = "USER" | "OPERATOR" | "DEVELOPER" | "PLATFORM_ADMIN"
```

Defined in `foundation.ts`, reused as-is everywhere it appears
(`ExecutionTraceSummary.accessLevel`, `ExecutionStartedPayload.accessLevel`)
— never re-typed into a parallel enum. `TraceVisibilityBadge`
(`src/neoarc-agentic-ui/foundation/trace-visibility-badge.tsx`) is the only
component whose job is to *label* which level a piece of content is scoped
to (`"User visible"` / `"Operator visible"` / `"Developer visible"` /
`"Platform admin visible"`). It renders a badge, nothing more — it does not
gate, hide, or conditionally render its own siblings based on the level it
displays. **Access enforcement is the product/backend adapter's job, every
time, with no exception anywhere in this kit.**

## 2. `RedactionState` and `UnavailableReason` — the withholding vocabulary

```ts
// shared.ts
type UnavailableReason =
  | "not_supplied"        // the adapter never received this fact upstream
  | "not_available"       // known to exist, but not obtainable right now
  | "redacted"            // deliberately withheld by policy
  | "insufficient_access" // the current viewer's role doesn't warrant it

// foundation.ts
interface RedactionState {
  readonly redacted: boolean
  readonly reason?: UnavailableReason
  readonly note?: string
}
```

Four distinct reasons, never collapsed into a single boolean or a generic
"hidden" flag — a viewer seeing `insufficient_access` should understand
that a different, more-privileged viewer might see this same field, while
`not_supplied` means no viewer will, because the fact never reached the
adapter in the first place. This distinction is exactly what lets the UI
stay honest about *why* something is missing instead of presenting every
gap identically.

`RedactedValue` (`src/neoarc-agentic-ui/foundation/redacted-value.tsx`) is
the primary renderer of this state:

- `state.redacted === false` — renders `children` (the real value) as-is.
- `state.redacted === true` — renders a locked, dashed-border chip labeled
  from `state.reason` (falling back to `"Redacted"` if no reason was
  supplied), with `state.note` surfaced both as a visible tooltip
  (`title`) and as `sr-only` text for screen readers.

`RedactedValue` never inspects `TraceAccessLevel` itself and never decides
redaction on its own — it only renders whatever `RedactionState` it is
handed. The decision of *which* reason applies, and whether a field is
redacted at all, is made entirely upstream.

## 3. `AvailableOr<T>` — the same policy, typed at the field level

```ts
interface Available<T> { readonly available: true; readonly value: T }
interface Unavailable { readonly available: false; readonly reason: UnavailableReason }
type AvailableOr<T> = Available<T> | Unavailable
```

Where `RedactionState` is a sidecar flag next to an already-present value,
`AvailableOr<T>` makes "this field may simply not exist for this viewer" a
first-class part of the type itself — there is no way to construct an
`AvailableOr<T>` that is simultaneously "available" and missing `value`, or
"unavailable" and missing `reason`. `TraceEventDetail`'s `"resolved-model"`
arm is the concrete example in this slice: `AvailableOr<TraceModelRoute>`,
because whether the resolved model route is shown at all is itself a
permission-aware decision (see `TRACE_MODEL.md` §1).

`TraceRedactedValue<T>` (`src/neoarc-agentic-ui/trace/trace-redacted-value.tsx`)
is a thin, kind-aware adapter that bridges `AvailableOr<T>` into the
`RedactionState` shape `RedactedValue` already knows how to render — it
composes the existing primitive rather than duplicating its unavailable-
reason labeling or lock-icon treatment:

```tsx
<TraceRedactedValue
  value={resolvedModelTraceEvent.detail.value}
  render={(route) => <ResolvedModelTrace route={route} />}
/>
```

If `value.available` is `true`, `render(value.value)` renders normally. If
`false`, it delegates to `RedactedValue` with
`{ redacted: true, reason: value.reason }` — the exact same visual
treatment every other redacted field in the kit gets, so a viewer learns
one visual language for "withheld" regardless of which contract shape
carries it.

## 4. What this policy explicitly forbids

Restated from `docs/02B_UX_TRACEABILITY_AND_HUMAN_CONTROL.prompt.md`
§"Trace access and redaction," because it is the rule most likely to be
violated by an integration under time pressure, not by the kit itself:

> Never reveal secrets, credentials, auth headers, or unsafe raw tool
> payloads merely because a high-level role is displayed.

Concretely, this means a product adapter must never respond to a
`PLATFORM_ADMIN`-scoped request by simply forwarding a raw backend payload
unfiltered — `TraceAccessLevel` labels *what was chosen to be shown*, it is
not a permission check the kit performs for the adapter. `ToolTraceDetail`
only ever carries `resultSummary?: string` — a sanitized summary — never
the tool's raw request/response payload, precisely so there is no field in
this contract an adapter could be tempted to dump verbatim regardless of
role. Any integration that needs to show more detail to a more-privileged
viewer does so by supplying a richer `resultSummary`, not by exposing a
different, unsanitized field gated on `TraceAccessLevel`.

## 5. Explicit states over silent gaps

Every component in the Trace/Provenance families renders one of a small,
enumerated set of honest states for missing data — never a blank space,
never a fabricated placeholder, and never a value the adapter didn't
actually supply:

| Situation | What renders |
|---|---|
| Field genuinely absent from the payload | `RedactedValue` with `reason: "not_supplied"`, or the field's own component-level empty state (e.g. `TraceUsageSummary` rendering "not supplied" for missing token counts) |
| Fact exists but adapter couldn't fetch it right now | `RedactedValue` with `reason: "not_available"` |
| Adapter deliberately withheld it | `RedactedValue` with `reason: "redacted"` |
| Viewer's role doesn't warrant it | `RedactedValue` with `reason: "insufficient_access"`, or `TraceRedactedValue` for an `AvailableOr<T>` field |
| A whole lineage/trace has zero entries | The containing component's own empty state (`ProvenanceSummaryBar` renders nothing for zero nodes; `TraceExplorer` shows its `EmptyState`) — never a fabricated single entry |

Component Gallery fixtures (`lib/showcase/trace-gallery-fixtures.ts`) cover
every one of these states independently of the event/projection path,
including a redacted `ToolTraceDetail`, a visible one, an
`insufficient_access` resolved-model route, and an empty
`ProvenanceLineage` — see `TRACE_REPLAY.md` for how the same honesty holds
up across a live replaying scenario rather than only in isolated fixtures.
