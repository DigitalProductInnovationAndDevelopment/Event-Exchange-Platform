import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: "/Event-Exchange-Platform",
  resolve: {
    alias: {
      src: "/src",
      components: "/src/components",
      types: "/src/types",
      services: "/src/services",
      canvas: "/src/components/canvas",
    },
  },
}))
