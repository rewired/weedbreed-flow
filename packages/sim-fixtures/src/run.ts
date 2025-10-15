import {
  runSimulation,
  type PlannerState,
  type SimulationInput
} from "@weedbreed/sim-core";
import { createHash } from "node:crypto";

const referencePlannerState: PlannerState = {
  company: {
    id: "fixture-company",
    name: "Fixture Company",
    funds: 0,
    coordinates: { lat: 0, lon: 0 },
    structures: ["fixture-structure"]
  },
  structures: [
    {
      id: "fixture-structure",
      name: "Fixture Structure",
      budgets: {
        maxAreaM2: 400,
        gridCapacityKW: 120,
        waterMainLph: 240,
        exhaustM3ph: 160
      },
      laborPool: {
        minutesPerHour: 360,
        weights: { ops: 0.5, maint: 0.3, log: 0.2 }
      },
      laborWeights: { ops: 0.5, maint: 0.3, log: 0.2 },
      rooms: ["fixture-room"]
    }
  ],
  zones: [
    {
      id: "fixture-zone",
      roomId: "fixture-room",
      zoneAreaM2: 200,
      nodes: [
        {
          id: "node-water-source",
          typeId: "source.water_main",
          label: "Water Source",
          footprintM2: 18,
          params: { capacityPerHour: 240 },
          pins: {
            inputs: [],
            outputs: [{ name: "out", resourceType: "water" }]
          }
        },
        {
          id: "node-dryer",
          typeId: "processor.dryer",
          label: "Dryer",
          footprintM2: 38,
          params: { capacityPerHour: 120 },
          pins: {
            inputs: [
              { name: "in", resourceType: "water" },
              { name: "energy", resourceType: "energy" }
            ],
            outputs: [{ name: "out", resourceType: "dry_buds" }]
          },
          labor: { opsPerHour: 1.25 }
        },
        {
          id: "node-market",
          typeId: "sink.market_contract",
          label: "Market",
          footprintM2: 14,
          params: { contractCapPerHour: 120 },
          pins: {
            inputs: [{ name: "in", resourceType: "dry_buds" }],
            outputs: []
          }
        }
      ],
      edges: [
        {
          id: "edge-water",
          sourceNodeId: "node-water-source",
          sourcePin: "out",
          targetNodeId: "node-dryer",
          targetPin: "in",
          resourceType: "water",
          capacityPerHour: 200
        },
        {
          id: "edge-dry",
          sourceNodeId: "node-dryer",
          sourcePin: "out",
          targetNodeId: "node-market",
          targetPin: "in",
          resourceType: "dry_buds",
          capacityPerHour: 110
        }
      ]
    }
  ],
  plugins: [
    {
      id: "core-fixture",
      version: "0.1.0",
      wbSpecVersion: "0.1.0",
      deterministic: true,
      provides: ["core"],
      conflicts: [],
      replaces: [],
      contributions: {}
    }
  ]
};

export interface FixtureResult {
  ticksExecuted: number;
  hash: string;
}

const buildInput = (overrides: Partial<SimulationInput> = {}): SimulationInput => ({
  seed: "fixture-seed",
  ticks: 10,
  graph: referencePlannerState,
  ...overrides
});

export const runReferenceFixture = (): FixtureResult => {
  const output = runSimulation(buildInput());
  const normalized = {
    ticksExecuted: output.ticksExecuted,
    clampEvents: output.clampEvents,
    workforce: output.workforce,
    transfers: output.transfers,
    kpis: output.kpis
  };
  const hash = createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex");

  return {
    ticksExecuted: output.ticksExecuted,
    hash
  };
};

export { referencePlannerState };
