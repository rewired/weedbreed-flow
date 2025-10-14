---
description: Task list template for feature implementation aligned with the WeedBreed Flow constitution.
---

# Tasks: [FEATURE NAME]

**Input**: `/specs/[###-feature-name]/` (plan.md, research.md, spec.md, data-model.md, contracts/)  
**Baselines**: Node.js 22 LTS, pnpm, React, React Flow, Vite, Tailwind CSS

## Format

`[ID] [P?] [Story] Description (Principles: Px, Py)`

- `[P?]` mark tasks that can run in parallel without file conflicts.
- `[Story]` reference the driving user story (US1, US2, etc.).
- Cite principle IDs to show constitutional compliance.
- Include explicit file paths for deliverables.

## Phase 0: Foundation

Purpose: deterministic scaffolding all stories rely on.

- [ ] T000 [ ] [Core] Confirm toolchain (Node.js 22 LTS, pnpm) configured. (Principles: P2, P6)
- [ ] T001 [ ] [Core] Establish base folders per plan.md structure. (Principles: P1, P7)
- [ ] T002 [P] [Core] Configure linting, formatting, and JSDoc rules. (Principles: P12)
- [ ] T003 [P] [Core] Add deterministic test harness (e.g., Vitest with seeded fixtures). (Principles: P2, P9)

## Phase 1: User Story 1 - [Title] (Priority: P1)

**Goal**: [Outcome]

- [ ] T100 [P] [US1] Implement data model or plugin manifest updates in [path]. (Principles: P3, P5)
- [ ] T101 [ ] [US1] Build UI flow in [path] using React Flow + Tailwind. (Principles: P1, P7)
- [ ] T102 [ ] [US1] Add simulation logic respecting clamps in [path]. (Principles: P2, P3)
- [ ] T103 [P] [US1] Write deterministic tests in tests/[path]. (Principles: P2, P9)
- [ ] T104 [ ] [US1] Update documentation (spec clarifications, quickstart). (Principles: P12)

**Exit Check**: Story passes acceptance scenarios and runs offline with seeded determinism.

## Phase 2: User Story 2 - [Title] (Priority: P2)

- [ ] T200 [P] [US2] Extend data/contracts in [path]. (Principles: P5)
- [ ] T201 [ ] [US2] Implement UI/interaction updates in [path]. (Principles: P7)
- [ ] T202 [ ] [US2] Update workforce or maintenance logic in [path]. (Principles: P8)
- [ ] T203 [P] [US2] Add coverage tests and fixtures. (Principles: P2, P9)
- [ ] T204 [ ] [US2] Refresh docs and edge cases. (Principles: P12)

## Phase 3: User Story 3 - [Title] (Priority: P3)

- [ ] T300 [P] [US3] Implement feature slice in [path]. (Principles: [Px])
- [ ] T301 [ ] [US3] Integrate transfers/budgets per spec. (Principles: P3, P6)
- [ ] T302 [P] [US3] Tests and fixtures. (Principles: P2, P9)
- [ ] T303 [ ] [US3] Update user guidance. (Principles: P7, P12)

## Phase N: Cross-Cutting Polish

- [ ] TX01 [P] [Cross] Performance profiling and tick budget report. (Principles: P6)
- [ ] TX02 [ ] [Cross] Accessibility audit vs. color semantics. (Principles: P7)
- [ ] TX03 [ ] [Cross] Plugin validation and schema updates. (Principles: P5, P9)
- [ ] TX04 [P] [Cross] Documentation pass (quickstart.md, changelog). (Principles: P12)

## Dependencies

- Phase 0 must pass before any user story begins.
- Each user story can proceed once its prerequisites are satisfied and MUST remain independently testable.
- Cross-cutting polish executes after targeted user stories stabilize.

## Notes

- Keep open questions under `/specs/.../plan.md` Constitution Check until addressed.
- Capture deviations in Complexity Tracking with mitigation plans.
- Every task should end with a deterministic verification (tests or manual steps in quickstart.md).