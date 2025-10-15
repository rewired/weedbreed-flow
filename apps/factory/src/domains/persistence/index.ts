import Dexie, { type Table } from "dexie";
import {
  assertPlannerState,
  assertSaveFile,
  createEmptyPlannerState,
  plannerStateFromSaveFile,
  saveFileFromPlannerState,
  type PlannerState,
  type SaveFile
} from "@weedbreed/sim-core";

export const PLANNER_DB_NAME = "weedbreed-flow";
const DB_NAME = PLANNER_DB_NAME;
const DB_VERSION = 1;
const DEFAULT_VERSION = "0.1.0";

export interface SnapshotRecord {
  id: string;
  savedAt: number;
  version: string;
  seed: string;
  state: PlannerState;
  label?: string;
  kpiHash?: string;
}

export type SnapshotSummary = Omit<SnapshotRecord, "state">;

export interface PersistenceState {
  snapshotId?: string;
  seed: string;
  version: string;
  state: PlannerState;
}

type PersistenceListener = (state: PersistenceState) => void;

class PlannerDatabase extends Dexie {
  snapshots!: Table<SnapshotRecord, string>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores({
      snapshots: "&id,savedAt"
    });
  }
}

const db = new PlannerDatabase();
const listeners = new Set<PersistenceListener>();

let activeState: PlannerState = createEmptyPlannerState();
let activeSeed = createSeed();
let activeVersion = DEFAULT_VERSION;
let activeSnapshotId: string | undefined;

const getSnapshotState = (): PersistenceState => ({
  snapshotId: activeSnapshotId,
  seed: activeSeed,
  version: activeVersion,
  state: activeState
});

const notify = () => {
  const snapshot = getSnapshotState();
  listeners.forEach((listener) => listener(snapshot));
};

function createSeed() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `seed-${Math.random().toString(36).slice(2)}`;
}

const createSnapshotId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `snapshot-${Math.random().toString(36).slice(2)}`;
};

export const subscribe = (listener: PersistenceListener) => {
  listeners.add(listener);
  listener(getSnapshotState());
  return () => listeners.delete(listener);
};

export const initializePersistence = async (options: { loadLatest?: boolean; seed?: string } = {}) => {
  if (!db.isOpen()) {
    await db.open();
  }

  if (options.seed) {
    activeSeed = options.seed;
  }

  if (options.loadLatest !== false) {
    const latest = await db.snapshots.orderBy("savedAt").last();
    if (latest) {
      activeState = latest.state;
      activeSeed = latest.seed;
      activeVersion = latest.version;
      activeSnapshotId = latest.id;
    }
  }

  notify();
  return getSnapshotState();
};

export const listSnapshots = async (): Promise<SnapshotSummary[]> => {
  const records = await db.snapshots.orderBy("savedAt").reverse().toArray();
  return records.map(({ state: _state, ...summary }) => summary);
};

export const loadSnapshot = async (id: string): Promise<PersistenceState | undefined> => {
  const snapshot = await db.snapshots.get(id);
  if (!snapshot) {
    return undefined;
  }

  activeState = snapshot.state;
  activeSeed = snapshot.seed;
  activeVersion = snapshot.version;
  activeSnapshotId = snapshot.id;
  notify();
  return getSnapshotState();
};

export interface SaveSnapshotOptions {
  id?: string;
  savedAt?: number;
  seed?: string;
  version?: string;
  state?: PlannerState;
  label?: string;
  kpiHash?: string;
}

export const saveSnapshot = async (options: SaveSnapshotOptions = {}): Promise<SnapshotSummary> => {
  const state = assertPlannerState(options.state ?? activeState);
  const seed = options.seed ?? activeSeed ?? createSeed();
  const version = options.version ?? activeVersion ?? DEFAULT_VERSION;

  const record: SnapshotRecord = {
    id: options.id ?? createSnapshotId(),
    savedAt: options.savedAt ?? Date.now(),
    version,
    seed,
    state,
    label: options.label,
    kpiHash: options.kpiHash
  };

  await db.snapshots.put(record);
  activeState = record.state;
  activeSeed = record.seed;
  activeVersion = record.version;
  activeSnapshotId = record.id;
  notify();

  const { state: _state, ...summary } = record;
  return summary;
};

export const deleteSnapshot = async (id: string) => {
  await db.snapshots.delete(id);
  if (activeSnapshotId === id) {
    activeSnapshotId = undefined;
  }
};

export const exportSave = (options: { state?: PlannerState; seed?: string; version?: string } = {}): SaveFile => {
  const state = assertPlannerState(options.state ?? activeState);
  const seed = options.seed ?? activeSeed;
  if (!seed) {
    throw new Error("exportSave requires a deterministic seed");
  }
  const version = options.version ?? activeVersion ?? DEFAULT_VERSION;
  return saveFileFromPlannerState(state, seed, version);
};

export const importSave = async (
  payload: unknown,
  options: { snapshotId?: string; savedAt?: number } = {}
): Promise<SnapshotSummary> => {
  const saveFile = assertSaveFile(payload);
  const record: SnapshotRecord = {
    id: options.snapshotId ?? createSnapshotId(),
    savedAt: options.savedAt ?? Date.now(),
    version: saveFile.version,
    seed: saveFile.seed,
    state: plannerStateFromSaveFile(saveFile)
  };

  await db.snapshots.put(record);
  activeState = record.state;
  activeSeed = record.seed;
  activeVersion = record.version;
  activeSnapshotId = record.id;
  notify();

  const { state: _state, ...summary } = record;
  return summary;
};

export const getActiveState = (): PersistenceState => getSnapshotState();

export const setActiveState = (
  state: PlannerState,
  options: { seed?: string; version?: string; persist?: boolean } = {}
): PersistenceState => {
  activeState = assertPlannerState(state);
  activeSeed = options.seed ?? activeSeed ?? createSeed();
  activeVersion = options.version ?? activeVersion ?? DEFAULT_VERSION;

  if (options.persist) {
    void saveSnapshot({ state: activeState, seed: activeSeed, version: activeVersion });
  } else {
    notify();
  }

  return getSnapshotState();
};
