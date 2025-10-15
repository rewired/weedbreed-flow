import type { ComponentProps } from "react";
import { useCallback } from "react";
import ReactFlow, { Background, ConnectionMode, type Connection, type Edge, type Node, type OnConnect } from "reactflow";
import { useTypedConnectionGuard, type TypedGraphNodeData } from "./useTypedConnectionGuard";

type BaseProps = ComponentProps<typeof ReactFlow>;

export interface TypedGraphCanvasProps extends Omit<BaseProps, "nodes" | "edges" | "onConnect"> {
  nodes: Node<TypedGraphNodeData>[];
  edges: Edge[];
  onConnect?: OnConnect;
  onInvalidConnection?: (connection: Connection) => void;
}

export const TypedGraphCanvas = ({
  nodes,
  edges,
  onConnect,
  onInvalidConnection,
  className,
  ...props
}: TypedGraphCanvasProps) => {
  const guard = useTypedConnectionGuard(nodes);

  const handleConnect = useCallback<OnConnect>(
    (connection) => {
      if (!guard(connection)) {
        onInvalidConnection?.(connection);
        return;
      }
      onConnect?.(connection);
    },
    [guard, onConnect, onInvalidConnection]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onConnect={handleConnect}
      connectionMode={ConnectionMode.Loose}
      className={className ?? "bg-slate-950"}
      fitView
      snapToGrid
      proOptions={{ hideAttribution: true }}
      {...props}
    >
      <Background color="#1e293b" variant="dots" gap={24} />
    </ReactFlow>
  );
};
