export type NodeId = string;
export type EdgeId = string;

export interface GraphNode {
  id: NodeId;
  typeId: string;
  label: string;
  footprint: number;
}

export interface GraphEdge {
  id: EdgeId;
  sourceNodeId: NodeId;
  targetNodeId: NodeId;
  resourceType: string;
  capacityPerHour: number;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const createEmptyGraph = (): GraphState => ({ nodes: [], edges: [] });

export const addNode = (graph: GraphState, node: GraphNode): GraphState => {
  if (graph.nodes.some((existing) => existing.id === node.id)) {
    return graph;
  }
  return {
    ...graph,
    nodes: [...graph.nodes, node]
  };
};

export const addEdge = (graph: GraphState, edge: GraphEdge): GraphState => {
  const source = graph.nodes.find((node) => node.id === edge.sourceNodeId);
  const target = graph.nodes.find((node) => node.id === edge.targetNodeId);
  if (!source || !target) {
    throw new Error("Cannot connect pins without existing nodes");
  }
  return {
    ...graph,
    edges: [...graph.edges, edge]
  };
};

export const updateEdgeCapacity = (
  graph: GraphState,
  edgeId: EdgeId,
  capacityPerHour: number
): GraphState => {
  return {
    ...graph,
    edges: graph.edges.map((edge) =>
      edge.id === edgeId ? { ...edge, capacityPerHour } : edge
    )
  };
};