import { runSimulationWorker } from "../../workers/simulation";

export const KpiDashboard = () => {
  const output = runSimulationWorker({ seed: "kpi", ticks: 3 });
  const throughput = output.results.at(-1)?.kpis.throughput ?? 0;

  return (
    <section className="rounded border border-emerald-700 bg-emerald-950/60 p-4 text-sm text-emerald-100">
      <h3 className="text-base font-semibold">KPI Dashboard</h3>
      <p className="mt-2">Throughput (last tick): {throughput}</p>
      <p>Clamps: {output.clampEvents.length}</p>
    </section>
  );
};