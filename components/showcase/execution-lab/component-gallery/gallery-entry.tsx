/**
 * components/showcase/execution-lab/component-gallery/gallery-entry
 *
 * SHOWCASE-ONLY. Shared layout for one catalog entry in the Foundation
 * Component Gallery: a title/description header (reusing the kit's own
 * `SectionHeader`), a live rendered preview, and optional metadata slots
 * (input model summary, notes). Every entry in the gallery is built from
 * this so the gallery itself stays consistent without a central switch
 * over component kinds.
 */

import type { ReactNode } from "react"
import { SectionHeader } from "../../../../src/neoarc-agentic-ui/foundation/section-header"
import { Surface } from "../../../../src/neoarc-agentic-ui/primitives/surface"
import { cn } from "../../../../src/neoarc-agentic-ui/lib/cn"

export interface GalleryEntryProps {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly inputModel: string
  readonly children: ReactNode
  readonly className?: string
}

export function GalleryEntry({ id, name, description, inputModel, children, className }: GalleryEntryProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("flex flex-col gap-3 border-b border-[var(--neoarc-color-border-muted)] pb-6", className)}
    >
      <div id={`${id}-heading`}>
        <SectionHeader title={name} description={description} />
      </div>
      <p className="text-xs text-[var(--neoarc-color-foreground-subtle)]">
        <span className="font-medium text-[var(--neoarc-color-foreground-muted)]">Input model: </span>
        <code className="font-mono">{inputModel}</code>
      </p>
      <Surface variant="muted" className="flex flex-col gap-4 p-4">
        {children}
      </Surface>
    </section>
  )
}

export interface GalleryVariantRowProps {
  readonly label: string
  readonly children: ReactNode
}

/** A labeled row of one or more rendered variants, for side-by-side state comparison. */
export function GalleryVariantRow({ label, children }: GalleryVariantRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-[var(--neoarc-color-foreground-subtle)]">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}
