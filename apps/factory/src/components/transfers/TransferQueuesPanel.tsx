import { runSimulationWorker } from "../../workers/simulation";

export const TransferQueuesPanel = () => {
  const output = runSimulationWorker({ seed: "transfers", ticks: 1 });
  return (
    <section className="rounded border border-sky-800 bg-sky-950/60 p-4 text-sm text-sky-100">
      <h3 className="text-base font-semibold">Transfer Queues</h3>
      <ul className="mt-2 space-y-1">
        {output.transfers.map((transfer) => (
          <li key={transfer.transferNodeId} className="flex items-center justify-between">
            <span>{transfer.transferNodeId}</span>
            <span className="text-sky-200">
              {transfer.queuedUnits} units / ETA {transfer.averageEtaTicks} ticks
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};