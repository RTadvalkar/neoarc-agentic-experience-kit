/**
 * neoarc-agentic-ui / trace / KnowledgeTrace
 *
 * Purpose: render one supplied `KnowledgeUsage` fact, visually
 * distinguishing retrieved/selected/supplied/cited per docs/07 §"Knowledge
 * usage" — never collapsing every usage into a single "used" concept.
 * `score` renders only when supplied and is never computed/defaulted.
 *
 * Input model: `usage: KnowledgeUsage`.
 */

import type { KnowledgeUsage, KnowledgeUsageCategory } from "../../neoarc-agentic-contracts/trace"
import { Badge, type BadgeProps } from "../primitives/badge"
import { cn } from "../lib/cn"

const categoryConfig: Record<KnowledgeUsageCategory, { label: string; tone: BadgeProps["tone"] }> = {
  retrieved: { label: "Retrieved", tone: "neutral" },
  selected: { label: "Selected", tone: "info" },
  supplied: { label: "Supplied", tone: "accent" },
  cited: { label: "Cited", tone: "success" },
}

export interface KnowledgeTraceProps {
  readonly usage: KnowledgeUsage
  readonly className?: string
}

export function KnowledgeTrace({ usage, className }: KnowledgeTraceProps) {
  const { label, tone } = categoryConfig[usage.usageCategory]

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={tone}>{label}</Badge>
        {usage.sourceType ? <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">{usage.sourceType}</span> : null}
        {typeof usage.score === "number" ? (
          <span className="text-xs text-[var(--neoarc-color-foreground-subtle)]">score {usage.score.toFixed(2)}</span>
        ) : null}
      </div>
      <span className="text-sm text-[var(--neoarc-color-foreground)]">
        {usage.title ?? (usage.knowledgeId ? <code className="text-xs">{usage.knowledgeId}</code> : "Knowledge")}
      </span>
    </div>
  )
}
