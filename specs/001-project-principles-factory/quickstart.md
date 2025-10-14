# Quickstart Guide

## Prerequisites
- Node.js 22 LTS installed (verify with `node -v`).
- pnpm 8 installed globally (`npm install -g pnpm@8`).
- Modern Chromium or Firefox browser for local testing.

## Install Dependencies
```bash
pnpm install
```

## Bootstrap Deterministic Fixtures
```bash
pnpm --filter sim-fixtures test
```
Generates/validates golden graphs and KPI hashes required by Principle P2/P9.

## Run the Factory Planner
```bash
pnpm --filter factory dev
```
- Opens Vite dev server at `http://localhost:5173`.
- Uses seeded simulation worker with live clamp badges.

## Run Tests
```bash
pnpm test            # Vitest unit + integration
pnpm test:e2e        # Playwright deterministic flows
```
- Ensure tests pass before committing. Golden fixture tests must report matching hashes.

## Build Production Bundle
```bash
pnpm --filter factory build
```
Outputs static assets under `apps/factory/dist/` suitable for offline hosting.

## Lint & Docs
```bash
pnpm lint            # ESLint + Tailwind conventions
pnpm docs:generate   # Emit updated JSDoc markdown extracts
```

## Saving & Loading Graphs
- Use the toolbar to export a portable JSON save (Principle P10).
- Imported saves undergo schema validation and reseeding before playback.

## Troubleshooting
- If simulation exceeds 16ms tick budget, inspect logs for automatically degraded gauges.
- Determinism drift? Re-run `pnpm --filter sim-fixtures test -- --update` only after confirming new fixture hashes with ADR documenting the change.