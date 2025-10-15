import Dexie from "dexie";
import { describe, expect, it, beforeEach } from "vitest";
import {
  PLANNER_DB_NAME,
  exportSave,
  getActiveState,
  importSave,
  initializePersistence,
  listSnapshots,
  saveSnapshot,
  setActiveState
} from "..";
import { createEmptyPlannerState } from "@weedbreed/sim-core";

describe("persistence domain", () => {
  beforeEach(async () => {
    await Dexie.delete(PLANNER_DB_NAME);
  });

  it("initializes, saves, exports, and imports snapshots", async () => {
    const initial = await initializePersistence({ loadLatest: false, seed: "seed-a" });
    expect(initial.seed).toBe("seed-a");
    expect(initial.snapshotId).toBeUndefined();

    const state = createEmptyPlannerState();
    state.company.name = "Fixture Company";
    setActiveState(state, { seed: "seed-a" });

    const saved = await saveSnapshot({ version: "0.1.0" });
    expect(saved.id).toBeDefined();

    const summaries = await listSnapshots();
    expect(summaries).toHaveLength(1);

    const exported = exportSave();
    expect(exported.seed).toBe("seed-a");
    expect(exported.company.name).toBe("Fixture Company");

    exported.company.name = "Imported Company";
    const imported = await importSave(exported);
    expect(imported.seed).toBe("seed-a");
    const active = getActiveState();
    expect(active.state.company.name).toBe("Imported Company");

    const afterImport = await listSnapshots();
    expect(afterImport).toHaveLength(2);
  });
});
