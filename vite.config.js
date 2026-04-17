import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (
            id.includes("react-big-calendar") ||
            id.includes("moment") ||
            id.includes("react-overlays") ||
            id.includes("@popperjs")
          ) {
            return "vendor-calendar";
          }
          if (id.includes("chart.js") || id.includes("react-chartjs-2") || id.includes("@kurkle")) {
            return "vendor-charts";
          }
          if (id.includes("react-icons")) {
            return "vendor-icons";
          }
          if (id.includes("qrcode")) {
            return "vendor-qrcode";
          }
          if (id.includes("@emailjs")) {
            return "vendor-email";
          }
          if (
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("/react/") ||
            id.includes("@tanstack") ||
            id.includes("react-helmet-async") ||
            id.includes("scheduler") ||
            id.includes("@babel") ||
            id.includes("@remix-run") ||
            id.includes("invariant") ||
            id.includes("react-fast-compare") ||
            id.includes("shallowequal") ||
            id.includes("@tanstack/query-core")
          ) {
            return "vendor-react";
          }
          return "vendor-misc";
        },
      },
    },
  },
});
