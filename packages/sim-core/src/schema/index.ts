import { z } from "zod";

export const resourceTypes = [
  "energy",
  "water",
  "nutrients",
  "biomass",
  "wet_buds",
  "dry_buds",
  "funds",
  "workforce",
  "compost_green",
  "compost_brown",
  "waste_gray",
  "waste_brown"
] as const;

export const resourceTypeSchema = z.enum(resourceTypes);
export type ResourceType = z.infer<typeof resourceTypeSchema>;

const pinSchema = z.object({
  name: z.string().min(1, "Pin name is required"),
  resourceType: resourceTypeSchema
});

const pinsSchema = z.object({
  inputs: z.array(pinSchema).default([]),
  outputs: z.array(pinSchema).default([])
});

const maintenanceProfileSchema = z
  .object({
    wearRatePerHour: z.number().nonnegative().optional(),
    fixPerMinute: z.number().nonnegative().optional(),
    debtMax: z.number().nonnegative().optional()
  })
  .partial()
  .optional();

const laborProfileSchema = z
  .object({
    opsPerHour: z.number().nonnegative().optional(),
    requiresWorker: z.boolean().optional(),
    laborPerUnit: z.number().nonnegative().optional()
  })
  .partial()
  .optional();

const nodeSchema = z.object({
  id: z.string().min(1, "Node id is required"),
  typeId: z.string().min(1, "Node type identifier is required"),
  label: z.string().min(1).optional(),
  footprintM2: z.number().nonnegative().optional(),
  params: z.record(z.union([z.number(), z.string(), z.boolean()])).default({}),
  pins: pinsSchema,
  labor: laborProfileSchema,
  maintenance: maintenanceProfileSchema,
  compute: z.record(z.unknown()).optional()
});

const edgeSchema = z.object({
  id: z.string().min(1, "Edge id is required"),
  sourceNodeId: z.string().min(1, "Source node id is required"),
  sourcePin: z.string().min(1, "Source pin name is required"),
  targetNodeId: z.string().min(1, "Target node id is required"),
  targetPin: z.string().min(1, "Target pin name is required"),
  resourceType: resourceTypeSchema,
  capacityPerHour: z.number().min(0).optional(),
  metadata: z.record(z.unknown()).optional()
});

const structureBudgetsSchema = z.object({
  maxAreaM2: z.number().nonnegative().optional(),
  gridCapacityKW: z.number().nonnegative().optional(),
  waterMainLph: z.number().nonnegative().optional(),
  exhaustM3ph: z.number().nonnegative().optional()
});

const laborWeightsSchema = z.object({
  ops: z.number().min(0).max(1),
  maint: z.number().min(0).max(1),
  log: z.number().min(0).max(1)
});

const laborPoolSchema = z.object({
  minutesPerHour: z.number().min(0),
  weights: laborWeightsSchema
});

const structureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  budgets: structureBudgetsSchema,
  laborPool: laborPoolSchema,
  laborWeights: laborWeightsSchema.optional(),
  rooms: z.array(z.string().min(1))
});

const zoneSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  name: z.string().optional(),
  zoneAreaM2: z.number().min(0),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema)
});

const coordinatesSchema = z
  .object({
    lat: z.number(),
    lon: z.number()
  })
  .partial();

const companySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  funds: z.number(),
  coordinates: coordinatesSchema.optional(),
  structures: z.array(z.string().min(1)).default([])
});

const pluginManifestSchemaInternal = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  wbSpecVersion: z.string().min(1).optional(),
  deterministic: z.boolean(),
  provides: z.array(z.string().min(1)).default([]),
  conflicts: z.array(z.string().min(1)).default([]),
  replaces: z.array(z.string().min(1)).default([]),
  contributions: z.record(z.unknown()).default({})
});

export const pluginManifestSchema = pluginManifestSchemaInternal;
export type PluginManifest = z.infer<typeof pluginManifestSchema>;

const plannerStateSchemaInternal = z.object({
  company: companySchema,
  structures: z.array(structureSchema),
  zones: z.array(zoneSchema),
  plugins: z.array(pluginManifestSchema)
});

export const plannerStateSchema = plannerStateSchemaInternal;
export type PlannerState = z.infer<typeof plannerStateSchema>;

const saveFileSchemaInternal = z.object({
  version: z.string().min(1),
  seed: z.string().min(1),
  company: companySchema,
  structures: z.array(structureSchema),
  zones: z.array(zoneSchema),
  plugins: z.array(pluginManifestSchema)
});

export const saveFileSchema = saveFileSchemaInternal;
export type SaveFile = z.infer<typeof saveFileSchema>;

export interface ValidationIssue {
  code: string;
  message: string;
  path: string;
}

export interface ValidationSuccess<T> {
  ok: true;
  data: T;
}

