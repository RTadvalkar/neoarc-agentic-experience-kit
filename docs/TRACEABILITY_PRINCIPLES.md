# Traceability Principles (Slice 1 — Foundation)

These principles are permanent and cross-cutting — every later slice (Trace,
Provenance, Evidence, Human Interaction, Runtime) must be checked against
them. They summarize and operationalize `02B §Execution provenance, not
private reasoning` and `02B §Trace access and redaction` at the foundation
layer, ahead of Trace/Provenance getting their own slice (5).

## 1. Never expose or fabricate hidden reasoning

The kit has no concept of "model chain-of-thought" anywhere in its
contracts. `AgentSummary`, `RuntimeStatus`, and every later trace/provenance
type describe **observable or explicitly supplied** facts only:
instruction identity/version, user input, context, runtime recipe/model
policy identity, resolved model route (when supplied and authorized), safe
activity summaries, tool identity/sanitized summaries, knowledge/relationship
usage, evidence, human interactions, proposals, artifacts, timing/usage/
retries/failures. If a fact wasn't supplied, it does not appear — the kit
never invents a plausible-sounding value to fill a gap.

## 2. Unknown stays unknown

`shared.ts`'s `UnavailableReason` (`not_supplied | not_available | redacted |
insufficient_access`) and `foundation.ts`'s `RedactionState` exist precisely
so "we don't have this" can be rendered honestly and distinctly from "we
have this and it's empty" or "we have this and it's the value X." Every
foundation component that might not receive a value (`RedactedValue`,
`MetadataList`, `Timestamp`) renders one of these explicit states rather
than defaulting to blank, `"N/A"`, or a guessed value.

## 3. The UI is not security-authoritative

`TraceAccessLevel` and `PermissionSet` are **display vocabulary**, not
enforcement. A component that renders `TraceAccessLevel: "PLATFORM_ADMIN"`
does not thereby unlock anything — the product/backend adapter has already
decided what fields are supplied or redacted before the component ever sees
them. This principle is why `RedactedValue` never accepts "the real value,
plus a flag to hide it" as its prop shape — it only ever receives a
`RedactionState`, never the value it's supposedly redacting.

## 4. Correlation must use stable business identity

Repeated from `EVENT_MODEL.md` and `PROJECTION_MODEL.md` because it is a
traceability property, not just a technical one: an event or node's identity
must be a real business key (a message id, a run id, a task id) so replay
and live-append converge and so an operator reconstructing "what happened"
from a trace cannot be misled by a UI-only implementation detail like array
position.

## 5. Confidence/importance is never inferred client-side

Not yet exercised by any Slice 1 component (no scores are rendered yet), but
recorded here because it governs `KnowledgeUsage`/`RelationshipUsage`
contracts arriving in Slice 5 and `ConfidenceDisplay` in Slice 6: a
confidence or importance value is displayed **only if supplied**, never
computed by counting occurrences, guessing from traversal depth, or any
other client-side heuristic.

## How this shows up in Slice 1 code today

- `RedactedValue` renders `RedactionState.reason` as visible text (see
  `ACCESSIBILITY.md`) and never accepts the underlying value as a prop.
- `TraceVisibilityBadge` renders `TraceAccessLevel` as a label, purely
  informational — no component reads it to decide what else to show.
- `AgentStatusBadge`/`RuntimeStatusBadge` render only the lifecycle/runtime
  status actually supplied; there is no "computed" status.
- The Execution Lab's fixtures (`lib/showcase/fixtures.ts`) include an
  explicit example of a redacted metadata field to exercise this path.
