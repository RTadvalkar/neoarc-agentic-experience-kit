# NeoArc Agentic Experience Kit — UX, Traceability & Human Control

Apply these rules together with the NeoArc architecture/portability instruction.

## UX character

Design for enterprise users spending long sessions in agentic products.

The UX should be:

- calm and precise;
- information-rich without clutter;
- keyboard friendly and accessible;
- responsive;
- suitable for light and dark themes;
- restrained in motion;
- explicit about status, consequences, and uncertainty.

Avoid toy-chatbot styling, giant gradients, decorative animation, fabricated confidence, unexplained status magic, and critical state available only on hover.

## Execution provenance, not private reasoning

Never expose or fabricate hidden model chain-of-thought.

Trace only observable/supplied execution provenance, such as:

- system instruction identity/version;
- user input;
- product/workspace/section context;
- semantic runtime recipe identity/version;
- model policy identity/version;
- resolved model target when supplied and authorized;
- safe activity summaries;
- tool identity and sanitized summaries;
- knowledge retrieval/selection/supply/citation;
- relationship traversal/use;
- evidence;
- agent/task activity;
- human interactions and decisions;
- proposals and artifacts;
- timing, usage, retries, failures.

Unknown or unavailable data must remain unknown. Never invent provenance.

## Trace access and redaction

Support supplied visibility concepts such as:

```text
USER
OPERATOR
DEVELOPER
PLATFORM_ADMIN
```

The UI is NOT security-authoritative. Product/backend adapters decide which fields are supplied or redacted.

Support explicit states such as:

```text
not supplied
not available
redacted
insufficient access
```

Never reveal secrets, credentials, auth headers, or unsafe raw tool payloads merely because a high-level role is displayed.

## Knowledge usage

Preserve distinctions:

```text
retrieved
selected
supplied
cited
```

Do not call everything retrieved “used”. Only show scores/confidence if supplied.

## Relationship usage

Support supplied relationship lineage including:

```text
source entity
predicate
target entity
optional traversal depth
usage category
```

Possible usage categories include retrieval, context, evidence, and impact. Do not infer importance solely from traversal.

## Two separate approval domains

Never collapse these into one generic approval model.

### Execution permission

Question:

“May this specific tool/action proceed?”

Normalized outcomes may include:

```text
allowed_once
rejected
cancelled
unavailable
```

### Business decision

Question:

“Should this proposal/change become authoritative?”

Product-configurable actions may include:

```text
approve/apply
refine
reject/discard
defer
override
```

The UI emits intent and waits for authoritative state.

## Human interaction

Support generic pending human interaction with presentation intents such as:

```text
clarification
execution-permission
proposal-review
risk-acknowledgement
override
confirmation
```

A specialized presentation must not silently remove valid actions.

## Alternate execution views

The same normalized facts should be reusable across:

```text
Chat
Activity
Trace
Provenance
```

Their purpose differs:

- Chat: human-facing interaction;
- Activity: concise safe progress;
- Trace: chronological forensic execution;
- Provenance: information/decision lineage.

A fact may have a different renderer in each target.

## Execution Lab

Maintain a showcase-only **Execution Lab**.

It should let a developer:

- select a scenario;
- inspect normalized input JSON/events;
- replay/reset/pause/step through events where practical;
- inspect projected state and view nodes;
- switch between Chat / Activity / Trace / Provenance;
- trigger interactions;
- inspect emitted semantic UI event payloads;
- distinguish reusable code from mocks/demo controllers.

Do not require Storybook.

## Documentation

For every important component/family, record:

- purpose;
- input model;
- supported states;
- semantic events and payloads;
- loading/empty/error/permission behavior;
- trace visibility/redaction concerns;
- example fixture;
- example usage;
- adapter/product responsibilities;
- assumptions.

The wiring contracts are as important as the JSX.
