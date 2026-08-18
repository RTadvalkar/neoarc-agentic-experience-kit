"use client"

/**
 * components/showcase/execution-lab/lab-tab-bar
 *
 * SHOWCASE-ONLY. The Chat / Activity / Trace / Provenance tab bar required
 * by docs/03_BOOTSTRAP...prompt.md §10. Labels are the human-facing names
 * from docs/02B_INSTRUCTION_UX_TRACEABILITY_AND_HUMAN_CONTROL.md
 * §Alternate execution views; the underlying value is the matching
 * `AgenticViewTarget` ("conversation" for the Chat tab), since the kit's
 * view-target vocabulary and the UX's display vocabulary are deliberately
 * not required to match 1:1.
 */

import type { AgenticViewTarget } from "../../../src/neoarc-agentic-projection/types"
import { cn } from "../../../src/neoarc-agentic-ui/lib/cn"

export interface LabTab {
  readonly target: AgenticViewTarget
  readonly label: string
}

export const executionLabTabs: readonly LabTab[] = [
  { target: "conversation", label: "Chat" },
  { target: "activity", label: "Activity" },
  { target: "trace", label: "Trace" },
  { target: "provenance", label: "Provenance" },
  { target: "mission", label: "Mission" },
]

export interface LabTabBarProps {
  readonly activeTarget: AgenticViewTarget
  readonly onSelect: (target: AgenticViewTarget) => void
}

export function LabTabBar({ activeTarget, onSelect }: LabTabBarProps) {
  return (
    <div role="tablist" aria-label="Execution Lab view" className="flex items-center gap-1 border-b border-[var(--neoarc-color-border)]">
      {executionLabTabs.map((tab) => {
        const active = tab.target === activeTarget
        return (
          <button
            key={tab.target}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(tab.target)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-[var(--neoarc-color-accent)] text-[var(--neoarc-color-foreground)]"
                : "border-transparent text-[var(--neoarc-color-foreground-muted)] hover:text-[var(--neoarc-color-foreground)]",
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
