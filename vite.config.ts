import { ConfigEnv, defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default ({ mode }: ConfigEnv) => {
  return defineConfig({
    base: mode === "development" ? "" : "/threejs-shelves/",
    plugins: [vue()],
    build: {
      outDir: "./docs",
    },
  });
};
