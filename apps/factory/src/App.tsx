import { useMemo } from "react";
import type { Edge, Node } from "reactflow";
import { PlannerCanvas } from "./app/canvas/PlannerCanvas";
import { SaveLoadPanel } from "./app/save-load/SaveLoadPanel";
import { NavigationScaffold } from "./app/navigation/NavigationScaffold";
import { ZoneSwitcher } from "./app/navigation/ZoneSwitcher";
import { GraphCanvasShell } from "@weedbreed/ui-kit";
import { HRPanel } from "./components/hr-panel/HRPanel";
import { ClampBadge } from "./components/badges/ClampBadge";
import { MaintenanceDebtCard } from "./components/maintenance/MaintenanceDebtCard";
import { TransferQueuesPanel } from "./components/transfers/TransferQueuesPanel";
import { KpiDashboard } from "./components/kpis/KpiDashboard";

const initialNodes: Node[] = [
  {
    id: "source",
    type: "input",
    data: { label: "Energy Source" },
    position: { x: 0, y: 0 },
    sourcePosition: "right"
  },
  {
    id: "sink",
    type: "output",
    data: { label: "Dry Buds" },
    position: { x: 200, y: 150 },
    targetPosition: "left"
  }
];

const initialEdges: Edge[] = [
  {
    id: "edge-1",
    source: "source",
    target: "sink",
    sourceHandle: "energy:out",
    targetHandle: "energy:in",
    type: "smoothstep"
  }
];

const App = () => {
  const header = useMemo(
    () => (
      <div className="flex items-center justify-between">
        <ZoneSwitcher hasZones={true} />
        <div className="flex items-center space-x-3">
          <ClampBadge label="Energy Clamp" factor="energy" />
          <SaveLoadPanel />
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <NavigationScaffold />
      <div className="flex-1 space-y-4 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <HRPanel />
          <MaintenanceDebtCard />
          <TransferQueuesPanel />
          <KpiDashboard />
        </div>
        <GraphCanvasShell header={header}>
          <PlannerCanvas initialNodes={initialNodes} initialEdges={initialEdges} />
        </GraphCanvasShell>
      </div>
    </div>
  );
};

export default App;