import { useEffect, useState } from "react";
import { runSimulationWorker } from "../../workers/simulation";

export const HRPanel = () => {
  const [opsCoverage, setOpsCoverage] = useState(0);

  useEffect(() => {
    const output = runSimulationWorker({ seed: "hr-panel", ticks: 1 });
    const workforce = output.workforce[0];
    if (workforce) {
      const total = workforce.opsMinutes + workforce.maintMinutes + workforce.logMinutes;
      setOpsCoverage(total ? workforce.opsMinutes / total : 0);
    }
  }, []);

  return (
    <section className="rounded border border-slate-800 bg-slate-900 p-4 text-sm">
      <h3 className="text-base font-semibold text-slate-100">Workforce Coverage</h3>
      <p className="mt-2 text-slate-400">Ops coverage {(opsCoverage * 100).toFixed(0)}%</p>
    </section>
  );
};