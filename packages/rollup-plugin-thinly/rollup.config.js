import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";
// import dynamicImportVars from "@rollup/plugin-dynamic-import-vars";
// import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.ts",
  output: [
    { file: pkg.main, format: "cjs", exports: "named" },
    { file: pkg.module, format: "es" },
  ],
  plugins: [typescript()],
  external: Object.keys(pkg.dependencies),
};
