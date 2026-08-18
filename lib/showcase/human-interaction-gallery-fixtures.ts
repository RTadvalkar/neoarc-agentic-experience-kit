/**
 * lib/showcase/human-interaction-gallery-fixtures
 *
 * SHOWCASE-ONLY. Direct-view-model fixtures for the Component Gallery's
 * Slice 3 human-interaction section (component-gallery.tsx). Covers every
 * state docs/05_HUMAN_INTERACTION_AND_PROPOSALS.prompt.md §8 calls out:
 * clarification (existing Slice 2 fixture), execution permission,
 * permission unavailable, clean proposal, proposal with evidence, stale
 * proposal, policy warning, conflict, override required, action pending,
 * action failed, finalized proposal. Mock data only; never imported by
 * `src/neoarc-agentic-ui`.
 */

import type { ExecutionPermissionRequest, PendingInteraction } from "../../src/neoarc-agentic-contracts/human-interaction"
import type { ProposalSummary } from "../../src/neoarc-agentic-contracts/proposal"

const decidedByAlex = { id: "actor-alex", kind: "human" as const, displayName: "Alex Rivera", initials: "AR" }
const decidedByJordan = { id: "actor-jordan", kind: "human" as const, displayName: "Jordan Lee", initials: "JL" }

// ---------------------------------------------------------------------------
// Execution permission
// ---------------------------------------------------------------------------

export const galleryPermissionPending: ExecutionPermissionRequest = {
  id: "gallery-permission-pending",
  action: {
    toolName: "send-customer-email",
    actionSummary: "Send a refund confirmation email to the customer",
    targetLabel: "order #48213",
  },
  riskLevel: "medium",
  consequenceSummary: "The customer will receive this email immediately; it cannot be recalled once sent.",
  requestedAt: "2026-08-18T09:02:00.000Z",
  status: "pending",
}

export const gallerySubmittedPermission: ExecutionPermissionRequest = {
  ...galleryPermissionPending,
  id: "gallery-permission-submitted",
  status: "submitted",
}

export const galleryResolvedPermission: ExecutionPermissionRequest = {
  ...galleryPermissionPending,
  id: "gallery-permission-resolved",
  status: "resolved",
  outcome: "allowed_once",
}

export const galleryUnavailablePermission: ExecutionPermissionRequest = {
  id: "gallery-permission-unavailable",
  action: {
    toolName: "issue-refund",
    actionSummary: "Issue a full refund for order #48213",
  },
  riskLevel: "high",
  requestedAt: "2026-08-18T09:03:00.000Z",
  status: "resolved",
  outcome: "unavailable",
  unavailableReason: "The refund tool is temporarily disabled for accounts under fraud review.",
}

// ---------------------------------------------------------------------------
// Proposals
// ---------------------------------------------------------------------------

const basePermissions: ProposalSummary["decisionPermissions"] = [
  { action: "approve", available: true },
  { action: "refine", available: true },
  { action: "reject", available: true },
  { action: "defer", available: true },
]

export const galleryCleanProposal: ProposalSummary = {
  id: "gallery-proposal-clean",
  title: "Update checkout copy for saved payment methods",
  status: "ready_for_review",
  revision: { revision: 1, createdAt: "2026-08-18T08:50:00.000Z" },
  summary: "Rewords the saved-card prompt during checkout to reduce confusion reported in support tickets.",
  sections: [
    {
      id: "gallery-section-copy",
      title: "Checkout copy",
      changes: [
        {
          id: "gallery-change-1",
          summary: "Saved payment prompt",
          path: "checkout/PaymentStep.tsx",
          before: "Use a card on file?",
          after: "Pay with a saved card ending in •••• 4242?",
        },
      ],
    },
  ],
  decisionPermissions: basePermissions,
}

export const galleryProposalWithEvidence: ProposalSummary = {
  ...galleryCleanProposal,
  id: "gallery-proposal-evidence",
  title: "Reduce checkout steps from 4 to 2",
  summary: "Consolidates shipping and payment into a single step based on the Q2 conversion analysis.",
  evidence: [
    { id: "gallery-evidence-1", label: "Q2 conversion report", sourceLabel: "Analytics", url: "https://example.com/reports/q2-conversion" },
    { id: "gallery-evidence-2", label: "Checkout redesign RFC", sourceLabel: "Internal docs" },
  ],
}

export const galleryStaleProposal: ProposalSummary = {
  ...galleryCleanProposal,
  id: "gallery-proposal-stale",
  status: "stale",
  title: "Add express shipping upsell",
  summary: "Adds an express shipping option at checkout — the underlying pricing data may have changed since this was drafted.",
}

