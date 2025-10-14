#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { canonicalStringify, sha256 } from './util.canonicalize.mjs'

function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { ticks: 1, seed: 'seed', out: null, graph: null }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if ((a === '-g' || a === '--graph') && args[i + 1]) opts.graph = args[++i]
    else if ((a === '-t' || a === '--ticks') && args[i + 1]) opts.ticks = Number(args[++i])
    else if ((a === '-s' || a === '--seed') && args[i + 1]) opts.seed = String(args[++i])
    else if ((a === '-o' || a === '--out') && args[i + 1]) opts.out = args[++i]
  }
  if (!opts.graph) {
    console.error('Usage: node .specify/scripts/node/simulate.mjs -g <graph.json> [-t ticks] [-s seed] [-o out.json]')
    process.exit(2)
  }
  return opts
}

function stableKPISnapshot(graph, { ticks, seed }) {
  return { version: '0.0.1', seed, ticks, fundsDelta: 0, throughputs: {} }
}

function main() {
  const { graph, ticks, seed, out } = parseArgs()
  const g = JSON.parse(fs.readFileSync(path.resolve(graph), 'utf8'))
  const snapshot = stableKPISnapshot(g, { ticks, seed })
  const json = canonicalStringify(snapshot)
  const hash = sha256(json)
  const result = { hash, snapshot }
  if (out) fs.writeFileSync(out, canonicalStringify(result))
  else process.stdout.write(canonicalStringify(result) + '\n')
}

main()

