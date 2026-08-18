"use client"

/**
 * components/showcase/theme-provider
 *
 * Showcase-only (Next.js host) theme management. This is intentionally NOT
 * part of `src/neoarc-agentic-ui` — the kit does not prescribe how a host
 * toggles the `.dark` class, it only ships tokens that respond to it.
 */

import * as React from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
  readonly theme: Theme
  readonly setTheme: (theme: Theme) => void
  readonly toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = "neoarc-theme"

// Module-level listener set backing `useSyncExternalStore`. Theme lives in
// `localStorage` + `matchMedia`, both external to React, so we synchronize
// with them via a store subscription rather than "read in an effect, then
// setState" — the latter causes an avoidable extra render on every mount.
const listeners = new Set<() => void>()

function notifyListeners(): void {
  for (const listener of listeners) listener()
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark") return stored
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function readServerTheme(): Theme {
  return "light"
}

function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener)
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  media.addEventListener("change", listener)
  return () => {
    listeners.delete(listener)
    media.removeEventListener("change", listener)
  }
}

function writeTheme(next: Theme): void {
  window.localStorage.setItem(STORAGE_KEY, next)
  notifyListeners()
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(subscribeToTheme, readTheme, readServerTheme)

  // Applying React state to the DOM class list (an external system) is the
  // canonical, rule-compliant use of an effect: no setState call inside it.
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const setTheme = React.useCallback((next: Theme) => {
    writeTheme(next)
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  const value = React.useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