export const galleryPolicyWarningProposal: ProposalSummary = {
  ...galleryCleanProposal,
  id: "gallery-proposal-policy-warning",
  title: "Auto-apply loyalty discount at checkout",
  summary: "Applies eligible loyalty discounts automatically instead of requiring a promo code.",
  policyFindings: [
    { id: "gallery-policy-1", policyName: "Discount stacking policy", outcome: "warning", summary: "May stack with existing promo codes in rare cases — review before approving." },
    { id: "gallery-policy-2", policyName: "Data retention policy", outcome: "pass", summary: "No new customer data is retained by this change." },
  ],
  riskFindings: [{ id: "gallery-risk-1", level: "medium", summary: "Discount stacking could reduce margin on a small number of orders." }],
}

export const galleryConflictProposal: ProposalSummary = {
  ...galleryCleanProposal,
  id: "gallery-proposal-conflict",
  status: "conflicted",
  title: "Change default currency display to USD",
  summary: "Sets USD as the default displayed currency for new sessions.",
  decisionPermissions: [
    { action: "approve", available: false, reason: "Resolve the conflict below before this can be approved." },
    { action: "refine", available: true },
    { action: "reject", available: true },
    { action: "defer", available: true },
  ],
  conflicts: [
    {
      id: "gallery-conflict-1",
      summary: "Collides with an in-flight change that sets the default currency by locale",
      conflictingWith: "Proposal #4821 — Locale-based currency defaults",
      resolved: false,
    },
  ],
}

export const galleryOverrideRequiredProposal: ProposalSummary = {
  ...galleryCleanProposal,
  id: "gallery-proposal-override",
  title: "Bypass fraud hold on order #48213",
  summary: "Releases a held order after manual identity verification with the customer.",
  riskFindings: [{ id: "gallery-risk-2", level: "high", summary: "Bypasses the standard fraud-hold review flow." }],
  decisionPermissions: [
    { action: "override", available: true },
    { action: "reject", available: true },
    { action: "defer", available: true },
  ],
  overrideRequirement: {
    required: true,
    reason: "Fraud-hold bypasses require a documented justification from a senior support lead.",
    requiredRole: "senior-support-lead",
  },
}

export const galleryActionPendingProposal: ProposalSummary = {
  ...galleryCleanProposal,
  id: "gallery-proposal-pending",
  status: "decision_pending",
  title: "Extend return window to 45 days for holiday orders",
  summary: "Temporarily extends the return window for orders placed during the holiday promotion.",
  pendingAction: "approve",
}

export const galleryActionFailedProposal: ProposalSummary = {
  ...galleryCleanProposal,
  id: "gallery-proposal-failed",
  title: "Retire legacy gift-card redemption flow",
  summary: "Removes the deprecated gift-card redemption path in favor of the unified wallet flow.",
  lastActionFailed: { action: "approve", reason: "The backend rejected this approval: a dependent migration has not completed yet." },
}

export const galleryFinalizedProposal: ProposalSummary = {
  ...galleryCleanProposal,
  id: "gallery-proposal-finalized",
  status: "approved",
  title: "Rename 'Wallet' to 'Payment methods' across settings",
  summary: "Renames the Wallet section for clarity based on usability testing.",
  decisionPermissions: [],
  decisionHistory: [
    {
      id: "gallery-decision-1",
      action: "refine",
      decidedBy: decidedByJordan,
      decidedAt: "2026-08-17T16:00:00.000Z",
      note: "Please confirm this doesn't affect existing help-center links.",
    },
    {
      id: "gallery-decision-2",
      action: "approve",
      decidedBy: decidedByAlex,
      decidedAt: "2026-08-18T08:30:00.000Z",
      note: "Confirmed — help-center links use stable IDs, not the label.",
    },
  ],
}

// ---------------------------------------------------------------------------
// Pending human interaction summary (compact list entry point)
// ---------------------------------------------------------------------------

export const galleryPendingInteractions: readonly PendingInteraction[] = [
  {
    id: "gallery-pending-1",
    presentationIntent: "execution-permission",
    label: "Send a refund confirmation email — order #48213",
    requestedAt: galleryPermissionPending.requestedAt,
    riskLevel: "medium",
  },
  {
    id: "gallery-pending-2",
    presentationIntent: "proposal-review",
    label: "Bypass fraud hold on order #48213",
    requestedAt: "2026-08-18T09:05:00.000Z",
    riskLevel: "high",
  },
]
