interface GaugeBarProps {
  label: string;
  value: number;
}

export const GaugeBar = ({ label, value }: GaugeBarProps) => {
  const clamped = Math.min(Math.max(value, 0), 1);
  const percentage = Math.round(clamped * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 w-full rounded bg-slate-800">
        <div
          className="h-2 rounded bg-emerald-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};