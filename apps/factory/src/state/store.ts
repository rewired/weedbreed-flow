import { create } from 'zustand'

type GraphState = {
  seed: string
}

export const useGraphStore = create<GraphState>(() => ({
  seed: 'speckit-seed-0001',
}))

