import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  root: "./",
  appType: "spa",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2022"
  }
});