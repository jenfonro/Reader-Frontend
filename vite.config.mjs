import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";

const buildURLModuleId = "virtual:reader-original-build-url";
const resolvedBuildURLModuleId = "\0" + buildURLModuleId;

const buildURLModuleCode = `
const encode = value =>
  encodeURIComponent(value)
    .replace(/%3A/gi, ":")
    .replace(/%24/g, "$")
    .replace(/%2C/gi, ",")
    .replace(/%20/g, "+")
    .replace(/%5B/gi, "[")
    .replace(/%5D/gi, "]");

export default function buildURL(url, params, paramsSerializer) {
  if (!params) {
    return url;
  }

  let serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (typeof URLSearchParams !== "undefined" && params instanceof URLSearchParams) {
    serializedParams = params.toString();
  } else {
    const parts = [];
    Object.keys(params).forEach(key => {
      let value = params[key];
      if (value === null || typeof value === "undefined") {
        return;
      }

      const values = Array.isArray(value) ? value : [value];
      const paramKey = Array.isArray(value) ? key + "[]" : key;
      values.forEach(item => {
        let paramValue = item;
        if (paramValue instanceof Date) {
          paramValue = paramValue.toISOString();
        } else if (paramValue !== null && typeof paramValue === "object") {
          paramValue = JSON.stringify(paramValue);
        }
        parts.push(encode(paramKey) + "=" + encode(paramValue));
      });
    });
    serializedParams = parts.join("&");
  }

  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }

  return url;
}
`;

const originalVueCompatibility = () => ({
  name: "original-vue-compatibility",
  enforce: "pre",
  resolveId(id) {
    if (id === buildURLModuleId) {
      return resolvedBuildURLModuleId;
    }
  },
  load(id) {
    if (id === resolvedBuildURLModuleId) {
      return buildURLModuleCode;
    }
  },
  transform(code, id) {
    let transformedCode = code;
    if (
      id.endsWith("src/components/PopCatalog.vue") ||
      id.endsWith("src/components/Content.vue")
    ) {
      transformedCode = transformedCode.replace("<script>", '<script lang="jsx">');
    }
    if (id.endsWith("src/components/BookSource.vue")) {
      transformedCode = transformedCode.replace(
        'const buildURL = require("axios/lib/helpers/buildURL");',
        `import buildURL from "${buildURLModuleId}";`
      );
    }
    return transformedCode === code ? undefined : transformedCode;
  }
});

export default defineConfig({
  plugins: [originalVueCompatibility(), vue()],
  define: {
    "process.env.VUE_APP_BUILD_VERSION": JSON.stringify("")
  },
  optimizeDeps: {
    noDiscovery: true,
    include: [
      "axios",
      "element-ui",
      "localforage",
      "sortablejs",
      "vue",
      "vue-router",
      "vuex"
    ],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
        ".vue": "jsx"
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
