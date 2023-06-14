import { ConfigEnv, defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default ({ mode }: ConfigEnv) => {
  return defineConfig({
    base: mode === "development" ? "" : "/font-share/",
    plugins: [vue()],
    build: {
      outDir: "./docs",
    },
  });
};
