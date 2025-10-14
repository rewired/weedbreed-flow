#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { canonicalStringify, sha256 } from './util.canonicalize.mjs'

function simulate(graphPath, ticks, seed) {
  const snapshot = { version: '0.0.1', seed, ticks, fundsDelta: 0, throughputs: {} }
  const json = canonicalStringify(snapshot)
  const hash = sha256(json)
  return { hash, snapshot }
}

function main() {
  const fixturesDir = path.resolve(process.cwd(), '.specify', 'fixtures', 'golden')
  if (!fs.existsSync(fixturesDir)) {
    console.error('No .specify/fixtures/golden directory found')
    process.exit(0)
  }
  const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith('.kpis.json'))
  let failures = 0
  for (const f of files) {
    const kpiPath = path.join(fixturesDir, f)
    const spec = JSON.parse(fs.readFileSync(kpiPath, 'utf8'))
    const graphPath = path.join(fixturesDir, spec.graph)
    const { hash } = simulate(graphPath, spec.ticks ?? 1, spec.seed ?? 'seed')
    if (!spec.expected || spec.expected.hash === 'TBD') {
      console.warn(`[golden] ${f}: expected.hash is TBD — computed ${hash}`)
      continue
    }
    if (spec.expected.hash !== hash) {
      console.error(`[golden] ${f}: hash mismatch\n  expected: ${spec.expected.hash}\n  actual:   ${hash}`)
      failures++
    } else {
      console.log(`[golden] ${f}: OK (${hash})`)
    }
  }
  if (failures > 0) process.exit(1)
}

main()

