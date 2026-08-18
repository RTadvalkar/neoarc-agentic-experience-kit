# Fix the Current NeoArc Agentic Experience Kit Gate Only

Do not start the next slice.

Obey both enabled NeoArc project instructions.

Use the current implementation and the applicable section of `11_V0_GATE_CHECKLIST.md` as the acceptance gate.

## Task

1. Inspect the current implementation.
2. Identify every failed or ambiguous checklist item for the current slice.
3. Give a short repair plan.
4. Fix only those gate problems and directly related regressions.
5. Do not introduce a new feature family.
6. Do not replatform.
7. Preserve public contracts unless a change is necessary to satisfy the architecture; document any such change.
8. Update relevant docs/fixtures/Execution Lab scenarios.
9. Run available type/lint/build/tests.
10. Re-evaluate the gate and report PASS/FAIL item by item.

Important invariants:

- no DeepSeek Harness/Cordis dependency;
- no backend/auth/storage implementation;
- reusable UI remains portable React;
- projection remains optional;
- no hidden chain-of-thought;
- no fabricated provenance;
- execution permission remains separate from business approval;
- renderer extensibility must not collapse into a central mega-switch.

Stop after repairing the current gate.