export interface ValidationFailure {
  ok: false;
  issues: ValidationIssue[];
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

const formatPath = (path: (string | number)[]) => (path.length ? path.join(".") : "$root");

const fromZodIssue = (issue: z.ZodIssue): ValidationIssue => ({
  code: `schema.${issue.code}`,
  message: issue.message,
  path: formatPath(issue.path)
});

const createIssue = (code: string, message: string, path: string): ValidationIssue => ({
  code,
  message,
  path
});

const isApproximatelyOne = (value: number) => Math.abs(1 - value) < 0.0001;

const collectPluginIssues = (plugins: PluginManifest[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const identifiers = new Map<string, number>();
  const providesMap = new Map<string, string>();

  plugins.forEach((plugin, index) => {
    if (!plugin.deterministic) {
      issues.push(
        createIssue(
          "plugins.non_deterministic",
          `Plugin ${plugin.id} must set deterministic=true`,
          `plugins.${index}.deterministic`
        )
      );
    }

    const existingIndex = identifiers.get(plugin.id);
    if (existingIndex !== undefined) {
      issues.push(
        createIssue(
          "plugins.duplicate_id",
          `Plugin id ${plugin.id} is defined multiple times`,
          `plugins.${index}.id`
        )
      );
    } else {
      identifiers.set(plugin.id, index);
    }

    plugin.provides.forEach((provided) => {
      const owner = providesMap.get(provided);
      if (owner && owner !== plugin.id) {
        issues.push(
          createIssue(
            "plugins.provides_conflict",
            `Capability ${provided} is provided by both ${owner} and ${plugin.id}`,
            `plugins.${index}.provides`
          )
        );
      } else {
        providesMap.set(provided, plugin.id);
      }
    });

    plugin.conflicts.forEach((conflictId) => {
      if (identifiers.has(conflictId)) {
        issues.push(
          createIssue(
            "plugins.conflict_detected",
            `Plugin ${plugin.id} conflicts with already loaded ${conflictId}`,
            `plugins.${index}.conflicts`
          )
        );
      }
    });
  });

  return issues;
};

const collectZoneIssues = (state: PlannerState): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  state.structures.forEach((structure, structureIndex) => {
    const weights = structure.laborWeights ?? structure.laborPool.weights;
    const weightSum = weights.ops + weights.maint + weights.log;
    if (!isApproximatelyOne(weightSum)) {
      issues.push(
        createIssue(
          "labor.weights_invalid_sum",
          `Labor weights for structure ${structure.id} must sum to 1`,
          `structures.${structureIndex}.laborWeights`
        )
      );
    }
  });

  const zoneIds = new Set<string>();
  state.zones.forEach((zone, zoneIndex) => {
    if (zoneIds.has(zone.id)) {
      issues.push(
        createIssue(
          "zones.duplicate_id",
          `Zone id ${zone.id} must be unique`,
          `zones.${zoneIndex}.id`
        )
      );
    } else {
      zoneIds.add(zone.id);
    }

    const owningStructure = state.structures.find((structure) => structure.rooms.includes(zone.roomId));
    if (!owningStructure) {
      issues.push(
        createIssue(
          "zones.orphan_room",
          `Zone ${zone.id} references room ${zone.roomId} which is not attached to any structure`,
          `zones.${zoneIndex}.roomId`
        )
      );
    }

    const nodeIds = new Map<string, number>();
    let totalFootprint = 0;
    zone.nodes.forEach((node, nodeIndex) => {
      if (nodeIds.has(node.id)) {
        issues.push(
          createIssue(
            "nodes.duplicate_id",
            `Node id ${node.id} is duplicated within zone ${zone.id}`,
            `zones.${zoneIndex}.nodes.${nodeIndex}.id`
          )
        );
      } else {
        nodeIds.set(node.id, nodeIndex);
      }

      if (typeof node.footprintM2 === "number") {
        totalFootprint += node.footprintM2;
      }
    });

    if (zone.zoneAreaM2 > 0 && totalFootprint > zone.zoneAreaM2) {
      const overflow = (totalFootprint - zone.zoneAreaM2).toFixed(2);
      issues.push(
        createIssue(
          "zones.area_exceeded",
          `Zone ${zone.id} exceeds its footprint by ${overflow} m²`,
          `zones.${zoneIndex}.zoneAreaM2`
        )
      );
    }

    const edgeIds = new Set<string>();
    zone.edges.forEach((edge, edgeIndex) => {
      if (edgeIds.has(edge.id)) {
        issues.push(
          createIssue(
            "edges.duplicate_id",
            `Edge id ${edge.id} is duplicated within zone ${zone.id}`,
            `zones.${zoneIndex}.edges.${edgeIndex}.id`
          )
        );
        return;
      }
      edgeIds.add(edge.id);

      if (!nodeIds.has(edge.sourceNodeId)) {
        issues.push(
          createIssue(
            "edges.missing_source",
            `Edge ${edge.id} references missing source node ${edge.sourceNodeId}`,
            `zones.${zoneIndex}.edges.${edgeIndex}.sourceNodeId`
          )
        );
      }
      if (!nodeIds.has(edge.targetNodeId)) {
        issues.push(
          createIssue(
            "edges.missing_target",
            `Edge ${edge.id} references missing target node ${edge.targetNodeId}`,
            `zones.${zoneIndex}.edges.${edgeIndex}.targetNodeId`
          )
        );
      }

      const sourceNodeIndex = nodeIds.get(edge.sourceNodeId);
      const targetNodeIndex = nodeIds.get(edge.targetNodeId);
      const sourceNode = typeof sourceNodeIndex === "number" ? zone.nodes[sourceNodeIndex] : undefined;
      const targetNode = typeof targetNodeIndex === "number" ? zone.nodes[targetNodeIndex] : undefined;

      const sourcePin = sourceNode?.pins.outputs.find((pin) => pin.name === edge.sourcePin);
      if (!sourcePin) {
        issues.push(
          createIssue(
            "edges.source_pin_missing",
            `Edge ${edge.id} references missing output pin ${edge.sourcePin} on node ${edge.sourceNodeId}`,
            `zones.${zoneIndex}.edges.${edgeIndex}.sourcePin`
          )
        );
      } else if (sourcePin.resourceType !== edge.resourceType) {
        issues.push(
          createIssue(
            "edges.resource_mismatch",
            `Edge ${edge.id} resource ${edge.resourceType} does not match source pin ${sourcePin.resourceType}`,
            `zones.${zoneIndex}.edges.${edgeIndex}.resourceType`
          )
        );
      }

      const targetPin = targetNode?.pins.inputs.find((pin) => pin.name === edge.targetPin);
      if (!targetPin) {
        issues.push(
          createIssue(
            "edges.target_pin_missing",
            `Edge ${edge.id} references missing input pin ${edge.targetPin} on node ${edge.targetNodeId}`,
            `zones.${zoneIndex}.edges.${edgeIndex}.targetPin`
          )
        );
      } else if (targetPin.resourceType !== edge.resourceType) {
        issues.push(
          createIssue(
            "edges.resource_mismatch",
            `Edge ${edge.id} resource ${edge.resourceType} does not match target pin ${targetPin.resourceType}`,
            `zones.${zoneIndex}.edges.${edgeIndex}.resourceType`
          )
        );
      }
    });
  });

  return issues;
};

const collectStructuralIssues = (state: PlannerState): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  state.structures.forEach((structure, index) => {
    const uniqueRooms = new Set(structure.rooms);
    if (uniqueRooms.size !== structure.rooms.length) {
      issues.push(
        createIssue(
          "structures.duplicate_room",
          `Structure ${structure.id} lists duplicate rooms`,
          `structures.${index}.rooms`
        )
      );
    }
  });

