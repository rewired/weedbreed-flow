# Research Summary

## Tick Budget for 150-Node Reference Graph
- Decision: Cap simulation tick execution at 16ms (˜60 FPS) for the 150-node reference graph, triggering gauge degradation if exceeded.
- Rationale: Aligns with common UI responsiveness thresholds and provides clear budget enforcement to satisfy Principle P6 guidance on published tick budgets.
- Alternatives considered: 8ms (120 FPS) rejected as too aggressive for initial MVP; 33ms (30 FPS) rejected because gauges would feel sluggish during bottleneck diagnosis.

## Client-Side Persistence Strategy
- Decision: Store active planner state in memory with periodic snapshots to IndexedDB via Dexie, plus import/export of portable JSON save files.
- Rationale: IndexedDB offers offline durability without backend coupling and matches P10 requirements for portable JSON saves.
- Alternatives considered: LocalStorage rejected for size limits and blocking writes; filesystem access APIs rejected for limited browser support.

## Deterministic RNG & Simulation Seeding
- Decision: Use a single xorshift128+ RNG seeded from save metadata, passing deterministic sub-seeds into workers to preserve reproducible tick order.
- Rationale: Ensures bit-for-bit reproducibility across browser sessions and supports golden fixture hashing (Principle P2).
- Alternatives considered: Math.random rejected for non-determinism; crypto.getRandomValues rejected because it breaks reproducibility.

## Testing Stack
- Decision: Use Vitest for deterministic unit and integration tests, React Testing Library for component behavior, and Playwright for end-to-end graph interaction flows.
- Rationale: Vitest integrates with Vite, supports fake timers/seeds; Playwright can run headless in CI to verify deterministic UI flows per P9 and P7.
- Alternatives considered: Jest rejected to avoid duplicate tooling with Vite; Cypress rejected due to heavier resource footprint and lack of native multi-browser CI parity.

## React Flow Performance Practices
- Decision: Compose graph canvas with virtualized panels, memoize node/edge renderers, and leverage React Flow's selective updates plus background workers for heavy calculations.
- Rationale: Minimizes rerenders for large graphs and keeps UI responsive while honoring P6 performance targets.
- Alternatives considered: Custom canvas renderer rejected for higher upfront cost; naive React Flow usage rejected for potential thrash at 150+ nodes.