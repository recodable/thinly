import typescript from "@rollup/plugin-typescript";
import shebang from "rollup-plugin-preserve-shebang";
import executable from "rollup-plugin-executable-output";
import pkg from "./package.json";

export default {
  input: "src/main.ts",

  output: {
    file: "dist/index.js",
    format: "cjs",
  },

  plugins: [typescript(), shebang(), executable()],

  external: [...Object.keys(pkg.dependencies), "path"],
};
