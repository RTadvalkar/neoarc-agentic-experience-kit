/**
 * neoarc-agentic-ui / trace / TraceRedactedValue
 *
 * Purpose: a kind-aware wrapper over the existing `RedactedValue` primitive
 * (`foundation/redacted-value.tsx`) for a Trace-specific `AvailableOr<T>`
 * field (currently `ResolvedModelTrace`'s `TraceModelRoute`). Composes the
 * existing primitive rather than duplicating its unavailable-reason
 * labeling or lock-icon treatment — this file only adapts the `AvailableOr`
 * shape into the `RedactionState` shape `RedactedValue` already knows how
 * to render.
 *
 * Input model: `value: AvailableOr<T>`, `render: (value: T) => ReactNode`.
 */

import * as React from "react"
import type { AvailableOr } from "../../neoarc-agentic-contracts/shared"
import { RedactedValue } from "../foundation/redacted-value"

export interface TraceRedactedValueProps<T> {
  readonly value: AvailableOr<T>
  readonly render: (value: T) => React.ReactNode
  readonly className?: string
}

export function TraceRedactedValue<T>({ value, render, className }: TraceRedactedValueProps<T>) {
  if (value.available) {
    return <>{render(value.value)}</>
  }

  return <RedactedValue state={{ redacted: true, reason: value.reason }} className={className} />
}
