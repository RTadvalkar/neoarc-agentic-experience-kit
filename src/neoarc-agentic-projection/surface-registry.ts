/**
 * neoarc-agentic-projection / surface-registry
 *
 * A lightweight, named extension mechanism for injecting content into fixed
 * extension points ("surfaces") of a host layout (e.g. a workspace header,
 * before/after the composer). This is deliberately not a general plugin
 * runtime — no lifecycle hooks, no dependency resolution, no dynamic
 * loading. It is an ordered list of registrations per named surface.
 *
 * See docs/SURFACE_REGISTRY.md.
 */

/** Initial named surfaces. Products may register additional surface names as plain strings. */
export type KnownAgenticSurface =
  | "agent.header"
  | "agent.context"
  | "conversation.before"
  | "conversation.node"
  | "conversation.after"
  | "composer.before"
  | "composer.main"
  | "composer.after"
  | "inspector.tabs"
  | "workspace.actions"

/** Surfaces accept any string so products can define new extension points without a kit release. */
export type AgenticSurface = KnownAgenticSurface | string

export interface SurfaceRegistration<TExtension> {
  readonly surface: AgenticSurface
  readonly extension: TExtension
  /** Lower numbers render first. Defaults to 0. */
  readonly order?: number
  /** Stable id so a specific registration can be removed later. */
  readonly id: string
}

export class SurfaceRegistry<TExtension> {
  private readonly registrations = new Map<AgenticSurface, SurfaceRegistration<TExtension>[]>()

  /** Register an extension for a named surface. */
  register(registration: SurfaceRegistration<TExtension>): void {
    const existing = this.registrations.get(registration.surface) ?? []
    const next = [...existing.filter((r) => r.id !== registration.id), registration]
    next.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    this.registrations.set(registration.surface, next)
  }

  /** Remove a specific extension by id from a surface. Returns whether one existed. */
  unregister(surface: AgenticSurface, id: string): boolean {
    const existing = this.registrations.get(surface)
    if (!existing) return false
    const next = existing.filter((r) => r.id !== id)
    this.registrations.set(surface, next)
    return next.length !== existing.length
  }

  /** List extensions registered for a surface, in render order. */
  list(surface: AgenticSurface): readonly TExtension[] {
    return (this.registrations.get(surface) ?? []).map((r) => r.extension)
  }

  /** List every surface that currently has at least one registration, for Execution Lab inspection. */
  listSurfaces(): readonly AgenticSurface[] {
    return Array.from(this.registrations.keys())
  }
}

export function createSurfaceRegistry<TExtension>(): SurfaceRegistry<TExtension> {
  return new SurfaceRegistry<TExtension>()
}
