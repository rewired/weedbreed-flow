import { useEffect, useState } from "react";
import { getCompanyView, type CompanyView } from "../../domains/hierarchy";
import { GaugeBar } from "../../components/gauges/GaugeBar";

export const NavigationScaffold = () => {
  const [company, setCompany] = useState<CompanyView | null>(null);

  useEffect(() => {
    void getCompanyView().then(setCompany);
  }, []);

  return (
    <aside className="h-full w-64 border-r border-slate-800 bg-slate-950 p-4 text-slate-200">
      <h2 className="text-lg font-semibold">Hierarchy</h2>
      <p className="text-sm text-slate-400">{company?.name ?? "Loading..."}</p>
      <ul className="mt-4 space-y-3">
        {company?.structures.map((structure) => (
          <li key={structure.id} className="space-y-2 rounded bg-slate-900 p-2">
            <div className="text-sm font-medium">{structure.name}</div>
            <GaugeBar label="Grid" value={structure.budgetUtilization.grid} />
            <GaugeBar label="Water" value={structure.budgetUtilization.water} />
            <GaugeBar label="Area" value={structure.budgetUtilization.area} />
          </li>
        ))}
      </ul>
    </aside>
  );
};