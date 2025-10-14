import crypto from 'node:crypto'

export function canonicalStringify(value) {
  return JSON.stringify(sortValue(value))
}

function sortValue(v) {
  if (Array.isArray(v)) return v.map(sortValue)
  if (v && typeof v === 'object') {
    const o = {}
    for (const k of Object.keys(v).sort()) o[k] = sortValue(v[k])
    return o
  }
  return v
}

export function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

