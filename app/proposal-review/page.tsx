import type { Metadata } from "next"
import { ProposalReviewExperience } from "../../components/showcase/reference-experiences/proposal-review-experience"

export const metadata: Metadata = {
  title: "Proposal Review Workspace — NeoArc Agentic Experience Kit",
  description:
    "Reference experience (showcase only): a business/governance decision surface for reviewing, approving, refining, rejecting, deferring, or overriding an agent's proposal, backed by neoarc-agentic-ui human-interaction components.",
}

export default function ProposalReviewPage() {
  return <ProposalReviewExperience />
}
