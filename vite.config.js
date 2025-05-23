import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import dsv from "@rollup/plugin-dsv";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), dsv()],
  base: "/vis-labnl-contrataciones-abiertas/",

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
