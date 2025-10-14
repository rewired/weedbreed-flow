import { createHash } from 'node:crypto'

export type KPISnapshot = {
  version: string
  seed: string
  ticks: number
  fundsDelta: number
  throughputs: Record<string, number>
}

export function simulateDeterministic(seed: string, ticks: number): KPISnapshot {
  return { version: '0.0.1', seed, ticks, fundsDelta: 0, throughputs: {} }
}

export function canonicalStringify(value: unknown): string {
  return JSON.stringify(sortValue(value as any))
}

function sortValue(v: any): any {
  if (Array.isArray(v)) return v.map(sortValue)
  if (v && typeof v === 'object') {
    const o: any = {}
    for (const k of Object.keys(v).sort()) o[k] = sortValue(v[k])
    return o
  }
  return v
}

export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

export function hashSnapshot(s: KPISnapshot): string {
  return sha256(canonicalStringify(s))
}

