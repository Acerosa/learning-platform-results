import { build } from "esbuild";
import { mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });

const shared = {
  bundle: true,
  sourcemap: true,
  target: ["es2020"],
  legalComments: "none",
  entryPoints: ["src/index.ts"]
};

await Promise.all([
  build({
    ...shared,
    outfile: "dist/learning-platform-results.esm.js",
    format: "esm"
  }),
  build({
    ...shared,
    outfile: "dist/learning-platform-results.cjs.js",
    format: "cjs"
  })
]);
