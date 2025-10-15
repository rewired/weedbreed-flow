# ADR 2025-10: Deterministic RNG Strategy

- Use xorshift-based RNG seeded from save metadata.
- Worker invocations receive seed + tick count and must not call `Math.random`.
- Fixture hashes are derived from simulation outputs using SHA-256 for regression protection.