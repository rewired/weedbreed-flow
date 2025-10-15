# Quickstart Guide

## Prerequisites
- Install Node.js 22 LTS and pnpm 8.
- Install Playwright browsers with `pnpm exec playwright install --with-deps`.

## Install Dependencies
```bash
pnpm install
```

## Run Deterministic Fixture Tests
```bash
pnpm --filter @weedbreed/sim-fixtures test
```

## Launch Dev Server
```bash
pnpm --filter @weedbreed/factory dev
```

## Run Tests
```bash
pnpm test       # Vitest suite
pnpm test:e2e   # Playwright deterministic flows
```

## Build
```bash
pnpm --filter @weedbreed/factory build
```

## Save & Load
- Use the Save JSON button to persist to IndexedDB.
- Snapshots auto-load on refresh and display counts in the toolbar.