/**
 * neoarc-agentic-ui / foundation / ContextBreadcrumb
 *
 * Purpose: render a `ContextRef` parent chain (workspace/project/section...)
 * as a breadcrumb. The kit never interprets `kind`/`id` beyond display —
 * labels always come from the supplied `ContextRef`.
 *
 * Input model: `context: ContextRef` (its `.parent` chain is walked to build
 * the trail, root first).
 */

import * as React from "react"
import { ChevronRight } from "lucide-react"
import type { ContextRef } from "../../neoarc-agentic-contracts/foundation"
import { cn } from "../lib/cn"

export interface ContextBreadcrumbProps {
  readonly context: ContextRef
  readonly className?: string
}

function toChain(context: ContextRef): ContextRef[] {
  const chain: ContextRef[] = []
  let current: ContextRef | undefined = context
  while (current) {
    chain.unshift(current)
    current = current.parent
  }
  return chain
}

export function ContextBreadcrumb({ context, className }: ContextBreadcrumbProps) {
  const chain = toChain(context)

  return (
    <nav aria-label="Context" className={cn("flex min-w-0 items-center gap-1 text-xs", className)}>
      <ol className="flex min-w-0 items-center gap-1">
        {chain.map((entry, index) => {
          const isLast = index === chain.length - 1
          return (
            <li key={entry.id} className="flex min-w-0 items-center gap-1">
              <span
                className={cn(
                  "truncate",
                  isLast
                    ? "font-medium text-[var(--neoarc-color-foreground)]"
                    : "text-[var(--neoarc-color-foreground-muted)]",
                )}
                aria-current={isLast ? "location" : undefined}
              >
                {entry.label}
              </span>
              {!isLast ? (
                <ChevronRight aria-hidden="true" className="size-3 shrink-0 text-[var(--neoarc-color-foreground-subtle)]" />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
