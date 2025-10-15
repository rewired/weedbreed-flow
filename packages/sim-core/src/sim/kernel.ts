import {
  assertPlannerState,
  assertSaveFile,
  plannerStateFromSaveFile,
  saveFileFromPlannerState,
  validatePlannerState,
  type PlannerState,
  type SaveFile,
  type ValidationIssue
} from "../schema";
import { runSimulation, type SimulationInput, type SimulationOutput } from "./engine";

export interface ValidateGraphOutput {
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface ExportSaveInput {
  plannerState: PlannerState;
  version?: string;
  seed?: string;
}

export interface ImportSaveResult {
  plannerState: PlannerState;
  seed: string;
  version: string;
}

export interface SimulationKernelOptions {
  defaultSeed?: string;
  defaultVersion?: string;
}

const DEFAULT_VERSION = "0.1.0";

export class SimulationKernel {
  constructor(private readonly options: SimulationKernelOptions = {}) {}

  validateGraph(graph: unknown): ValidateGraphOutput {
    const result = validatePlannerState(graph);
    if (!result.ok) {
      return { isValid: false, issues: result.issues };
    }
    return { isValid: true, issues: [] };
  }

  run(input: SimulationInput): SimulationOutput {
    const state = assertPlannerState(input.graph);
    return runSimulation({ ...input, graph: state });
  }

  exportSave(input: ExportSaveInput): SaveFile {
    const state = assertPlannerState(input.plannerState);
    const seed = input.seed ?? this.options.defaultSeed;
    if (!seed) {
      throw new Error("SimulationKernel.exportSave requires a deterministic seed");
    }
    const version = input.version ?? this.options.defaultVersion ?? DEFAULT_VERSION;
    return saveFileFromPlannerState(state, seed, version);
  }

  importSave(payload: unknown): ImportSaveResult {
    const saveFile = assertSaveFile(payload);
    return {
      plannerState: plannerStateFromSaveFile(saveFile),
      seed: saveFile.seed,
      version: saveFile.version
    };
  }
}

export const createSimulationKernel = (options?: SimulationKernelOptions) => new SimulationKernel(options);
