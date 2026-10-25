import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Replit ve genel onizleme ortamlari icin: 0.0.0.0 + tum hostlara izin
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
  },
});
