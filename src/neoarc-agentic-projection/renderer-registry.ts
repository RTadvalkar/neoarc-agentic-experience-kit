/**
 * neoarc-agentic-projection / renderer-registry
 *
 * A NeoArc-owned keyed renderer registry: renderers register themselves by
 * `target + kind`, and lookups always resolve to either a registered
 * renderer or a caller-supplied generic fallback. This is the mechanism
 * that lets features register new view node renderers without editing a
 * central switch statement — see docs/RENDERER_REGISTRY.md.
 *
 * `TRenderer` is intentionally generic so this stays framework-neutral.
 * `neoarc-agentic-ui` instantiates this with a React component type; a
 * non-React consumer could instantiate it with something else entirely.
 */

import type { AgenticViewTarget } from "./types"

/** Composite lookup key: one renderer per (target, kind) pair. */
function makeKey(target: AgenticViewTarget, kind: string): string {
  return `${target}::${kind}`
}

export interface RendererRegistration<TRenderer> {
  readonly target: AgenticViewTarget
  readonly kind: string
  readonly renderer: TRenderer
}

export class RendererRegistry<TRenderer> {
  private readonly renderers = new Map<string, TRenderer>()
  private fallback: TRenderer | undefined

  /** Register a renderer for a specific (target, kind) pair. Overwrites any prior registration for the same pair. */
  register(target: AgenticViewTarget, kind: string, renderer: TRenderer): void {
    this.renderers.set(makeKey(target, kind), renderer)
  }

  /** Register many renderers at once. */
  registerAll(registrations: readonly RendererRegistration<TRenderer>[]): void {
    for (const registration of registrations) {
      this.register(registration.target, registration.kind, registration.renderer)
    }
  }

  /** Register the generic fallback renderer used for unknown node kinds. */
  registerFallback(renderer: TRenderer): void {
    this.fallback = renderer
  }

  /** Remove a specific registration. Returns whether one existed. */
  unregister(target: AgenticViewTarget, kind: string): boolean {
    return this.renderers.delete(makeKey(target, kind))
  }

  /** Whether a renderer is registered for this exact (target, kind) pair. */
  has(target: AgenticViewTarget, kind: string): boolean {
    return this.renderers.has(makeKey(target, kind))
  }

  /**
   * Resolve the renderer for a (target, kind) pair, falling back to the
   * generic fallback if no specific renderer is registered. Returns
   * `undefined` only if no fallback has been registered either — callers
   * should always register a fallback in practice.
   */
  resolve(target: AgenticViewTarget, kind: string): TRenderer | undefined {
    return this.renderers.get(makeKey(target, kind)) ?? this.fallback
  }

  /** List every registered (target, kind) pair, for debugging/Execution Lab inspection. */
  listRegistrations(): readonly { target: AgenticViewTarget; kind: string }[] {
    return Array.from(this.renderers.keys()).map((key) => {
      const [target, kind] = key.split("::") as [AgenticViewTarget, string]
      return { target, kind }
    })
  }

  /** Whether a fallback renderer has been registered. */
  hasFallback(): boolean {
    return this.fallback !== undefined
  }
}

/** Convenience factory mirroring the class constructor, for call-site symmetry with `createSurfaceRegistry`. */
export function createRendererRegistry<TRenderer>(): RendererRegistry<TRenderer> {
  return new RendererRegistry<TRenderer>()
}
