import { join, basename } from "path";
import { existsSync } from "fs";
import { rollup } from "rollup";
// import multi from "@rollup/plugin-multi-entry";
import typescript from "@rollup/plugin-typescript";
// const multi = require("@rollup/plugin-multi-entry");
import virtual from "@rollup/plugin-virtual";
import { promise as matched } from "matched";
import { fork } from "child_process";
import { compile } from "./compiler";

const DEFAULT_OUTPUT = "multi-entry.js";
// const AS_IMPORT = "import";
// const AS_EXPORT = "export * as x from";

type Config = {
  include: string[];
  exclude: string[];
  entryFileName: string;
};

function thinly(conf: Partial<Config> = {}) {
  const config = {
    include: [],
    exclude: [],
    entryFileName: DEFAULT_OUTPUT,
    exports: true,
    ...conf,
  };

  const exporter = (path) => {
    const [fileName] = basename(path).split(".");
    return `import ${fileName} from ${JSON.stringify(path)}`;
  };

  const configure = (input) => {
    if (typeof input === "string") {
      config.include = [input];
    } else if (Array.isArray(input)) {
      config.include = input;
    } else {
      const {
        include = [],
        exclude = [],
        entryFileName = DEFAULT_OUTPUT,
        exports,
      } = input;
      config.include = include;
      config.exclude = exclude;
      config.entryFileName = entryFileName;
    }
  };

  let virtualisedEntry;

  return {
    name: "thinly",

    options(options) {
      if (options.input !== config.entryFileName) {
        configure(options.input);
      }
      return {
        ...options,
        input: config.entryFileName,
      };
    },

    outputOptions(options) {
      return {
        ...options,
        entryFileNames: config.entryFileName,
      };
    },

    buildStart(options) {
      const patterns = config.include.concat(
        config.exclude.map((pattern) => `!${pattern}`)
      );
      const entries = patterns.length
        ? matched(patterns, { realpath: true }).then((paths) =>
            paths.map(exporter).join("\n")
          )
        : Promise.resolve("");

      virtualisedEntry = virtual({ [options.input]: entries });
    },

    resolveId(id, importer) {
      return virtualisedEntry && virtualisedEntry.resolveId(id, importer);
    },

    load(id) {
      return virtualisedEntry && virtualisedEntry.load(id);
    },

    transform(code, id) {
      return compile(code, id, {
        isEntryFile: id === `\x00virtual:${config.entryFileName}`,
        parse: this.parse,
      });
      // const ast = this.parse(code);
      // if (id === `\x00virtual:${config.entryFileName}`) {
      //   const names = ast.body
      //     .filter((node) => node.type === "ImportDeclaration")
      //     .map((node) => node.specifiers[0].local.name)
      //     .filter((v) => v);
      //   return [
      //     code,
      //     'const express = require("express");',
      //     "const app = express();",
      //     // ...names.map((name) => {
      //     //   return `app.get("/api/${name}", ${name}.get);`;
      //     // }),
      //     "app.listen(3000, () => console.log('API running on http://localhost:3000'));",
      //   ].join("\n");
      // }
      // console.log({ test: ast.body });
      //   if (id === `\x00virtual:${config.entryFileName}`) {
      //     const ast = this.parse(code);
      //     const names = ast.body
      //       .filter((node) => node.type === "ImportDeclaration")
      //       .map((node) => node.specifiers[0].local.name)
      //       .filter((v) => v);
      //     return [
      //       code,
      //       'const express = require("express");',
      //       "const app = express();",
      //       ...names.map((name) => {
      //         return `app.get("/api/${name}", ${name}.get);`;
      //       }),
      //       "app.listen(3000, () => console.log('API running on http://localhost:3000'));",
      //     ].join("\n");
      //   }
    },
  };
}

async function build() {
  const routesDirPath = join(".", "src", "routes");

  const bundle = await rollup({
    input: [
      join(routesDirPath, "**", "*.ts"),
      join(routesDirPath, "**", "*.js"),
    ],

    plugins: [typescript(), thinly()],

    external: ["express"],
  });

  // console.log(bundle);
  // const generated = await bundle.generate({
  //   file: "api/index.js",
  //   format: "cjs",
  // });

  await bundle.write({
    file: "api/index.js",
    format: "cjs",
  });

  await bundle.close();
}

build().then(() => {
  fork(join(process.cwd(), "api/index.js"));
});
