# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## Constitution Alignment *(mandatory)*

- Relevant principles: [List P# references and why they constrain this feature]
- Determinism impact: [Explain how the feature preserves seeded, reproducible outcomes]
- Toolchain commitments: Node.js 22 LTS, pnpm, React, React Flow, Vite, Tailwind CSS unless Constitution-approved variance.

## User Scenarios & Testing *(mandatory)*

> Prioritize independent user journeys. Each story MUST stand alone with clear acceptance tests and reference the principle(s) it protects.

### User Story 1 - [Brief Title] (Priority: P1)

[Describe the journey in plain language, cite key principles]

**Why this priority**: [Explain the value and constitutional rationale]

**Independent Test**: [Describe how this slice is proven end-to-end]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [deterministic outcome tied to principle ID]
2. **Given** [initial state], **When** [action], **Then** [deterministic outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe the journey, cite principles]

**Why this priority**: [...]

**Independent Test**: [...]

**Acceptance Scenarios**:

1. **Given** [...], **When** [...], **Then** [...]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe the journey, cite principles]

**Why this priority**: [...]

**Independent Test**: [...]

**Acceptance Scenarios**:

1. **Given** [...], **When** [...], **Then** [...]

---

[Add additional user stories as needed.]

### Edge Cases

- [Boundary condition tied to determinism or safety]
- [Failure mode exposing clamps, validation, or non-goals]

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: [Function] (Principles: [Px])
- **FR-002**: [Function] (Principles: [Px, Py])
- **FR-003**: [Function] (Principles: [Px])
- **FR-004**: [Function] (Principles: [Px])
- **FR-005**: [Function] (Principles: [Px])
- **FR-006**: [NEEDS CLARIFICATION: question (Principles: [Px])]

### Non-Functional Requirements

- **NFR-001**: Deterministic tick order and seeded RNG preserved (Principle P2)
- **NFR-002**: Offline-only execution, no telemetry (Principle P10)
- **NFR-003**: UI accessibility and color redundancy maintained (Principle P7)
- **NFR-004**: Performance meets published tick budget (Principle P6)
- **NFR-005**: [Additional constraint] (Principle [Px])

### Key Entities *(include if feature involves data)*

- **[Entity]**: [Purpose, attributes, relationships, invariants]
- **[Entity]**: [Purpose, attributes, relationships, invariants]

### Assumptions

- [Document reasonable defaults adopted in lieu of clarifications]

### Out of Scope

- [List deferrals aligned with Principle P14]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [Metric] (measured via [method])
- **SC-002**: [Metric]
- **SC-003**: [Metric]
- **SC-004**: [Metric]

### Observability Signals

- [What logs, clamps, or KPIs prove compliance]

## Clarifications

- [Track up to three open questions. Remove the section once resolved.]