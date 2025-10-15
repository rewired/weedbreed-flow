import { useCallback } from "react";
import type { Connection, Node } from "reactflow";
import type { ResourceType } from "@weedbreed/sim-core";

type PinDirection = "input" | "output";

export interface TypedPin {
  id: string;
  resourceType: ResourceType;
  label?: string;
}

export interface TypedGraphNodeData {
  pins: {
    inputs: TypedPin[];
    outputs: TypedPin[];
  };
}

type GraphNode = Node<TypedGraphNodeData>;

const findPin = (node: GraphNode | undefined, handleId: string | null, direction: PinDirection) => {
  if (!node || !handleId) {
    return undefined;
  }
  const collection = direction === "input" ? node.data?.pins.inputs : node.data?.pins.outputs;
  return collection?.find((pin) => pin.id === handleId);
};

export const describeConnection = (nodes: GraphNode[], connection: Connection) => {
  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);
  const sourcePin = findPin(sourceNode, connection.sourceHandle ?? null, "output");
  const targetPin = findPin(targetNode, connection.targetHandle ?? null, "input");

  return { sourceNode, targetNode, sourcePin, targetPin };
};

export const useTypedConnectionGuard = (nodes: GraphNode[]) =>
  useCallback(
    (connection: Connection) => {
      const { sourcePin, targetPin } = describeConnection(nodes, connection);
      if (!sourcePin || !targetPin) {
        return false;
      }
      return sourcePin.resourceType === targetPin.resourceType;
    },
    [nodes]
  );
