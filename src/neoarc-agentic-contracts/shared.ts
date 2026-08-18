/**
 * neoarc-agentic-contracts / shared
 *
 * Cross-cutting primitive types shared by every normalized contract in the
 * kit. This module must remain dependency-free plain TypeScript.
 *
 * Ownership: NeoArc Agentic Experience Kit (reusable, framework-neutral).
 */

/**
 * All entity identifiers in NeoArc normalized contracts are opaque strings.
 * Consumers must not parse, format, or assume structure from an id value.
 */
export type OpaqueId = string

/** ISO-8601 timestamp string (e.g. "2026-08-18T10:15:30.000Z"). */
export type ISOTimestamp = string

/**
 * A value that is either present, or explicitly and honestly absent.
 * Reusable components must never silently coerce "unknown" into a fabricated
 * value — see docs/TRACEABILITY_PRINCIPLES.md.
 */
export type Maybe<T> = T | undefined

/**
 * A value that carries an explicit reason it is not present, distinguishing
 * "not supplied" from "not available" from "redacted" from
 * "insufficient access". Used throughout trace/provenance-adjacent contracts
 * introduced in later slices; defined here because `RedactionState` (Slice 1)
 * already depends on the concept.
 */
export type UnavailableReason =
  | "not_supplied"
  | "not_available"
  | "redacted"
  | "insufficient_access"

export interface Unavailable {
  readonly available: false
  readonly reason: UnavailableReason
}

export interface Available<T> {
  readonly available: true
  readonly value: T
}

/** A field that is either present with a value, or explicitly unavailable. */
export type AvailableOr<T> = Available<T> | Unavailable
