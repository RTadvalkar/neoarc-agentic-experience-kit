/**
 * neoarc-agentic-ui / foundation / EntitySwitcher
 *
 * Purpose: let a user switch which `ContextRef` entity (workspace, project,
 * section...) is active, as a fully controlled listbox-style control.
 *
 * Input model: `entities: ContextRef[]`, `activeId: OpaqueId`,
 * `onSelect(id: OpaqueId)`. The kit does not manage selection state itself
 * — the product adapter owns `activeId` and re-renders with the new value.
 * `open`/`onOpenChange` are fully implemented internally (see below) but
 * this remains a controlled-*value* component from the product's point of
 * view: it never invents `activeId`, it only ever reports selections.
 *
 * Accessibility: built on `@base-ui/react`'s `Select` parts rather than a
 * hand-rolled `<button>` + absolutely-positioned `<ul>`. This gives correct
 * opening/focus behavior, roving keyboard navigation (arrow keys, type-ahead,
 * Home/End), selection, Escape/click-outside close, focus restoration to the
 * trigger on close, and complete ARIA listbox/option semantics for free,
 * rather than each foundation component re-implementing that behavior by
 * hand. `@base-ui/react` is plain, framework-neutral React (no Next.js/
 * Vercel/backend imports), consistent with the portability rules in
 * `docs/02A_INSTRUCTION_ARCHITECTURE_AND_PORTABILITY.md`.
 *
 * Semantic UI events: none in Slice 1. `onSelect` is a plain callback; later
 * slices may additionally offer an `AgenticUIEventHandler`-shaped variant if
 * a product needs the full envelope for this interaction.
 */

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Select } from "@base-ui/react/select"
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
  const active = entities.find((entity) => entity.id === activeId)

  return (
    <Select.Root
      items={entities.map((entity) => ({ value: entity.id, label: entity.label }))}
      value={active ? activeId : null}
      onValueChange={(value) => {
        if (value !== null) onSelect(value)
      }}
    >
      <Select.Trigger
        aria-label={label}
        className={cn(
          "flex items-center gap-2 rounded-[var(--neoarc-radius-md)] border px-2.5 py-1.5 text-sm",
          "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] text-[var(--neoarc-color-foreground)]",
          "hover:bg-[var(--neoarc-color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]",
          className,
        )}
      >
        <Select.Value className="max-w-40 truncate">
          {() => active?.label ?? "Select context"}
        </Select.Value>
        <Select.Icon>
          <ChevronsUpDown aria-hidden="true" className="size-3.5 text-[var(--neoarc-color-foreground-subtle)]" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4} className="z-50">
          <Select.Popup
            className={cn(
              "min-w-48 rounded-[var(--neoarc-radius-md)] border p-1",
              "border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface-raised)] shadow-[var(--neoarc-elevation-3)]",
            )}
          >
            {entities.map((entity) => (
              <Select.Item
                key={entity.id}
                value={entity.id}
                className={cn(
                  "flex w-full cursor-default items-center justify-between gap-2 rounded-[var(--neoarc-radius-sm)] px-2 py-1.5 text-left text-sm outline-none",
                  "text-[var(--neoarc-color-foreground)] data-[highlighted]:bg-[var(--neoarc-color-surface-muted)]",
                )}
              >
                <Select.ItemText className="truncate">{entity.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check aria-hidden="true" className="size-3.5 text-[var(--neoarc-color-accent)]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
