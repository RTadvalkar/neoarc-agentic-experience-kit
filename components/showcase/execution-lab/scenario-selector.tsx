"use client"

/**
 * components/showcase/execution-lab/scenario-selector
 *
 * SHOWCASE-ONLY. Lets a developer pick which fixture scenario
 * (lib/showcase/fixtures.ts) is currently loaded into the Execution Lab.
 * This is deliberately NOT `EntitySwitcher` — `EntitySwitcher` is a
 * reusable kit component for switching a `ContextRef`, whereas this is
 * showcase harness plumbing for picking demo data. Reusing EntitySwitcher
 * here would blur that boundary.
 */

import type { ExecutionLabScenario } from "../../../lib/showcase/fixtures"
import { cn } from "../../../src/neoarc-agentic-ui/lib/cn"

export interface ScenarioSelectorProps {
  readonly scenarios: readonly ExecutionLabScenario[]
  readonly activeScenarioId: string
  readonly onSelect: (id: string) => void
}

export function ScenarioSelector({ scenarios, activeScenarioId, onSelect }: ScenarioSelectorProps) {
  return (
    <div role="tablist" aria-label="Scenario" className="flex flex-wrap items-center gap-2">
      {scenarios.map((scenario) => {
        const active = scenario.id === activeScenarioId
        return (
          <button
            key={scenario.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(scenario.id)}
            className={cn(
              "rounded-[var(--neoarc-radius-md)] border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-transparent bg-[var(--neoarc-color-accent)] text-[var(--neoarc-color-accent-foreground)]"
                : "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] text-[var(--neoarc-color-foreground-muted)] hover:bg-[var(--neoarc-color-surface-muted)]",
            )}
          >
            {scenario.label}
          </button>
        )
      })}
    </div>
  )
}