  return issues;
};

const aggregateIssues = (state: PlannerState): ValidationIssue[] => {
  return [
    ...collectPluginIssues(state.plugins),
    ...collectStructuralIssues(state),
    ...collectZoneIssues(state)
  ];
};

const evaluate = <T>(schema: z.ZodSchema<T>, input: unknown): ValidationResult<T> => {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, issues: parsed.error.issues.map(fromZodIssue) };
  }

  return { ok: true, data: parsed.data };
};

export const validatePlannerState = (graph: unknown): ValidationResult<PlannerState> => {
  const structural = evaluate(plannerStateSchema, graph);
  if (!structural.ok) {
    return structural;
  }

  const issues = aggregateIssues(structural.data);
  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return structural;
};

export const validateSaveFile = (saveFile: unknown): ValidationResult<SaveFile> => {
  const structural = evaluate(saveFileSchema, saveFile);
  if (!structural.ok) {
    return structural;
  }

  const issues = aggregateIssues(structural.data);
  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return structural;
};

export class SchemaValidationError extends Error {
  constructor(message: string, public readonly issues: ValidationIssue[]) {
    super(message);
    this.name = "SchemaValidationError";
  }
}

export const assertPlannerState = (graph: unknown): PlannerState => {
  const result = validatePlannerState(graph);
  if (!result.ok) {
    throw new SchemaValidationError("Planner state failed validation", result.issues);
  }
  return result.data;
};

export const assertSaveFile = (saveFile: unknown): SaveFile => {
  const result = validateSaveFile(saveFile);
  if (!result.ok) {
    throw new SchemaValidationError("Save file failed validation", result.issues);
  }
  return result.data;
};

export const createEmptyPlannerState = (): PlannerState => ({
  company: {
    id: "company",
    name: "WeedBreed Holdings",
    funds: 0,
    structures: []
  },
  structures: [],
  zones: [],
  plugins: []
});




export const plannerStateFromSaveFile = (saveFile: SaveFile): PlannerState => ({
  company: saveFile.company,
  structures: saveFile.structures,
  zones: saveFile.zones,
  plugins: saveFile.plugins
});

export const saveFileFromPlannerState = (
  state: PlannerState,
  seed: string,
  version: string
): SaveFile => ({
  version,
  seed,
  company: state.company,
  structures: state.structures,
  zones: state.zones,
  plugins: state.plugins
});
