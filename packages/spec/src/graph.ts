import { z } from 'zod'

export const Structure = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  budgets: z.record(z.any()),
  laborPoolMinutesPerHour: z.number(),
  laborWeights: z.object({}).passthrough(),
})

export const Room = z.object({
  id: z.string(),
  structureId: z.string(),
  hasZones: z.boolean(),
  purpose: z.string().optional(),
  budgets: z.record(z.any()),
})

export const Zone = z.object({
  id: z.string(),
  roomId: z.string(),
  zoneArea_m2: z.number(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
})

export const Graph = z.object({
  version: z.string(),
  seed: z.string(),
  company: z.object({ funds: z.number() }),
  structures: z.array(Structure),
  rooms: z.array(Room),
  zones: z.array(Zone),
})

export type Graph = z.infer<typeof Graph>

