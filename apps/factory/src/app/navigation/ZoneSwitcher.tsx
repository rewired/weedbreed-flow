interface ZoneSwitcherProps {
  hasZones: boolean;
}

export const ZoneSwitcher = ({ hasZones }: ZoneSwitcherProps) => {
  if (!hasZones) {
    return (
      <div className="rounded border border-yellow-600 bg-yellow-950/70 p-3 text-sm text-yellow-200">
        Room currently has no zones. Add a new zone to begin planning.
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span>Select zone:</span>
      <select className="rounded bg-slate-900 px-2 py-1">
        <option>Zone A</option>
        <option>Zone B</option>
      </select>
    </div>
  );
};