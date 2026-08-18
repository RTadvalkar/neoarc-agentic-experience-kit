/**
 * neoarc-agentic-ui / primitives / VisuallyHidden
 *
 * Screen-reader-only text helper, used throughout the foundation family to
 * keep status/risk/trace information available to assistive tech even when
 * it is conveyed visually via color/icon.
 */

import * as React from "react"

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}
