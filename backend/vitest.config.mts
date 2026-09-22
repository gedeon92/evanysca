import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// Extension .mts volontaire : unplugin-swc est un module ESM, et ce projet est en CommonJS.
// Avec un vitest.config.ts classique, Vitest le chargerait en require() et échouerait sur un
// ERR_REQUIRE_ESM avant même de lancer le premier test.
//
// Les décorateurs NestJS s'appuient sur les métadonnées de type émises par TypeScript ; esbuild,
// utilisé par défaut, les efface. SWC les conserve — sans ce transformeur, toute injection de
// dépendance testée échouerait avec un « Nest can't resolve dependencies ».
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    root: "./",
    include: ["src/**/*.{spec,test}.ts"],
    setupFiles: ["reflect-metadata"],
  },
  plugins: [swc.vite({ module: { type: "es6" } })],
});
