import { join, basename } from 'path'
import { rollup } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import virtual from '@rollup/plugin-virtual'
import { promise as matched } from 'matched'
import { compile } from './compiler'
import { isVirtual } from './utils/isVirtual'
import {
  DEFAULT_INPUT,
  DEFAULT_API_OUTPUT,
  DEFAULT_CLIENT_OUTPUT,
  CFG_FILENAME,
} from './constants'
import { generate } from './generator'
import copy from 'rollup-plugin-copy'
import { existsSync } from 'fs'
import pkg from '../package.json'
import multi from '@rollup/plugin-multi-entry'
import { transformSync } from '@babel/core'
import camelCase from 'lodash.camelcase'

const targetPkg = require(join(process.cwd(), 'package.json'))

const defaultCfg = {
  output: DEFAULT_CLIENT_OUTPUT,
  routeDir: join(process.cwd(), 'src', 'routes'),
}

const cfg = existsSync(CFG_FILENAME)
  ? { ...defaultCfg, ...require(join(process.cwd(), CFG_FILENAME)) }
  : defaultCfg

// const AS_IMPORT = "import";
// const AS_EXPORT = "export * as x from";

type Config = {
  include: string[]
  exclude: string[]
  entryFileName: string
  production: boolean
}

// function multi(conf: Partial<Config> = {}) {
//   const config = {
//     include: [],
//     exclude: [],
//     entryFileName: DEFAULT_INPUT,
//     exports: true,
//     ...conf,
//   }

//   const exporter = (path) => {
//     const [fileName] = basename(path).split('.')
//     return `import ${fileName} from ${JSON.stringify(path)}`
//   }

//   const configure = (input) => {
//     if (typeof input === 'string') {
//       config.include = [input]
//     } else if (Array.isArray(input)) {
//       config.include = input
//     } else {
//       const {
//         include = [],
//         exclude = [],
//         entryFileName = DEFAULT_INPUT,
//         exports,
//       } = input
//       config.include = include
//       config.exclude = exclude
//       config.entryFileName = entryFileName
//     }
//   }

//   let virtualisedEntry

//   return {
//     name: 'multi',

//     options(options) {
//       if (options.input !== config.entryFileName) {
//         configure(options.input)
//       }
//       return {
//         ...options,
//         input: config.entryFileName,
//       }
//     },

//     outputOptions(options) {
//       return {
//         ...options,
//         entryFileNames: config.entryFileName,
//       }
//     },

//     buildStart(options) {
//       const patterns = config.include.concat(
//         config.exclude.map((pattern) => `!${pattern}`),
//       )
//       const entries = patterns.length
//         ? matched(patterns, { realpath: true }).then((paths) =>
//             paths.map(exporter).join('\n'),
//           )
//         : Promise.resolve('')

//       virtualisedEntry = virtual({ [options.input]: entries })
//     },

//     resolveId(id, importer) {
//       return virtualisedEntry && virtualisedEntry.resolveId(id, importer)
//     },

//     load(id) {
//       return virtualisedEntry && virtualisedEntry.load(id)
//     },
//   }
// }

function thinly(conf: Partial<Config> = {}) {
  return {
    name: 'thinly',

    transform(code, id) {
      return compile(code, id, {
        isEntryFile: isVirtual(id),
        parse: this.parse,
        production: !!conf?.production,
        routeDir: join(process.cwd(), cfg.routeDir),
      })
    },
  }
}

function thinlyClient(conf: Partial<Config> = {}) {
  return {
    name: 'thinly-client',

    transform(code, id) {
      return generate(code, id, {
        isEntryFile: isVirtual(id),
        parse: this.parse,
        production: !!conf?.production,
        routeDir: join(process.cwd(), cfg.routeDir),
      })
    },
  }
}

async function bundleRoutes() {
  const bundle = await rollup({
    input: [
      join(process.cwd(), cfg.routeDir, '**', '*.ts'),
      join(process.cwd(), cfg.routeDir, '**', '*.js'),
    ],
    plugins: [
      typescript(),
      multi(),
      {
        transform(code, id) {
          // Exit when the file is a virtual file from @rollup/plugin/multi-entry
          if (isVirtual(id)) {
            return code
          }

          const [route] = id
            .replace(join(process.cwd(), cfg.routeDir, '/'), '')
            .split('.')

          const name = camelCase(route)

          return transformSync(code, {
            babelrcRoots: false,
            plugins: [
              // ({ types: t }) => {
              //   return {
              //     visitor: {
              //       ExportDefaultDeclaration(path, state) {
              //         path.replaceWith(
              //           t.exportNamedDeclaration(
              //             t.variableDeclaration('const', [
              //               t.variableDeclarator(
              //                 t.identifier(name),
              //                 t.cloneNode(path.node.declaration),
              //               ),
              //             ]),
              //           ),
              //         )
              //       },
              //     },
              //   }
              // },
            ],
          })
        },
      },
    ],
    external: [
      ...Object.keys(targetPkg.dependencies),
      ...pkg.bundledDependencies,
    ],
  })

  await bundle.write({
    file: 'api/routes.js',
    format: 'cjs',
  })

  await bundle.close()
}

async function buildServer() {
  const bundle = await rollup({
    input: join(__dirname, '..', 'server/app.js'),
    plugins: [typescript()],
    external: [
      ...Object.keys(targetPkg.dependencies),
      ...pkg.bundledDependencies,
    ],
  })

  await bundle.write({
    file: DEFAULT_API_OUTPUT,
    format: 'cjs',
  })

  await bundle.close()
}

// async function buildServer(options?: Options) {
//   const bundle = await rollup({
//     input: [
//       join(process.cwd(), cfg.routeDir, '**', '*.ts'),
//       join(process.cwd(), cfg.routeDir, '**', '*.js'),
//     ],

//     plugins: [typescript(), multi(), thinly({ production: true, ...options })],

//     external: [
//       ...Object.keys(targetPkg.dependencies),
//       ...pkg.bundledDependencies,
//     ],
//   })

//   await bundle.write({
//     file: DEFAULT_API_OUTPUT,
//     format: 'cjs',
//   })

//   await bundle.close()
// }

async function buildClient(options?: Options) {
  const bundle = await rollup({
    input: [
      join(process.cwd(), cfg.routeDir, '**', '*.ts'),
      join(process.cwd(), cfg.routeDir, '**', '*.js'),
    ],

    plugins: [
      typescript(),
      multi(),
      thinlyClient({ production: true, ...options }),
      copy({
        targets: [
          {
            src: join(__dirname, 'package.json'),
            dest: cfg.output,
          },
        ],
      }),
    ],

    external: [
      ...Object.keys(targetPkg.dependencies),
      ...pkg.bundledDependencies,
    ],
  })

  await bundle.write({
    file: join(cfg.output, 'index-browser.js'),
    format: 'es',
  })

  await bundle.write({
    file: join(cfg.output, 'index.js'),
    format: 'cjs',
  })

  await bundle.close()
}

type Options = {
  production?: boolean
}

export async function build(options?: Options) {
  await bundleRoutes()
  // await buildServer()
  // await buildServer(options)
  // await buildClient(options)
}

export default function run() {
  build()
}
