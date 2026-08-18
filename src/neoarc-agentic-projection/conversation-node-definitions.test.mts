/**
 * neoarc-agentic-projection / conversation-node-definitions.test
 *
 * Deterministic replay-convergence + stable-identity tests for the
 * built-in conversation node family (docs/04
 * CONVERSATION_PROJECTION_REPLAY.prompt.md §8), run against the exact
 * fixture scenarios the Execution Lab uses
 * (`lib/showcase/conversation-fixtures.ts`) so this suite and the manually
 * driven Execution Lab UI are proving the same thing about the same data.
 *
 * Every scenario is checked for:
 *   1. Replay convergence — full replay (`applyEvents`) and live append
 *      (`events.reduce(applyEvent, ...)`) produce the identical node list,
 *      in the identical order, for every scenario, not just a hand-picked
 *      one.
 *   2. Stable node keys — a business entity that receives multiple events
 *      (a streaming message, a tool moving started -> completed, a
 *      clarification being resolved, a handoff completing) projects to
 *      exactly one node at one fixed position, never duplicated or
 *      reordered by a later update.
 *   3. Key derivation — accumulating kinds key off the business id carried
 *      in the payload (never the event's own id), while one-shot kinds
 *      (notice/error/retry) key off the event's own id, exactly as
 *      `conversation-node-definitions.ts` documents.
 *
 * Run with: node --test src/neoarc-agentic-projection/conversation-node-definitions.test.mts
 */

import { test } from "node:test"
import assert from "node:assert/strict"

import { applyEvent, applyEvents, createProjectionStore, selectNodes } from "./projection-store.ts"
import { conversationNodeDefinitions } from "./conversation-node-definitions.ts"
import { conversationExecutionLabScenarios } from "../../lib/showcase/conversation-fixtures.ts"

function fullReplayNodes(events: Parameters<typeof applyEvents>[1]) {
  return selectNodes(applyEvents(createProjectionStore(), events, conversationNodeDefinitions))
}

function liveAppendNodes(events: Parameters<typeof applyEvents>[1]) {
  const store = events.reduce((acc, event) => applyEvent(acc, event, conversationNodeDefinitions), createProjectionStore())
  return selectNodes(store)
}

test("every Execution Lab scenario converges: full replay === live append", () => {
  for (const scenario of conversationExecutionLabScenarios) {
    assert.deepEqual(
      fullReplayNodes(scenario.events),
      liveAppendNodes(scenario.events),
      `scenario "${scenario.id}" diverged between full replay and live append`,
    )
  }
})

test("empty conversation projects zero nodes", () => {
  const scenario = conversationExecutionLabScenarios.find((s) => s.id === "conversation-empty")
  assert.ok(scenario)
  assert.deepEqual(fullReplayNodes(scenario.events), [])
})

test("ordinary exchange projects two stable, correctly ordered message nodes", () => {
  const scenario = conversationExecutionLabScenarios.find((s) => s.id === "conversation-ordinary-exchange")
  assert.ok(scenario)
  const nodes = fullReplayNodes(scenario.events)

  assert.deepEqual(
    nodes.map((node) => [node.key, node.kind]),
    [
      ["conversation:message:msg-1", "conversation.user-message"],
      ["conversation:message:msg-2", "conversation.agent-message"],
    ],
  )
})

test("streaming assistant merges three deltas into one stable node, not five", () => {
  const scenario = conversationExecutionLabScenarios.find((s) => s.id === "conversation-streaming-assistant")
  assert.ok(scenario)
  const nodes = fullReplayNodes(scenario.events)

  assert.equal(nodes.length, 1)
  assert.equal(nodes[0].key, "conversation:message:msg-3")

  const message = (nodes[0].data as { message: { content: readonly { kind: string; text?: string }[]; streaming: boolean } }).message
  assert.equal(message.streaming, false) // completed event landed last
  assert.equal(message.content.length, 1) // three text deltas merged into a single text block
  assert.equal(
    message.content[0].text,
    "Let me check your account. Your last order shipped yesterday. It should arrive within two business days.",
  )
})

