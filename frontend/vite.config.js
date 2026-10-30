import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build output goes to dist/ (Vercel's default for Vite).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: { outDir: "dist", sourcemap: false },
});
