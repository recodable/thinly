export default {
  input: "src/index.ts",
  output: "dist/index.js",
  plugins: [nodeResolve(), typescript(), dynamicImportVars()],
};
