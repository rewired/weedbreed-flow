---
description: Task list template for feature implementation aligned with the WeedBreed Flow constitution.
---

# Tasks: Factory/Card Planner MVP Core Loop

**Input**: `/specs/001-project-principles-factory/` (plan.md, research.md, spec.md, data-model.md, contracts/)  
**Baselines**: Node.js 22 LTS, pnpm, React, React Flow, Vite, Tailwind CSS

## Format

`[ID] [P?] [Story] Description (Principles: Px, Py)`

- `[P?]` mark tasks that can run in parallel without file conflicts.
- `[Story]` reference the driving user story (US1, US2, etc.).
- Cite principle IDs to show constitutional compliance.
- Include explicit file paths for deliverables.

## Phase 0: Foundation

Purpose: deterministic scaffolding all stories rely on.

- [ ] T001 [ ] [Core] Create monorepo workspaces (`pnpm-workspace.yaml`, `apps/factory`, `packages/sim-core`, `packages/sim-fixtures`, `packages/ui-kit`, `tests/`). (Principles: P1, P12)
- [ ] T002 [P] [Core] Initialize pnpm project configuration with Node.js 22 engines and shared scripts in `package.json`. (Principles: P1, P9)
- [ ] T003 [P] [Core] Configure Vite + React + TypeScript baseline in `apps/factory/vite.config.ts` with Tailwind CSS setup. (Principles: P7)
- [ ] T004 [P] [Core] Add ESLint, Prettier, Tailwind, and TypeScript configs aligned with determinism rules. (Principles: P12)
- [ ] T005 [P] [Core] Scaffold `packages/ui-kit` with shared Tailwind primitives and resource color tokens. (Principles: P7)
- [ ] T006 [P] [Core] Scaffold `packages/sim-core` with TypeScript project references and deterministic xorshift RNG utility. (Principles: P2)
- [ ] T007 [P] [Core] Scaffold `packages/sim-fixtures` to host golden graphs and Vitest harness. (Principles: P2, P9)

## Phase 1: Foundational (Blocking)

Purpose: cross-story prerequisites that must be complete before user story development starts.

- [ ] T008 [ ] [Core] Implement IndexedDB persistence layer using Dexie in `apps/factory/src/domains/persistence`. (Principles: P10)
- [ ] T009 [ ] [Core] Implement plugin manifest loader and schema validation in `packages/sim-core/src/plugins`. (Principles: P5, P9)
- [ ] T010 [ ] [Core] Implement deterministic simulation kernel skeleton with seeded RNG and tick orchestration in `packages/sim-core/src/sim`. (Principles: P2, P3)
- [ ] T011 [ ] [Core] Implement schema validation utilities for graphs and saves in `packages/sim-core/src/schema`. (Principles: P9, P10)
- [ ] T012 [ ] [Core] Provide shared graph resource constants (pin types, colors) in `packages/ui-kit/src/tokens/resources.ts`. (Principles: P7)
- [ ] T013 [ ] [Core] Implement common React Flow base components and hooks in `packages/ui-kit/src/components/graph`. (Principles: P1, P7)
- [ ] T014 [ ] [Core] Configure Vitest + React Testing Library + Playwright tooling in repo-level `tests/` folder. (Principles: P2, P9)
- [ ] T015 [ ] [Core] Document setup and determinism guarantees in `docs/architecture/determinism.md`. (Principles: P2, P12)

**Checkpoint**: Foundation ready; all user story work can begin.

## Phase 2: User Story 1 - Compose Deterministic Production Graph (Priority: P1)

**Goal**: Enable planners to build and run resource graphs with typed pins and deterministic simulation output.

**Independent Test**: Build golden fixture graph, run simulation twice, confirm matching KPIs and visible clamps.

### Implementation Tasks

- [ ] T020 [P] [US1] Implement zone graph state management (nodes, edges, pins) in `apps/factory/src/domains/graph/state.ts`. (Principles: P1, P3)
- [ ] T021 [P] [US1] Implement React Flow canvas with typed pin validation and edge capacity editing in `apps/factory/src/app/canvas`. (Principles: P1, P3)
- [ ] T022 [ ] [US1] Implement simulation worker (`apps/factory/src/workers/simulation.ts`) consuming `/sim/run` and `/sim/validate` contracts. (Principles: P2, P3)
- [ ] T023 [ ] [US1] Integrate golden fixture runner in `packages/sim-fixtures/src/run.ts` producing KPI hashes. (Principles: P2, P9)
- [ ] T024 [P] [US1] Wire deterministic clamp badges and tooltips in `apps/factory/src/components/badges`. (Principles: P3, P11)
- [ ] T025 [ ] [US1] Connect persistence export/import UI (JSON saves) in `apps/factory/src/app/save-load`. (Principles: P10)
- [ ] T026 [ ] [US1] Add documentation update covering graph composition flow in `docs/guides/graph-building.md`. (Principles: P12)

