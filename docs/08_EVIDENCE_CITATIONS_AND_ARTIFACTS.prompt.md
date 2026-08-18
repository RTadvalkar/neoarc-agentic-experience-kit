# Slice 6 — Evidence, Citations, Provenance Links, and Artifacts

Continue the existing greenfield kit.

## Objective

Build reusable evidence/citation/artifact UI that composes with conversation, proposals, runtime, trace and provenance.

---

# 1. Contracts

Add/extend:

```text
EvidenceItem
EvidenceSource
EvidenceLocation
CitationRef
CitationGroup
ProvenanceSummary
ArtifactSummary
ArtifactVersion
ArtifactPreview
ArtifactStatus
SourceFreshness
ConfidenceDisplay
```

Evidence sources may represent:

```text
document
requirement
ticket
web source
code/file reference
record
policy
user-provided content
generated artifact
```

Do not require a URL.

---

# 2. Components

Create/document:

1. CitationInline
2. CitationList
3. EvidenceList
4. EvidenceCard
5. EvidenceDrawer
6. SourcePreview
7. ProvenanceTrail
8. ArtifactCard
9. ArtifactViewerShell
10. ArtifactVersionBadge
11. GroundingSummary
12. SourceFreshnessBadge

---

# 3. Evidence behavior

Help answer:

- what source supports this?
- what fragment/location was used?
- when was it captured/updated if known?
- was it classified as authoritative if supplied?
- where else was it used?
- which proposal/run/artifact referenced it?

Never fabricate unavailable provenance.

---

# 4. Confidence

Render confidence only when supplied.

Support clear:

```text
unknown
not supplied
```

states.

Never invent percentages.

---

# 5. Semantic UI events

Add:

```text
citation.open
evidence.open
evidence.source.open
provenance.open
artifact.open
artifact.version.open
artifact.download.request
```

Download remains an intent only.

---

# 6. Composition

Demonstrate:

- citation in agent response;
- evidence from proposal;
- evidence in trace;
- evidence in provenance;
- runtime output artifact;
- artifact linking to producing run;
- artifact linking to supporting evidence when supplied.

---

# 7. Execution Lab

Add scenarios for:

- one citation;
- many citations;
- missing source;
- redacted/unavailable source;
- versioned artifact;
- artifact generating;
- artifact failed;
- evidence reused by proposal and artifact.

---

# 8. Documentation

Update shared contracts and wiring docs.

Add representative normalized JSON fixtures.

Run checks.

Do not start composite reference experiences.
