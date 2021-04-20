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
import { isVirtual } from "./utils/isVirtual";

const DEFAULT_INPUT = "multi-entry.js";
const DEFAULT_API_OUTPUT = ".thinly/index.js";
const DEFAULT_CLIENT_OUTPUT = "node_modules/.thinly";

// const AS_IMPORT = "import";
// const AS_EXPORT = "export * as x from";

type Config = {
  include: string[];
  exclude: string[];
  entryFileName: string;
};

function multi(conf: Partial<Config> = {}) {
  const config = {
    include: [],
    exclude: [],
    entryFileName: DEFAULT_INPUT,
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
        entryFileName = DEFAULT_INPUT,
        exports,
      } = input;
      config.include = include;
      config.exclude = exclude;
      config.entryFileName = entryFileName;
    }
  };

  let virtualisedEntry;

  return {
    name: "multi",

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

    // transform(code, id) {
    //   return compile(code, id, {
    //     isEntryFile: id === `\x00virtual:${config.entryFileName}`,
    //     parse: this.parse,
    //   });
    // },
  };
}

function thinly(conf: Partial<Config> = {}) {
  return {
    name: "thinly",

    transform(code, id) {
      return compile(code, id, {
        isEntryFile: isVirtual(id),
        parse: this.parse,
      });
    },
  };
}

function thinlyClient() {
  return {
    name: "thinly-client",
  };
}

const routesDirPath = join(".", "src", "routes");

async function buildExpress() {
  const bundle = await rollup({
    input: [
      join(routesDirPath, "**", "*.ts"),
      join(routesDirPath, "**", "*.js"),
    ],

    plugins: [typescript(), multi(), thinly()],

    external: ["express"],
  });

  // console.log(bundle);
  // const generated = await bundle.generate({
  //   file: "api/index.js",
  //   format: "cjs",
  // });

  await bundle.write({
    file: DEFAULT_API_OUTPUT,
    format: "cjs",
  });

  await bundle.close();
}

async function buildClient() {
  const bundle = await rollup({
    input: [
      join(routesDirPath, "**", "*.ts"),
      join(routesDirPath, "**", "*.js"),
    ],

    plugins: [typescript(), multi(), thinlyClient()],
  });

  await bundle.write({
    file: DEFAULT_CLIENT_OUTPUT,
    format: "es",
  });

  await bundle.close();
}

async function build() {
  await buildExpress();
  await buildClient();
}

build().then(() => {
  fork(join(process.cwd(), DEFAULT_API_OUTPUT));
});
