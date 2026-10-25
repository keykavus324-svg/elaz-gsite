import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Replit ve genel önizleme ortamları için: 0.0.0.0 + tüm hostlara izin.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    // GitHub Pages proje sayfası /elaz-gsite/ altından yayınlanır;
    // Replit ve yerelde değişken verilmezse kök yol kullanılır.
    base: env.VITE_BASE_PATH || "/",
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
  };
});