**Checkpoint**: US1 delivers deterministic graph composition and simulation loop.

## Phase 3: User Story 2 - Navigate Hierarchical Spaces (Priority: P2)

**Goal**: Let planners drill down from company to zone while maintaining budget context and capacity feedback.

**Independent Test**: Navigate from company overview to zone, hit area limit, ensure breadcrumbs/left rail guidance works.

### Implementation Tasks

- [ ] T030 [P] [US2] Implement hierarchy store leveraging `/company`, `/structures/{id}`, `/rooms/{id}`, `/zones/{id}` contracts in `apps/factory/src/domains/hierarchy`. (Principles: P1, P7)
- [ ] T031 [ ] [US2] Build navigation UI (breadcrumbs, left rail, structure cards) in `apps/factory/src/app/navigation`. (Principles: P7)
- [ ] T032 [P] [US2] Render budget sparkbars and area gauges in `apps/factory/src/components/gauges`. (Principles: P6)
- [ ] T033 [ ] [US2] Implement no-zone fallback screen and zone selection switcher. (Principles: P7)
- [ ] T034 [ ] [US2] Update persistence layer to preload hierarchy snapshots on launch. (Principles: P10)
- [ ] T035 [ ] [US2] Document navigation flow and breadcrumbs in `docs/guides/navigation.md`. (Principles: P12)

**Checkpoint**: US2 provides hierarchical navigation and feedback loops.

## Phase 4: User Story 3 - Diagnose Bottlenecks, Workforce, Transfer Constraints (Priority: P3)

**Goal**: Surface clamps, labor allocation, and transfer queues so planners can adjust operations.

**Independent Test**: Run scenario with energy shortfall, labor deficit, transfer latency; identify limits within 30 seconds.

### Implementation Tasks

- [ ] T040 [P] [US3] Extend simulation worker outputs to include clamp events, workforce allocations, transfer snapshots (align with contract schemas). (Principles: P3, P8)
- [ ] T041 [P] [US3] Implement HR panel showing labor pool sliders and deterministic allocation in `apps/factory/src/components/hr-panel`. (Principles: P8)
- [ ] T042 [ ] [US3] Implement maintenance debt visualization and tooltips in `apps/factory/src/components/maintenance`. (Principles: P8)
- [ ] T043 [P] [US3] Implement transfer queue badges and FIFO inspector overlays in `apps/factory/src/components/transfers`. (Principles: P3)
- [ ] T044 [ ] [US3] Add KPI dashboard summarizing clamps and arrival delays in `apps/factory/src/components/kpis`. (Principles: P6, P11)
- [ ] T045 [ ] [US3] Update docs with bottleneck diagnosis guide in `docs/guides/diagnostics.md`. (Principles: P12)

**Checkpoint**: US3 exposes bottlenecks with deterministic diagnostics.

## Phase 5: Polish & Cross-Cutting

- [ ] T050 [P] [Cross] Optimize React Flow render performance with memoized node/edge components and virtualization toggles. (Principles: P6)
- [ ] T051 [ ] [Cross] Conduct accessibility audit for color semantics and add alternative cues. (Principles: P7, P13)
- [ ] T052 [ ] [Cross] Finalize quickstart instructions in `specs/001-project-principles-factory/quickstart.md` with updated commands. (Principles: P12)
- [ ] T053 [ ] [Cross] Record determinism ADR referencing RNG strategy in `docs/adr/2025-10-deterministic-rng.md`. (Principles: P2, P12)
- [ ] T054 [P] [Cross] Integrate Playwright suite into CI workflow (GitHub Actions) enforcing offline execution. (Principles: P9, P10)

## Dependencies & Execution Order

### Phase Dependencies
- Foundation (Phase 0) must complete first.
- Foundational (Phase 1) depends on Phase 0 and blocks all user stories.
- User Story phases proceed in priority order once Phase 1 is complete.
- Polish runs after desired user stories are stable.

### User Story Dependencies
- US1: No story dependency.
- US2: Requires US1 components (canvas) available for navigation context.
- US3: Builds on simulation outputs from US1 and metrics panels from US2.

### Within Each User Story
- Complete state/data tasks before UI binding.
- Documentation updates trail functional implementation.

## Parallel Execution Examples

### User Story 1
- Run T020 (state) and T021 (UI canvas) in parallel.
- Run T023 (fixtures) alongside T024 (badges) once state scaffolding exists.

### User Story 2
- T030 (store) and T032 (gauges) in parallel.
- T031 (navigation UI) waits on T030.

### User Story 3
- T040 (worker outputs) and T041 (HR panel) start together.
- T043 (transfer overlays) waits on T040.

## Implementation Strategy

1. Complete Phase 0 and Phase 1 to satisfy constitutional gates.
2. Deliver US1 as MVP: deterministic graph composition and simulation loop.
3. Layer US2 navigation, then US3 diagnostics for richer insights.
4. Finish with cross-cutting polish, documentation, and CI enforcement.