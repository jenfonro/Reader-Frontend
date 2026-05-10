import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.message?.includes("contains an annotation that Rollup cannot interpret") &&
          warning.id?.includes("@vueuse/core")
        ) {
          return;
        }
        warn(warning);
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 18080,
    allowedHosts: true,
    hmr: false
  }
});
