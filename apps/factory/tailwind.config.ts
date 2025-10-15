const sharedContent = [
  "./index.html",
  "./src/**/*.{ts,tsx}",
  "../../packages/ui-kit/src/**/*.{ts,tsx}"
];

export default {
  content: sharedContent,
  theme: {
    extend: {
      colors: {
        energy: "#FACC15",
        water: "#3B82F6",
        nutrients: "#22D3EE",
        biomass: "#22C55E",
        wet: "#8B5CF6",
        dry: "#EC4899"
      }
    }
  },
  plugins: []
};