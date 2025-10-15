import {
  createEmptyPlannerState,
  runSimulation,
  type SimulationInput,
  type SimulationOutput
} from "@weedbreed/sim-core";

const emptyGraph = createEmptyPlannerState();

export const runSimulationWorker = (
  request: Partial<SimulationInput>
): SimulationOutput => {
  const graph = request.graph ?? emptyGraph;
  const seed = request.seed ?? "worker";
  const ticks = request.ticks ?? 1;
  return runSimulation({
    seed,
    ticks,
    tickBudgetMs: request.tickBudgetMs,
    graph
  });
};
