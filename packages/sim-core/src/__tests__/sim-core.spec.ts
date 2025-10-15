import { describe, expect, it } from "vitest";
import {
  PluginRegistry,
  createSimulationKernel,
  createXorshift128Plus,
  runSimulation,
  validatePlannerState,
  type PlannerState,
  type SimulationInput
} from "..";

const buildPlannerState = (): PlannerState => ({
  company: {
    id: "company",
    name: "WeedBreed",
    funds: 0,
    structures: ["structure"]
  },
  structures: [
    {
      id: "structure",
      name: "Fixture Structure",
      budgets: {
        maxAreaM2: 400,
        gridCapacityKW: 200,
        waterMainLph: 160,
        exhaustM3ph: 120
      },
      laborPool: {
        minutesPerHour: 240,
        weights: { ops: 0.5, maint: 0.3, log: 0.2 }
      },
      laborWeights: { ops: 0.5, maint: 0.3, log: 0.2 },
      rooms: ["room"]
    }
  ],
  zones: [
    {
      id: "zone",
      roomId: "room",
      zoneAreaM2: 120,
      nodes: [
        {
          id: "node-a",
          typeId: "source.water",
          label: "Source",
          footprintM2: 20,
          params: {},
          pins: {
            inputs: [],
            outputs: [{ name: "out", resourceType: "water" }]
          }
        },
        {
          id: "node-b",
          typeId: "processor",
          label: "Processor",
          footprintM2: 45,
          params: {},
          pins: {
            inputs: [{ name: "in", resourceType: "water" }],
            outputs: [{ name: "out", resourceType: "dry_buds" }]
          },
          labor: { opsPerHour: 1.1 }
        },
        {
          id: "node-c",
          typeId: "sink",
          label: "Sink",
          footprintM2: 18,
          params: {},
          pins: {
            inputs: [{ name: "in", resourceType: "dry_buds" }],
            outputs: []
          }
        }
      ],
      edges: [
        {
          id: "edge-1",
          sourceNodeId: "node-a",
          sourcePin: "out",
          targetNodeId: "node-b",
          targetPin: "in",
          resourceType: "water",
          capacityPerHour: 120
        },
        {
          id: "edge-2",
          sourceNodeId: "node-b",
          sourcePin: "out",
          targetNodeId: "node-c",
          targetPin: "in",
          resourceType: "dry_buds",
          capacityPerHour: 90
        }
      ]
    }
  ],
  plugins: [
    {
      id: "core",
      version: "0.1.0",
      wbSpecVersion: "0.1.0",
      deterministic: true,
      provides: ["core"],
      conflicts: [],
      replaces: [],
      contributions: {}
    }
  ]
});

const buildManifest = (id: string, provides: string[] = []) => ({
  id,
  version: "1.0.0",
  wbSpecVersion: "0.1.0",
  deterministic: true,
  provides,
  conflicts: [],
  replaces: [],
  contributions: {}
});

describe("xorshift128+", () => {
  it("produces deterministic sequences", () => {
    const rngA = createXorshift128Plus("seed");
    const rngB = createXorshift128Plus("seed");
    const valuesA = [rngA.next(), rngA.next(), rngA.next()];
    const valuesB = [rngB.next(), rngB.next(), rngB.next()];
    expect(valuesA).toEqual(valuesB);
    expect(rngA.nextInt(10)).toBe(rngB.nextInt(10));
  });
});

describe("schema validation", () => {
  it("accepts valid planner state", () => {
    const result = validatePlannerState(buildPlannerState());
    expect(result.ok).toBe(true);
  });

  it("detects duplicate node ids", () => {
    const state = buildPlannerState();
    state.zones[0].nodes.push({
      ...state.zones[0].nodes[0],
      id: "node-a",
      label: "Duplicate",
      pins: state.zones[0].nodes[0].pins
    });

    const result = validatePlannerState(state);
    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.issues.map((issue) => issue.code)).toContain("nodes.duplicate_id");
  });
});

describe("simulation", () => {
  it("returns deterministic output per seed", () => {
    const input = {
      seed: "deterministic",
      ticks: 5,
      graph: buildPlannerState()
    } satisfies SimulationInput;

    const first = runSimulation(input);
    const second = runSimulation(input);
    expect(first).toEqual(second);
    expect(first.kpis["zone:zone:throughput"]).toBeDefined();
  });
});

describe("plugin registry", () => {
  it("rejects conflicting provides", () => {
    const registry = new PluginRegistry();
    const primary = registry.register({
      id: "core",
      version: "1.0.0",
      wbSpecVersion: "0.1.0",
      deterministic: true,
      provides: ["planner"],
      conflicts: [],
      replaces: [],
      contributions: {}
    });
    expect(primary.ok).toBe(true);

    const conflict = registry.register({
      id: "extension",
      version: "1.0.0",
      wbSpecVersion: "0.1.0",
      deterministic: true,
      provides: ["planner"],
      conflicts: [],
      replaces: [],
      contributions: {}
    });
    expect(conflict.ok).toBe(false);
    expect(conflict.issues?.[0]?.code).toBe("plugins.provides_conflict");
  });

  it("loads manifests in deterministic source order", () => {
    const registry = new PluginRegistry();
    const { manifests } = registry.load([
      { manifest: buildManifest("user"), kind: "user", source: "user" },
      { manifest: buildManifest("core"), kind: "core", source: "core" }
    ]);
    expect(manifests.map((manifest) => manifest.id)).toEqual(["core", "user"]);
  });

  it("annotates issue paths with descriptor labels", () => {
    const registry = new PluginRegistry();
    const { issues } = registry.load([
      { manifest: buildManifest("core", ["planner"]), kind: "core", source: "core" },
      { manifest: buildManifest("extension", ["planner"]), kind: "user", source: "mods" }
    ]);
    expect(issues[0]?.code).toBe("plugins.provides_conflict");
    expect(issues[0]?.path).toContain("mods");
  });
});

describe("simulation kernel", () => {
  it("validates, runs, and exports deterministic saves", () => {
    const kernel = createSimulationKernel({ defaultSeed: "seed-a", defaultVersion: "0.1.0" });
    const state = buildPlannerState();

    const validation = kernel.validateGraph(state);
    expect(validation.isValid).toBe(true);

    const run = kernel.run({ seed: "seed-a", ticks: 3, graph: state });
    expect(run.ticksExecuted).toBe(3);

    const save = kernel.exportSave({ plannerState: state });
    expect(save.seed).toBe("seed-a");

    const imported = kernel.importSave(save);
    expect(imported.seed).toBe("seed-a");
    expect(imported.plannerState.company.id).toBe("company");
  });

  it("throws when exporting without a seed", () => {
    const kernel = createSimulationKernel();
    const state = buildPlannerState();
    expect(() => kernel.exportSave({ plannerState: state })).toThrow(/seed/i);
  });
});
