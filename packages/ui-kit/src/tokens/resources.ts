import type { ResourceType } from "@weedbreed/sim-core";

export type PinShape = "circle" | "diamond" | "hex" | "rounded" | "square";

export interface ResourceToken {
  id: ResourceType;
  label: string;
  color: string;
  icon: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  pinShape: PinShape;
}

const tokens: Record<ResourceType, ResourceToken> = {
  energy: {
    id: "energy",
    label: "Energy",
    color: "#FACC15",
    textColor: "#0F172A",
    mutedColor: "rgba(250, 204, 21, 0.16)",
    borderColor: "#F59E0B",
    icon: "bolt",
    pinShape: "hex"
  },
  water: {
    id: "water",
    label: "Water",
    color: "#3B82F6",
    textColor: "#0B1120",
    mutedColor: "rgba(59, 130, 246, 0.18)",
    borderColor: "#2563EB",
    icon: "humidity_low",
    pinShape: "circle"
  },
  nutrients: {
    id: "nutrients",
    label: "Nutrients",
    color: "#22D3EE",
    textColor: "#082F49",
    mutedColor: "rgba(34, 211, 238, 0.2)",
    borderColor: "#06B6D4",
    icon: "science",
    pinShape: "diamond"
  },
  biomass: {
    id: "biomass",
    label: "Biomass",
    color: "#22C55E",
    textColor: "#052E16",
    mutedColor: "rgba(34, 197, 94, 0.18)",
    borderColor: "#16A34A",
    icon: "eco",
    pinShape: "rounded"
  },
  wet_buds: {
    id: "wet_buds",
    label: "Wet Buds",
    color: "#8B5CF6",
    textColor: "#1E1B4B",
    mutedColor: "rgba(139, 92, 246, 0.22)",
    borderColor: "#7C3AED",
    icon: "spa",
    pinShape: "diamond"
  },
  dry_buds: {
    id: "dry_buds",
    label: "Dry Buds",
    color: "#EC4899",
    textColor: "#4A044E",
    mutedColor: "rgba(236, 72, 153, 0.22)",
    borderColor: "#DB2777",
    icon: "cannabis",
    pinShape: "diamond"
  },
  funds: {
    id: "funds",
    label: "Funds",
    color: "#D4D4D8",
    textColor: "#0F172A",
    mutedColor: "rgba(212, 212, 216, 0.18)",
    borderColor: "#A1A1AA",
    icon: "payments",
    pinShape: "square"
  },
  workforce: {
    id: "workforce",
    label: "Workforce",
    color: "#EF4444",
    textColor: "#450A0A",
    mutedColor: "rgba(239, 68, 68, 0.2)",
    borderColor: "#DC2626",
    icon: "groups",
    pinShape: "rounded"
  },
  compost_green: {
    id: "compost_green",
    label: "Compost (Green)",
    color: "#84CC16",
    textColor: "#1A2E05",
    mutedColor: "rgba(132, 204, 22, 0.2)",
    borderColor: "#65A30D",
    icon: "compost",
    pinShape: "square"
  },
  compost_brown: {
    id: "compost_brown",
    label: "Compost (Brown)",
    color: "#784134",
    textColor: "#170F0C",
    mutedColor: "rgba(120, 65, 52, 0.22)",
    borderColor: "#8C4B3B",
    icon: "compost",
    pinShape: "square"
  },
  waste_gray: {
    id: "waste_gray",
    label: "Waste (Gray)",
    color: "#78716C",
    textColor: "#111827",
    mutedColor: "rgba(120, 113, 108, 0.24)",
    borderColor: "#57534E",
    icon: "delete",
    pinShape: "square"
  },
  waste_brown: {
    id: "waste_brown",
    label: "Waste (Brown)",
    color: "#92400E",
    textColor: "#1F1307",
    mutedColor: "rgba(146, 64, 14, 0.26)",
    borderColor: "#B45309",
    icon: "delete",
    pinShape: "square"
  }
};

export const resourceTokens = tokens;

export const resourceOrder: ResourceType[] = [
  "energy",
  "water",
  "nutrients",
  "biomass",
  "wet_buds",
  "dry_buds",
  "funds",
  "workforce",
  "compost_green",
  "compost_brown",
  "waste_gray",
  "waste_brown"
];

export const getResourceToken = (resource: ResourceType): ResourceToken => tokens[resource];

export const resourcePalette = resourceOrder.map((resource) => tokens[resource]);
