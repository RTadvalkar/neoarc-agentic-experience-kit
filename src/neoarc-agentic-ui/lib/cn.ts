/**
 * neoarc-agentic-ui / lib / cn
 *
 * Kit-owned class-name utility. Deliberately duplicated rather than imported
 * from the showcase app's `@/lib/utils` — see Correction 2 in
 * docs/implementation/MASTER_IMPLEMENTATION_PLAN.md. `neoarc-agentic-ui`
 * must be extractable without also copying showcase application source.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
