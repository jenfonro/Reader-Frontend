import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const appVersion = process.env.APP_VERSION || String(Date.now());

const createVersionInfo = assets => ({
  version: appVersion,
  builtAt: new Date(Number(appVersion) || Date.now()).toISOString(),
  assets
});

const appVersionPlugin = () => ({
  name: "reader-app-version",
  configureServer(server) {
    server.middlewares.use("/app-version.json", (request, response) => {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(createVersionInfo(["/", "/index.html", "/src/main.js"])));
    });
  },
  generateBundle(_, bundle) {
    const bundleAssets = Object.keys(bundle)
      .filter(fileName => !fileName.endsWith(".map"))
      .map(fileName => `/${fileName}`);
    const assets = ["/service-worker.js", ...bundleAssets];

    this.emitFile({
      type: "asset",
      fileName: "app-version.json",
      source: `${JSON.stringify(createVersionInfo(assets), null, 2)}\n`
    });
  }
});

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
  plugins: [vue(), appVersionPlugin()],
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
