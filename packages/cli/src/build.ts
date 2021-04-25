import { join, basename } from "path";
import { rollup } from "rollup";
import typescript from "@rollup/plugin-typescript";
import virtual from "@rollup/plugin-virtual";
import { promise as matched } from "matched";
import { compile } from "./compiler";
import { isVirtual } from "./utils/isVirtual";
import {
  DEFAULT_INPUT,
  DEFAULT_API_OUTPUT,
  DEFAULT_CLIENT_OUTPUT,
} from "./constants";
import { generate } from "./generator";
import copy from "rollup-plugin-copy";

const pkg = require(join(process.cwd(), "package.json"));

// const AS_IMPORT = "import";
// const AS_EXPORT = "export * as x from";

type Config = {
  include: string[];
  exclude: string[];
  entryFileName: string;
  production: boolean;
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
  };
}

function thinly(conf: Partial<Config> = {}) {
  return {
    name: "thinly",

    transform(code, id) {
      return compile(code, id, {
        isEntryFile: isVirtual(id),
        parse: this.parse,
        production: !!conf?.production,
      });
    },
  };
}

function thinlyClient(conf: Partial<Config> = {}) {
  return {
    name: "thinly-client",

    transform(code, id) {
      return generate(code, id, {
        isEntryFile: isVirtual(id),
        parse: this.parse,
        production: !!conf?.production,
      });
    },
  };
}

const routesDirPath = join(".", "src", "routes");

async function buildExpress(options?: Options) {
  const bundle = await rollup({
    input: [
      join(routesDirPath, "**", "*.ts"),
      join(routesDirPath, "**", "*.js"),
    ],

    plugins: [typescript(), multi(), thinly({ production: true, ...options })],

    external: Object.keys(pkg.dependencies),
  });

  await bundle.write({
    file: DEFAULT_API_OUTPUT,
    format: "cjs",
  });

  await bundle.close();
}

async function buildClient(options?: Options) {
  console.log(__dirname);
  const bundle = await rollup({
    input: [
      join(routesDirPath, "**", "*.ts"),
      join(routesDirPath, "**", "*.js"),
    ],

    plugins: [
      typescript(),
      multi(),
      thinlyClient({ production: true, ...options }),
      copy({
        targets: [
          {
            src: join(__dirname, "package.json"),
            dest: DEFAULT_CLIENT_OUTPUT,
          },
        ],
      }),
    ],

    external: Object.keys(pkg.dependencies),
  });

  await bundle.write({
    file: join(DEFAULT_CLIENT_OUTPUT, "index-browser.js"),
    format: "es",
  });

  await bundle.write({
    file: join(DEFAULT_CLIENT_OUTPUT, "index.js"),
    format: "cjs",
  });

  await bundle.close();
}

type Options = {
  production?: boolean;
};

export async function build(options?: Options) {
  await buildExpress(options);
  await buildClient(options);
}

export default function run() {
  build();
}
