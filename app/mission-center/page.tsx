/**
 * app/mission-center/page
 *
 * SHOWCASE-ONLY reference experience. Thin route wrapper — all
 * composition lives in `MissionCenterExperience` so the actual UI
 * assembly is reviewable independent of Next.js routing concerns.
 */

import { MissionCenterExperience } from "../../components/showcase/reference-experiences/mission-center-experience"

export default function MissionCenterPage() {
  return <MissionCenterExperience />
}
