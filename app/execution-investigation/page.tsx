/**
 * app/execution-investigation/page
 *
 * SHOWCASE-ONLY reference experience. Thin route wrapper — all
 * composition lives in `ExecutionInvestigationExperience` so the actual UI
 * assembly is reviewable independent of Next.js routing concerns.
 */

import { ExecutionInvestigationExperience } from "../../components/showcase/reference-experiences/execution-investigation-experience"

export default function ExecutionInvestigationPage() {
  return <ExecutionInvestigationExperience />
}
