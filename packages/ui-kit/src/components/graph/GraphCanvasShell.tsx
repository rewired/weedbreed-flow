import type { ReactNode } from "react";

interface GraphCanvasShellProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export const GraphCanvasShell = ({ header, footer, children }: GraphCanvasShellProps) => {
  return (
    <div className="flex h-full w-full flex-col bg-slate-900">
      {header ? <div className="border-b border-slate-800 p-4">{header}</div> : null}
      <div className="flex-1 overflow-hidden">{children}</div>
      {footer ? <div className="border-t border-slate-800 p-4">{footer}</div> : null}
    </div>
  );
};