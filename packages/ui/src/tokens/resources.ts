export type ResourceId =
  | 'energy'
  | 'water'
  | 'nutrients'
  | 'biomass'
  | 'wet_buds'
  | 'dry_buds'
  | 'funds'
  | 'workforce'
  | 'compost_green'
  | 'compost_brown'
  | 'waste_gray'
  | 'waste_brown'

export const ResourceColor: Record<ResourceId, string> = {
  energy: '#FACC15',
  water: '#3B82F6',
  nutrients: '#22D3EE',
  biomass: '#22C55E',
  wet_buds: '#8B5CF6',
  dry_buds: '#EC4899',
  funds: '#D4D4D8',
  workforce: '#EF4444',
  compost_green: '#84CC16',
  compost_brown: '#B45309',
  waste_gray: '#71717A',
  waste_brown: '#92400E',
}

