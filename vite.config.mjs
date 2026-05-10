import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts: true,
    hmr: false,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === 'INVALID_ANNOTATION'
          && warning.id?.includes('@vueuse/core')
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
});
