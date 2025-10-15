import { createXorshift128Plus, deriveSeed } from "../rng/xorshift128plus";
import {
  assertPlannerState,
  type PlannerState,
  type ResourceType
} from "../schema";

const clampFactors = ["input", "edge", "budget", "labor", "maintenance", "energy"] as const;
export type ClampFactor = (typeof clampFactors)[number];

export interface ClampEvent {
  nodeId: string;
  limitingFactor: ClampFactor;
  magnitude: number;
  message?: string;
}

export interface WorkforceAllocation {
  nodeId: string;
  opsMinutes: number;
  maintMinutes: number;
  logMinutes: number;
}

export interface TransferSnapshot {
  transferNodeId: string;
  queuedUnits: number;
  averageEtaTicks: number;
}

export interface SimulationInput {
  seed: string;
  graph: PlannerState;
  ticks: number;
  tickBudgetMs?: number;
}

export interface SimulationOutput {
  ticksExecuted: number;
  clampEvents: ClampEvent[];
  workforce: WorkforceAllocation[];
  transfers: TransferSnapshot[];
  kpis: Record<string, number>;
}

type ZoneDescriptor = {
  zoneId: string;
  roomId: string;
  nodes: PlannerState["zones"][number]["nodes"];
  edges: PlannerState["zones"][number]["edges"];
  area: number;
  totalFootprint: number;
  utilization: number;
  totalCapacity: number;
  capacityByResource: Map<ResourceType, number>;
};

type StructureDescriptor = {
  structureId: string;
  minutesPerHour: number;
  weights: {
    ops: number;
    maint: number;
    log: number;
  };
};

const roundTo = (value: number, digits: number) => {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
};

const determineStructureDescriptors = (state: PlannerState) => {
  const roomToStructure = new Map<string, StructureDescriptor>();

  state.structures.forEach((structure) => {
    const weights = structure.laborWeights ?? structure.laborPool.weights;
    const descriptor: StructureDescriptor = {
      structureId: structure.id,
      minutesPerHour: structure.laborPool.minutesPerHour,
      weights
    };
    structure.rooms.forEach((roomId) => roomToStructure.set(roomId, descriptor));
  });

  return roomToStructure;
};

const computeZoneDescriptors = (state: PlannerState): ZoneDescriptor[] => {
  return state.zones
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((zone) => {
      const nodes = zone.nodes.slice().sort((a, b) => a.id.localeCompare(b.id));
      const edges = zone.edges.slice().sort((a, b) => a.id.localeCompare(b.id));
      const totalFootprint = nodes.reduce((sum, node) => sum + (node.footprintM2 ?? 0), 0);
      const totalCapacity = edges.reduce((sum, edge) => sum + (edge.capacityPerHour ?? 0), 0);
      const utilization = zone.zoneAreaM2 > 0 ? totalFootprint / zone.zoneAreaM2 : 0;
      const capacityByResource = edges.reduce((acc, edge) => {
        const current = acc.get(edge.resourceType) ?? 0;
        acc.set(edge.resourceType, current + (edge.capacityPerHour ?? 0));
        return acc;
      }, new Map<ResourceType, number>());

      return {
        zoneId: zone.id,
        roomId: zone.roomId,
        nodes,
        edges,
        area: zone.zoneAreaM2,
        totalFootprint,
        utilization,
        totalCapacity,
        capacityByResource
      } satisfies ZoneDescriptor;
    });
};

const addClampEvent = (
  collection: Map<string, ClampEvent>,
  nodeId: string,
  factor: ClampFactor,
  magnitude: number,
  message?: string
) => {
  const key = `${nodeId}:${factor}`;
  if (collection.has(key)) {
    return;
  }
  collection.set(key, {
    nodeId,
    limitingFactor: factor,
    magnitude: roundTo(magnitude, 3),
    message
  });
};

const computeClampEvents = (
  descriptors: ZoneDescriptor[],
  roomToStructure: Map<string, StructureDescriptor>
): ClampEvent[] => {
  const collection = new Map<string, ClampEvent>();

  descriptors.forEach((descriptor) => {
    if (descriptor.utilization > 1) {
      addClampEvent(
        collection,
        descriptor.zoneId,
        "budget",
        descriptor.utilization,
        `Zone ${descriptor.zoneId} exceeds area allocation`
      );
    }

    descriptor.edges.forEach((edge) => {
      if ((edge.capacityPerHour ?? 0) <= 0) {
        addClampEvent(
          collection,
          edge.targetNodeId,
          "edge",
          0,
          `Edge ${edge.id} has zero capacity`
        );
      }
    });

    const structure = roomToStructure.get(descriptor.roomId);
    if (structure && structure.minutesPerHour === 0) {
      descriptor.nodes.forEach((node) => {
        addClampEvent(
          collection,
          node.id,
          "labor",
          1,
          `Structure ${structure.structureId} labor pool is exhausted`
        );
      });
    }
  });

  return Array.from(collection.values()).sort((a, b) => {
    if (a.nodeId === b.nodeId) {
      return a.limitingFactor.localeCompare(b.limitingFactor);
    }
    return a.nodeId.localeCompare(b.nodeId);
  });
};

