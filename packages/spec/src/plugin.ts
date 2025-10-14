import { z } from 'zod'

export const PluginManifest = z.object({
  id: z.string(),
  version: z.string(),
  wbSpecVersion: z.string(),
  deterministic: z.boolean(),
  name: z.string().optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  contributions: z
    .object({
      resources: z.array(z.any()).optional(),
      nodeTypes: z.array(z.any()).optional(),
      markets: z.array(z.any()).optional(),
      uiSlices: z.array(z.any()).optional(),
    })
    .partial()
    .optional(),
})

export type PluginManifest = z.infer<typeof PluginManifest>

