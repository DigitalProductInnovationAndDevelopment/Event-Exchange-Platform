import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
      components: "/src/components",
      types: "/src/types",
      services: "/src/services",
      canvas: "/src/components/canvas",
    },
  },
})
