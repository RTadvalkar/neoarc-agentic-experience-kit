/**
 * lib/showcase/execution-investigation-fixtures
 *
 * SHOWCASE-ONLY. Re-exports the mission fixture the "Execution
 * Investigation" reference experience needs for its `MissionHeader`, on
 * top of the same `architectureAgentRunScenario` event log the Execution
 * Lab's Trace scenario already replays (`trace-fixtures.ts`). Kept as its
 * own file rather than importing `missionArchitecture` directly from
 * `trace-fixtures.ts` in the experience component, so every showcase-only
 * import in that component comes from `lib/showcase/*`, matching the
 * `agent-workspace-fixtures.ts` convention.
 */

export { missionArchitecture as investigationMission } from "./trace-fixtures"
