import { runSimulationWorker } from "../../workers/simulation";

export const MaintenanceDebtCard = () => {
  const output = runSimulationWorker({ seed: "maintenance", ticks: 1 });
  const clamp = output.clampEvents[0];

  return (
    <div className="rounded border border-amber-600 bg-amber-950/60 p-4 text-sm text-amber-100">
      <div className="text-base font-semibold">Maintenance Debt</div>
      {clamp ? (
        <p className="mt-2">Clamped node {clamp.nodeId} due to {clamp.limitingFactor}.</p>
      ) : (
        <p className="mt-2">No active maintenance clamps.</p>
      )}
    </div>
  );
};