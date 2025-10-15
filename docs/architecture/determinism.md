# Determinism Guarantees

- Seeded RNG: All simulations rely on `createSeededRng` seeded by save metadata.
- Tick Order: Simulation engine runs deterministically with single-threaded loop.
- Fixtures: `@weedbreed/sim-fixtures` houses golden KPIs for regression.
- Storage: IndexedDB snapshots store serialized state, no wall-clock timestamps inside tick math.