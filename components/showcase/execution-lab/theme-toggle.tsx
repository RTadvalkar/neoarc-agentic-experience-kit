"use client"

/**
 * components/showcase/execution-lab/theme-toggle
 *
 * SHOWCASE-ONLY. Wires the showcase-owned `useTheme` hook to a visible
 * light/dark switch, required by docs/03_BOOTSTRAP...prompt.md §10.
 */

import { Moon, Sun } from "lucide-react"
import { useTheme } from "../theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex items-center gap-2 rounded-[var(--neoarc-radius-md)] border border-[var(--neoarc-color-border)] bg-[var(--neoarc-color-surface)] px-2.5 py-1.5 text-sm text-[var(--neoarc-color-foreground)] hover:bg-[var(--neoarc-color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neoarc-color-focus-ring)]"
    >
      {isDark ? <Moon className="size-3.5" aria-hidden="true" /> : <Sun className="size-3.5" aria-hidden="true" />}
      {isDark ? "Dark" : "Light"}
    </button>
  )
}
