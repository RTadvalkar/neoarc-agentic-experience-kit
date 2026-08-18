# Accessibility (Slice 1 — Foundation)

Baseline accessibility commitments for every `neoarc-agentic-ui` component,
per `02B §UX character` ("keyboard friendly and accessible... explicit about
status, consequences, and uncertainty... Avoid... critical state available
only on hover").

## Baseline rules applied in Slice 1

- **Never hover-only.** Any status, badge, or state conveyed visually
  (color, icon) is also conveyed as text. `AgentStatusBadge`,
  `RuntimeStatusBadge`, `RiskBadge`, `CapabilityBadge`, and
  `TraceVisibilityBadge` all render a text label alongside their icon/color
  — none rely on a tooltip as the only source of the value.
- **Icons are decorative, not informative.** Every icon in a foundation
  component is paired with visible text and marked `aria-hidden` on the
  icon itself (via `VisuallyHidden` where a text label would otherwise be
  purely visual, e.g. `Spinner`'s `sr-only` label).
- **Live regions for async/streaming state.** `LoadingState` and `Spinner`
  use `role="status"` (`Spinner`) so assistive tech announces loading state
  changes without the consumer wiring anything extra.
- **Redaction is announced, not just styled.** `RedactedValue` renders an
  explicit textual reason (e.g. "Redacted", "Not available") rather than an
  empty or grayed-out box with no accessible name — see
  `TRACEABILITY_PRINCIPLES.md`.
- **Keyboard operability.** `EntitySwitcher` is a real `<button>`-triggered
  disclosure (via the underlying popover/menu primitive), not a
  `div`-with-`onClick`; focus order follows visual order in every
  foundation component.
- **Color is never the sole signal.** Tone-based components (`Badge`,
  status badges) pair color with distinct icon shapes and text, so the
  distinction survives grayscale/color-blind rendering.
- **`sr-only` for visually-redundant text.** `VisuallyHidden` is the shared
  primitive for this; `Spinner`'s built-in label uses it directly rather
  than each consumer reinventing an `sr-only` class.

## Execution Lab accessibility notes

- Scenario selector, tab bar, and theme toggle are implemented with real
  `<button>` elements with `aria-pressed`/`aria-selected` state, not styled
  `div`s.
- The render canvas's clickable node card has a visible focus ring and is
  reachable by keyboard (native `<button>` wrapper), consistent with
  `02B`'s "critical state available only on hover" prohibition — selecting
  a node to inspect must not require a mouse.

## What Slice 1 does not yet cover

- Full automated a11y audit tooling (axe or equivalent) — not wired into
  the build in Slice 1; this is explicitly one of Slice 8's hardening
  checklist items (`10_HARDEN_DOCUMENT_AND_CURSOR_HANDOFF.prompt.md`,
  "Accessibility pass").
- Screen-reader-specific testing of the four observability views
  (Chat/Activity/Trace/Provenance) as a whole — meaningful only once those
  views exist (Slice 2 forward).

## Rule for future slices

Every new interactive foundation/family component must satisfy the same
baseline: text-visible state, keyboard operability, no hover-only critical
information, `sr-only` labels via the shared `VisuallyHidden` primitive
rather than ad hoc classes. Gate checklists (`11_V0_GATE_CHECKLIST.md`)
should be read as including this baseline implicitly for every slice, even
where not spelled out per-item.
