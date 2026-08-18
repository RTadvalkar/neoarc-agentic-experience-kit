/**
 * neoarc-agentic-ui / trace / UserInputTrace
 *
 * Purpose: render the raw user input that started or continued a turn,
 * verbatim — never summarized or paraphrased by the kit.
 *
 * Input model: `detail: UserInputTraceDetail`.
 */

import type { UserInputTraceDetail } from "../../neoarc-agentic-contracts/trace"
import { cn } from "../lib/cn"

export interface UserInputTraceProps {
  readonly detail: UserInputTraceDetail
  readonly className?: string
}

export function UserInputTrace({ detail, className }: UserInputTraceProps) {
  return (
    <p className={cn("whitespace-pre-wrap text-sm leading-relaxed text-[var(--neoarc-color-foreground)]", className)}>
      {detail.text}
    </p>
  )
}