test("tool activity: one tool node updates in place from running to completed", () => {
  const scenario = conversationExecutionLabScenarios.find((s) => s.id === "conversation-tool-activity")
  assert.ok(scenario)
  const nodes = fullReplayNodes(scenario.events)

  const toolNodes = nodes.filter((node) => node.kind === "conversation.tool")
  assert.equal(toolNodes.length, 1)
  assert.equal(toolNodes[0].key, "conversation:tool:tool-1")
  assert.equal((toolNodes[0].data as { tool: { status: string } }).tool.status, "completed")
})

test("clarification: one node updates in place from requested to resolved", () => {
  const scenario = conversationExecutionLabScenarios.find((s) => s.id === "conversation-clarification")
  assert.ok(scenario)
  const nodes = fullReplayNodes(scenario.events)

  const clarificationNodes = nodes.filter((node) => node.kind === "conversation.clarification")
  assert.equal(clarificationNodes.length, 1)
  assert.equal(clarificationNodes[0].key, "conversation:clarification:clarification-1")
  const clarification = (clarificationNodes[0].data as { clarification: { resolved: boolean; resolution?: string } }).clarification
  assert.equal(clarification.resolved, true)
  assert.equal(clarification.resolution, "#48097")
  // The question asked at request time must survive being carried through
  // the resolution update, since the resolved payload does not repeat it.
  assert.equal(
    (clarificationNodes[0].data as { clarification: { question: string } }).clarification.question,
    "Which order would you like to cancel?",
  )
})

test("handoff: one node updates in place from requested to completed", () => {
  const scenario = conversationExecutionLabScenarios.find((s) => s.id === "conversation-handoff")
  assert.ok(scenario)
  const nodes = fullReplayNodes(scenario.events)

  const handoffNodes = nodes.filter((node) => node.kind === "conversation.handoff")
  assert.equal(handoffNodes.length, 1)
  assert.equal(handoffNodes[0].key, "conversation:handoff:handoff-1")
  assert.equal((handoffNodes[0].data as { handoff: { status: string } }).handoff.status, "completed")
})

test("retry: error and retry are keyed by the envelope's own id, not a shared business id", () => {
  const scenario = conversationExecutionLabScenarios.find((s) => s.id === "conversation-retry")
  assert.ok(scenario)
  const nodes = fullReplayNodes(scenario.events)

  const errorNode = nodes.find((node) => node.kind === "conversation.error")
  const retryNode = nodes.find((node) => node.kind === "conversation.retry")
  assert.ok(errorNode)
  assert.ok(retryNode)
  assert.equal(errorNode.key, "conversation:error:evt-rt-2")
  assert.equal(retryNode.key, "conversation:retry:evt-rt-3")
})

test("async work: notice is keyed by the envelope's own id and the artifact by its business id", () => {
  const scenario = conversationExecutionLabScenarios.find((s) => s.id === "conversation-async-work")
  assert.ok(scenario)
  const nodes = fullReplayNodes(scenario.events)

  const noticeNode = nodes.find((node) => node.kind === "conversation.notice")
  const artifactNode = nodes.find((node) => node.kind === "conversation.artifact")
  assert.ok(noticeNode)
  assert.ok(artifactNode)
  assert.equal(noticeNode.key, "conversation:notice:evt-aw-1")
  assert.equal(artifactNode.key, "conversation:artifact:artifact-1")
})

test("resuming replay from an intermediate store converges with a from-scratch full replay", () => {
  // Proves no hidden mutable runtime state: an Execution Lab "Step" replay
  // that pauses partway through and resumes must land on the same nodes as
  // "Play" running straight through — see use-event-replay.ts.
  for (const scenario of conversationExecutionLabScenarios) {
    if (scenario.events.length < 2) continue
    const splitAt = Math.floor(scenario.events.length / 2)

    const fromScratch = fullReplayNodes(scenario.events)

    const prefixStore = applyEvents(createProjectionStore(), scenario.events.slice(0, splitAt), conversationNodeDefinitions)
    const resumedStore = applyEvents(prefixStore, scenario.events.slice(splitAt), conversationNodeDefinitions)

    assert.deepEqual(selectNodes(resumedStore), fromScratch, `scenario "${scenario.id}" failed to converge when resumed mid-replay`)
  }
})
