/**
 * lib/showcase/all-scenarios
 *
 * SHOWCASE-ONLY. Combines Slice 1's foundation-only fixtures
 * (`fixtures.ts`) and Slice 2's conversation fixtures
 * (`conversation-fixtures.ts`) into one list the Execution Lab's
 * `ScenarioSelector`/replay engine can page through, distinguished only by
 * the `family` discriminant. Kept as a separate module rather than editing
 * `fixtures.ts` further — Slice 1's fixtures stay untouched apart from the
 * `family: "foundation"` tag needed to discriminate the union.
 */

import { executionLabScenarios, type FoundationExecutionLabScenario } from "./fixtures"
import { conversationExecutionLabScenarios, type ConversationExecutionLabScenario } from "./conversation-fixtures"

export type AnyExecutionLabScenario = FoundationExecutionLabScenario | ConversationExecutionLabScenario

export const allExecutionLabScenarios: readonly AnyExecutionLabScenario[] = [
  ...conversationExecutionLabScenarios,
  ...executionLabScenarios,
]
