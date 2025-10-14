<!--
Sync Impact Report
Version change: none -> 1.0.0
Modified principles: (initial adoption)
Added sections: Purpose; Principles; Decision Heuristics; Governance
Removed sections: None
Templates requiring updates:
- DONE .specify/templates/plan-template.md
- DONE .specify/templates/spec-template.md
- DONE .specify/templates/tasks-template.md
- N/A .specify/templates/commands (directory absent)
Follow-up TODOs: None
-->

# WeedBreed Flow Project Constitution

**Project Name**: WeedBreed Flow  
**Constitution Version**: 1.0.0  
**Ratified**: 2025-10-14  
**Last Amended**: 2025-10-14  
**Toolchain Baseline**: Node.js 22 LTS, pnpm, React, React Flow, Vite, Tailwind CSS

## Purpose

This constitution codifies the non-negotiable rules, operating principles, and governance process for the WeedBreed Flow client-only Factory/Card Planner. All feature work, documentation, and decision records MUST comply with the statements below. When trade-offs are required, these principles take precedence over convenience or stylistic preference.

## Principles

### P1. Vision & Scope

- The planner MUST center on graph-first gameplay: nodes and typed pins represent all flows.
- The MVP MUST run entirely on the client, with no WeedBreed backend dependencies.
- Factory abstraction takes priority; agronomy-level simulation is explicitly out of scope for this slice.
- Every feature MUST originate from a concise specification slice produced through `/speckit.specify`.

### P2. Determinism & Reproducibility

- Simulation logic MUST be deterministic: no uncontrolled randomness, wall-clock time, or network calls inside ticks.
- Tick ordering MUST remain stable; identical inputs produce identical outputs and side-effects.
- Golden fixture graphs MUST ship with hashes or KPI snapshots that validate determinism.

### P3. Safety & Simulation Constraints

- Throughput MUST always be bounded by declared inputs, capacities, budgets, and labor or maintenance scales.
- Machines that require power MUST expose an explicit energy pin; no hidden energy budgets are allowed.
- Pin validation MUST prevent cross-type connections; typed pins are mandatory.
- Clamps MUST surface visibly via badges, tooltips, or HUD elements whenever a limit applies.

### P4. Economy-Neutral Design

- Internal economics MUST avoid real-world currencies; neutral units such as "funds" govern flows.
- Quantity, quality, and pricing data MUST remain distinct channels.
- Cost structures (OpEx, maintenance) MUST be explicit inputs; profit is derived, never fudged.

### P5. Modding & Extensibility

- Resources, node types, markets, and UI slices MUST be pluggable through validated plugins.
- JSON-first declarative manifests are preferred; DSL and deterministic logic interfaces (DLIs) are secondary escalations.
- DLIs MUST execute in sandboxed workers without network access and with seeded RNG.
- Plugin manifests MUST declare stable IDs, semantic versions, and conflict resolution rules.

### P6. Performance & Budgets

- A per-tick performance budget MUST be defined and measured; the UI MUST degrade gracefully if exceeded.
- Graph scale targets (nodes and edges) MUST be published with corresponding benchmarks.
- Hot loops MUST execute in O(N + E) time with cache-aware data structures.

### P7. UX & Interaction

- Graph readability is mandatory: bottlenecks, limits, and statuses MUST be visible without opening modals.
- Users MUST be able to manipulate nodes directly (drag, connect, delete) with undo/redo support.
- Navigation scaffolding (Play/Pause, Speed controls, Breadcrumbs, Left rail) MUST remain visible at all times.
- Color semantics MUST stay consistent with resource palettes and include accessibility redundancies.

### P8. Workforce & Maintenance (MVP)

- Labor pools MUST scale throughput deterministically; maintenance debt MUST reduce efficiency, never boost capacity.
- The MVP MUST implement pooled minutes with deterministic allocation before introducing named workers.
- HR panels MUST surface labor weights, maintenance debt, and coverage badges rooted in deterministic math.

### P9. Validation & Testing

- All JSON inputs (plugins, graphs, saves) MUST validate against locked schemas at load time.
- Black-box simulation tests MUST cover known graphs, extreme clamps, and cycle prevention, asserting hashes or metrics.
- UI contract tests MUST verify pin compatibility, edge coloring, deletion, undo/redo, and inline editing behaviors.

### P10. Data & Persistence

- Save files MUST be portable JSON containing graph, parameters, seed, and version, with no environment-specific bits.
- Schema migrations MUST be pure functions that advance prior versions deterministically.
- The client-only MVP MUST emit no telemetry or remote calls; privacy is non-negotiable.

### P11. Failure Modes & Observability

- Invalid graphs MUST fail fast with actionable messaging prior to simulation ticks.
- Every clamp MUST explain the limiting resource, edge, or budget in context.
- Optional debug panes MAY exist but MUST expose input/output scales, debts, and queue states when enabled.

### P12. Governance & Documentation

- Architectural decisions impacting reversibility MUST be captured in ADRs referencing relevant principles (for example P2).
- Each feature MUST begin with a spec slice; implementation follows the spec, not vice versa.
- Changelogs MUST describe user-facing impact for every merged slice.

### P13. Internationalization

- Specifications, IDs, and governance docs MUST be written in English.
- UI copy MUST support localization; resource labels MUST remain locale-ready.

### P14. Non-Goals (MVP)

- Multiplayer, server synchronization, or cloud persistence is out of scope.
- Detailed agronomy simulation (such as VPD or PPFD) is excluded.
- Real-world currency symbols MUST NOT appear in UI or data.

## Decision Heuristics

When principles conflict, prioritize in this order: determinism over convenience, clarity over cleverness, declarative over imperative, user signal over engine purity, and undoability over rigid workflows.

## Governance

### Amendment Process

- Amendments MUST be proposed via pull request referencing affected principles and justifications.
- Maintainers MUST review for deterministic compliance and tooling alignment (Node.js 22 LTS, pnpm, React, React Flow, Vite, Tailwind CSS).
- Approved amendments MUST bump the constitution version according to the semantic versioning rules defined below.

### Versioning Policy

- MAJOR: Removing or redefining principles or governance in ways that break precedent.
- MINOR: Adding new principles or materially expanding scope or constraints.
- PATCH: Textual clarification without changing normative requirements.

### Compliance Reviews

- `/speckit.plan` MUST include a Constitution Check gate referencing relevant principles.
- Feature specs MUST link acceptance criteria to applicable principles when scope intersects them.
- Implementation tasks MUST flag any temporary deviations and capture remediation work.