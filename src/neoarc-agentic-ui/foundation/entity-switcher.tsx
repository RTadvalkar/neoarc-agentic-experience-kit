/**
 * neoarc-agentic-ui / foundation / EntitySwitcher
 *
 * Purpose: let a user switch which `ContextRef` entity (workspace, project,
 * section...) is active, as a fully controlled listbox-style control.
 *
 * Input model: `entities: ContextRef[]`, `activeId: OpaqueId`,
 * `onSelect(id: OpaqueId)`. The kit does not manage selection state itself
 * — the product adapter owns `activeId` and re-renders with the new value.
 *
 * Semantic UI events: none in Slice 1. `onSelect` is a plain callback; later
 * slices may additionally offer an `AgenticUIEventHandler`-shaped variant if
 * a product needs the full envelope for this interaction.
 */

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import type { ContextRef } from "../../neoarc-agentic-contracts/foundation"
import type { OpaqueId } from "../../neoarc-agentic-contracts/shared"
import { cn } from "../lib/cn"

export interface EntitySwitcherProps {
  readonly entities: readonly ContextRef[]
  readonly activeId: OpaqueId
  readonly onSelect: (id: OpaqueId) => void
  readonly label?: string
  readonly className?: string
}

export function EntitySwitcher({
  entities,
  activeId,
  onSelect,
  label = "Switch context",
  className,
}: EntitySwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const active = entities.find((entity) => entity.id === activeId)

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex items-center gap-2 rounded-[var(--neoarc-radius-md)] border px-2.5 py-1.5 text-sm",
          "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] text-[var(--neoarc-color-foreground)]",
          "hover:bg-[var(--neoarc-color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
        )}
      >
        <span className="max-w-40 truncate">{active?.label ?? "Select context"}</span>
        <ChevronsUpDown aria-hidden="true" className="size-3.5 text-[var(--neoarc-color-foreground-subtle)]" />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={label}
          className={cn(
            "absolute left-0 top-[calc(100%+4px)] z-10 min-w-48 rounded-[var(--neoarc-radius-md)] border p-1",
            "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface-raised)] shadow-[var(--neoarc-elevation-3)]",
          )}
        >
          {entities.map((entity) => {
            const isActive = entity.id === activeId
            return (
              <li key={entity.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onSelect(entity.id)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-[var(--neoarc-radius-sm)] px-2 py-1.5 text-left text-sm",
                    "text-[var(--neoarc-color-foreground)] hover:bg-[var(--neoarc-color-surface-muted)]",
                  )}
                >
                  <span className="truncate">{entity.label}</span>
                  {isActive ? <Check aria-hidden="true" className="size-3.5 text-[var(--neoarc-color-accent)]" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
