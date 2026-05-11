import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const appVersion = process.env.APP_VERSION || String(Date.now());

const createVersionInfo = (assets, app = {}) => ({
  version: appVersion,
  builtAt: new Date(Number(appVersion) || Date.now()).toISOString(),
  assets,
  app: {
    entry: app.entry || "",
    styles: Array.isArray(app.styles) ? app.styles : []
  }
});

const listPublicAssets = (dir = "public", root = dir) => {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir).flatMap(fileName => {
    const filePath = join(dir, fileName);
    const fileStat = statSync(filePath);

    if (fileStat.isDirectory()) {
      return listPublicAssets(filePath, root);
    }

    if (!fileStat.isFile()) {
      return [];
    }

    return [`/${relative(root, filePath).split(sep).join("/")}`];
  });
};

const appVersionPlugin = () => ({
  name: "reader-app-version",
  configureServer(server) {
    server.middlewares.use("/app-version.json", (request, response) => {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(
        JSON.stringify(
          createVersionInfo(["/", "/index.html", "/src/bootstrap.js", "/src/main.js"], {
            entry: "/src/main.js"
          })
        )
      );
    });
  },
  generateBundle(_, bundle) {
    const bundleItems = Object.values(bundle);
    const bundleAssets = bundleItems
      .map(item => item.fileName)
      .filter(fileName => fileName && !fileName.endsWith(".map"))
      .map(fileName => `/${fileName}`);
    const mainChunk = bundleItems.find(item => {
      if (item.type !== "chunk") return false;
      if (item.name === "main") return true;
      if (item.facadeModuleId) {
        return item.facadeModuleId.split(sep).join("/").endsWith("/src/main.js");
      }
      return item.fileName.startsWith("assets/main-") && item.fileName.endsWith(".js");
    });
    const appStyles = bundleItems
      .filter(item => item.type === "asset" && item.fileName.endsWith(".css"))
      .map(item => `/${item.fileName}`);
    const assets = [...new Set([...listPublicAssets(), ...bundleAssets])];

    this.emitFile({
      type: "asset",
      fileName: "app-version.json",
      source: `${JSON.stringify(
        createVersionInfo(assets, {
          entry: mainChunk ? `/${mainChunk.fileName}` : "",
          styles: appStyles
        }),
        null,
        2
      )}\n`
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
      output: {
        manualChunks(id) {
          if (id.includes("vite/preload-helper")) {
            return "vite-preload-helper";
          }
          if (id.includes("plugin-vue:export-helper")) {
            return "vue-helper";
          }
          return undefined;
        }
      },
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
