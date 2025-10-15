interface ClampBadgeProps {
  label: string;
  factor: string;
}

export const ClampBadge = ({ label, factor }: ClampBadgeProps) => {
  return (
    <span
      role="status"
      aria-label={`Clamp caused by ${factor}`}
      className="flex items-center space-x-1 rounded bg-red-600/80 px-2 py-1 text-xs font-semibold text-red-50"
      title={`Clamped by ${factor}`}
    >
      <span aria-hidden>?</span>
      <span>{label}</span>
    </span>
  );
};