const computeWorkforceAllocations = (
  descriptors: ZoneDescriptor[],
  roomToStructure: Map<string, StructureDescriptor>
): WorkforceAllocation[] => {
  const allocations: WorkforceAllocation[] = [];

  descriptors.forEach((descriptor) => {
    const structure = roomToStructure.get(descriptor.roomId);
    if (!structure || descriptor.nodes.length === 0) {
      return;
    }

    const baseMinutes = structure.minutesPerHour / descriptor.nodes.length;
    descriptor.nodes.forEach((node) => {
      const opsDemand = node.labor?.opsPerHour ?? 1;
      const opsMinutes = roundTo(baseMinutes * structure.weights.ops * opsDemand, 3);
      const maintMinutes = roundTo(baseMinutes * structure.weights.maint, 3);
      const logMinutes = roundTo(baseMinutes * structure.weights.log, 3);

      allocations.push({
        nodeId: node.id,
        opsMinutes,
        maintMinutes,
        logMinutes
      });
    });
  });

  return allocations.sort((a, b) => a.nodeId.localeCompare(b.nodeId));
};

const TRANSFER_RESOURCES: ResourceType[] = [
  "wet_buds",
  "dry_buds",
  "biomass",
  "water",
  "compost_green",
  "compost_brown",
  "waste_gray",
  "waste_brown"
];

const computeTransferSnapshots = (
  descriptors: ZoneDescriptor[],
  seed: string
): TransferSnapshot[] => {
  const rng = createXorshift128Plus(deriveSeed(seed, "transfers"));
  const snapshots: TransferSnapshot[] = [];

  descriptors.forEach((descriptor) => {
    descriptor.edges.forEach((edge) => {
      if (!TRANSFER_RESOURCES.includes(edge.resourceType)) {
        return;
      }
      const capacity = edge.capacityPerHour ?? 0;
      const queuedUnits = roundTo(capacity * rng.nextRange(0.05, 0.2), 3);
      const eta = capacity > 0 ? Math.max(1, Math.round(60 / capacity)) : 0;
      snapshots.push({
        transferNodeId: `${descriptor.zoneId}:${edge.id}`,
        queuedUnits,
        averageEtaTicks: eta
      });
    });
  });

  return snapshots.sort((a, b) => a.transferNodeId.localeCompare(b.transferNodeId));
};

const accumulateKpis = (
  descriptors: ZoneDescriptor[],
  ticks: number,
  seed: string
): Record<string, number> => {
  const rng = createXorshift128Plus(deriveSeed(seed, "kpis"));
  const totals = new Map<string, number>();

  for (let tick = 0; tick < ticks; tick += 1) {
    descriptors.forEach((descriptor) => {
      const throughputNoise = rng.nextRange(0.92, 1.08);
      const capacityScale = descriptor.utilization > 1 ? 1 / descriptor.utilization : 1;
      const throughput = roundTo(descriptor.totalCapacity * throughputNoise * capacityScale, 6);
      const throughputKey = `zone:${descriptor.zoneId}:throughput`;
      totals.set(throughputKey, (totals.get(throughputKey) ?? 0) + throughput);

      const utilizationKey = `zone:${descriptor.zoneId}:utilization`;
      totals.set(utilizationKey, (totals.get(utilizationKey) ?? 0) + descriptor.utilization);

      descriptor.capacityByResource.forEach((value, resource) => {
        const key = `zone:${descriptor.zoneId}:resource:${resource}`;
        totals.set(key, (totals.get(key) ?? 0) + roundTo(value, 6));
      });
    });
  }

  const result: Record<string, number> = {};
  totals.forEach((value, key) => {
    result[key] = roundTo(value / ticks, 6);
  });
  return result;
};

export const runSimulation = (input: SimulationInput): SimulationOutput => {
  const ticks = Math.floor(input.ticks);
  if (!Number.isFinite(ticks) || ticks < 1 || ticks > 3600) {
    throw new RangeError("ticks must be an integer between 1 and 3600");
  }

  const state = assertPlannerState(input.graph);
  const roomToStructure = determineStructureDescriptors(state);
  const zones = computeZoneDescriptors(state);

  const clampEvents = computeClampEvents(zones, roomToStructure);
  const workforce = computeWorkforceAllocations(zones, roomToStructure);
  const transfers = computeTransferSnapshots(zones, input.seed);
  const kpis = accumulateKpis(zones, ticks, input.seed);

  // Tick budget usage KPI
  if (input.tickBudgetMs && input.tickBudgetMs > 0) {
    const budgetUtilization = zones.reduce((total, descriptor) => {
      const base = descriptor.totalCapacity > 0 ? descriptor.totalCapacity : 1;
      return total + Math.min(1, input.tickBudgetMs / base);
    }, 0);
    kpis["simulation:tickBudgetUtilization"] = roundTo(
      budgetUtilization / Math.max(1, zones.length),
      6
    );
  }

  return {
    ticksExecuted: ticks,
    clampEvents,
    workforce,
    transfers,
    kpis
  };
};

