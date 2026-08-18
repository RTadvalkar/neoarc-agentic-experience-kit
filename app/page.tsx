import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "../src/neoarc-agentic-ui/primitives/badge"
import { Surface } from "../src/neoarc-agentic-ui/primitives/surface"

const reusableRoots = [
  {
    name: "neoarc-agentic-contracts",
    description: "Framework-neutral typed models, event envelope, and semantic UI event contract.",
  },
  {
    name: "neoarc-agentic-projection",
    description: "Optional seam: envelope -> view node -> renderer registry. Never required by the UI package.",
  },
  {
    name: "neoarc-agentic-ui",
    description: "17 foundation components, usable with or without projection.",
  },
]

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-3">
          <Badge tone="outline" className="w-fit">
            Slice 1 — Foundation, Registries, Execution Lab
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--neoarc-color-foreground)]">
            NeoArc Agentic Experience Kit
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-[var(--neoarc-color-foreground-muted)]">
            A reusable enterprise React UX framework for agentic products. This app is a showcase
            host only — the reusable source lives under <code>src/neoarc-agentic-*</code> and does
            not depend on anything in this <code>app/</code> directory.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {reusableRoots.map((root) => (
            <Surface key={root.name} variant="muted" className="flex flex-col gap-1 p-3">
              <span className="font-mono text-sm text-[var(--neoarc-color-foreground)]">{root.name}</span>
              <span className="text-sm text-[var(--neoarc-color-foreground-muted)]">{root.description}</span>
            </Surface>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/execution-lab"
            className="inline-flex w-fit items-center gap-2 rounded-[var(--neoarc-radius-md)] bg-[var(--neoarc-color-accent)] px-4 py-2 text-sm font-medium text-[var(--neoarc-color-accent-foreground)] hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
          >
            Open Execution Lab
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--neoarc-color-border)] pt-6">
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--neoarc-color-foreground-subtle)]">
            Reference experiences — showcase only
          </span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/agent-workspace"
              className="inline-flex flex-1 items-center justify-between gap-2 rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] px-4 py-3 text-sm font-medium text-[var(--neoarc-color-foreground)] hover:bg-[var(--neoarc-color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
            >
              Agent Workspace
              <ArrowRight className="size-3.5 text-[var(--neoarc-color-foreground-muted)]" aria-hidden="true" />
            </Link>
            <Link
              href="/execution-investigation"
              className="inline-flex flex-1 items-center justify-between gap-2 rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] px-4 py-3 text-sm font-medium text-[var(--neoarc-color-foreground)] hover:bg-[var(--neoarc-color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
            >
              Execution Investigation
              <ArrowRight className="size-3.5 text-[var(--neoarc-color-foreground-muted)]" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
