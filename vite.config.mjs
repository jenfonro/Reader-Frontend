import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const elementPlusDeps = [
  "element-plus/es/components/color-picker/index.mjs",
  "element-plus/es/components/divider/index.mjs",
  "element-plus/es/components/icon/index.mjs",
  "element-plus/es/components/input/index.mjs",
  "element-plus/es/components/message/index.mjs",
  "element-plus/es/components/popover/index.mjs",
  "element-plus/es/components/radio/index.mjs",
  "element-plus/es/components/select/index.mjs",
  "element-plus/es/components/slider/index.mjs"
];

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
  optimizeDeps: {
    include: ["vue", "@element-plus/icons-vue", ...elementPlusDeps]
  },
  server: {
    host: "0.0.0.0",
    port: 18080,
    allowedHosts: true,
    hmr: false
  }
});
