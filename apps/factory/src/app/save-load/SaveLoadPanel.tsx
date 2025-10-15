import { useEffect, useRef, useState } from "react";
import {
  exportSave,
  importSave,
  initializePersistence,
  listSnapshots,
  saveSnapshot,
  subscribe
} from "../../domains/persistence";

const formatTimestamp = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export const SaveLoadPanel = () => {
  const [status, setStatus] = useState<string>("Initializing…");
  const [count, setCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isActive = true;

    const refreshCount = async () => {
      const snapshots = await listSnapshots();
      if (isActive) {
        setCount(snapshots.length);
      }
    };

    const bootstrap = async () => {
      const state = await initializePersistence();
      if (!isActive) {
        return;
      }
      setStatus(state.snapshotId ? "Restored previous snapshot" : "Ready to save");
      await refreshCount();
    };

    void bootstrap();

    const unsubscribe = subscribe(() => {
      void refreshCount();
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const handleSave = async () => {
    const summary = await saveSnapshot();
    setStatus(`Saved snapshot at ${formatTimestamp(summary.savedAt)}`);
  };

  const handleExport = () => {
    const payload = exportSave();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `weedbreed-save-${payload.seed}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("Exported portable JSON save");
  };

  const handleImportRequest = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const [file] = Array.from(event.target.files ?? []);
    if (!file) {
      return;
    }
    try {
      const raw = await file.text();
      const payload = JSON.parse(raw);
      const summary = await importSave(payload);
      setStatus(`Imported save (${formatTimestamp(summary.savedAt)})`);
    } catch (error) {
      console.error("Failed to import save", error);
      setStatus("Import failed — invalid file");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <button className="rounded bg-slate-700 px-3 py-1" onClick={handleSave}>
        Save Snapshot
      </button>
      <button className="rounded bg-slate-700 px-3 py-1" onClick={handleExport}>
        Export JSON
      </button>
      <button className="rounded bg-slate-700 px-3 py-1" onClick={handleImportRequest}>
        Import JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFile}
      />
      <span>{status}</span>
      <span className="text-slate-500">Snapshots: {count}</span>
    </div>
  );
};
