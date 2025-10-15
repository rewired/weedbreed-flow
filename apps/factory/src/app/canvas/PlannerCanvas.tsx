import { memo, useMemo, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Edge,
  MiniMap,
  Node,
  OnConnect,
  useEdgesState,
  useNodesState
} from "reactflow";
import "reactflow/dist/style.css";

const isSameResource = (connection: Connection) => {
  if (!connection.sourceHandle || !connection.targetHandle) {
    return false;
  }
  const sourceType = connection.sourceHandle.split(":")[0];
  const targetType = connection.targetHandle.split(":")[0];
  return sourceType === targetType;
};

export interface PlannerCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

const PlannerCanvasComponent = ({ initialNodes = [], initialEdges = [] }: PlannerCanvasProps) => {
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = (connection) => {
    if (!isSameResource(connection)) {
      setError("Pins must share the same resource type");
      return;
    }
    setError(null);
    setEdges((eds) => addEdge(connection, eds));
  };

  const nodeTypes = useMemo(() => ({}), []);

  return (
    <div className="h-full w-full">
      {error ? <div className="bg-red-900 p-2 text-sm text-red-200">{error}</div> : null}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export const PlannerCanvas = memo(PlannerCanvasComponent);