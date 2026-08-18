"use client"

/**
 * components/showcase/execution-lab/lab-mode-switch
 *
 * SHOWCASE-ONLY. Top-level Execution Lab mode switch: "Scenario Replay"
 * (the existing Chat/Activity/Trace/Provenance flow driven by
 * `AgenticViewTarget`) vs. "Component Gallery" (direct prop/state
 * inspection of every `src/neoarc-agentic-ui` foundation component).
 *
 * This is deliberately a separate switch, not an extra `AgenticViewTarget`
 * value — the gallery is not a projection target (it renders components
 * directly, with no `AgenticEventEnvelope` -> `AgenticViewNode` step), so it
 * must not pollute that contract's vocabulary. See docs/PROJECTION_MODEL.md.
 */

import { cn } from "../../../src/neoarc-agentic-ui/lib/cn"

export type LabMode = "scenario" | "gallery"

export const labModes: readonly { readonly mode: LabMode; readonly label: string }[] = [
  { mode: "scenario", label: "Scenario Replay" },
  { mode: "gallery", label: "Component Gallery" },
]

export interface LabModeSwitchProps {
  readonly activeMode: LabMode
  readonly onSelect: (mode: LabMode) => void
}

export function LabModeSwitch({ activeMode, onSelect }: LabModeSwitchProps) {
  return (
    <div
      role="tablist"
      aria-label="Execution Lab mode"
      className="inline-flex items-center gap-1 rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface-muted)] p-0.5"
    >
      {labModes.map(({ mode, label }) => {
        const active = mode === activeMode
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(mode)}
            className={cn(
              "rounded-[var(--neoarc-radius-sm)] px-2.5 py-1 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--neoarc-color-surface)] text-[var(--neoarc-color-foreground)] shadow-[var(--neoarc-elevation-1)]"
                : "text-[var(--neoarc-color-foreground-muted)] hover:text-[var(--neoarc-color-foreground)]",
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
