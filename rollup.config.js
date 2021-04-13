import typescript from "@rollup/plugin-typescript";
import run from "@rollup/plugin-run";
import replace from "@rollup/plugin-replace";

const dev = process.env.ROLLUP_WATCH === "true";

export default {
  input: "src/main.ts",

  output: {
    file: "api/index.js",
    format: "cjs",
  },

  plugins: [
    typescript(),

    replace({
      "process.env.NODE_ENV": JSON.stringify(
        dev ? "development" : "production"
      ),
    }),

    dev && run(),
  ],
};
