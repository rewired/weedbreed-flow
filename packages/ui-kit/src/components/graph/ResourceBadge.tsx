import clsx from "clsx";
import type { ResourceType } from "@weedbreed/sim-core";
import { getResourceToken } from "../../tokens/resources";

export interface ResourceBadgeProps {
  resource: ResourceType;
  label?: string;
  className?: string;
  iconClassName?: string;
}

export const ResourceBadge = ({ resource, label, className, iconClassName }: ResourceBadgeProps) => {
  const token = getResourceToken(resource);
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide",
        className
      )}
      style={{ backgroundColor: token.mutedColor, color: token.textColor, borderColor: token.borderColor }}
    >
      <span className={clsx("material-symbols-outlined text-base", iconClassName)} aria-hidden>
        {token.icon}
      </span>
      <span>{label ?? token.label}</span>
    </span>
  );
};
