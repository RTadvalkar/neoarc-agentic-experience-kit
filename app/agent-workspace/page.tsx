/**
 * app/agent-workspace/page
 *
 * SHOWCASE-ONLY reference experience. Thin route wrapper — all
 * composition lives in `AgentWorkspaceExperience` so the actual UI
 * assembly is reviewable independent of Next.js routing concerns.
 */

import { AgentWorkspaceExperience } from "../../components/showcase/reference-experiences/agent-workspace-experience"

export default function AgentWorkspacePage() {
  return <AgentWorkspaceExperience />
}
