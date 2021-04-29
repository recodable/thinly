import { join, basename } from 'path'
import { rollup } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { promise as matched } from 'matched'
// import { compile } from './compiler'
import { isVirtual } from './utils/isVirtual'
import {
  DEFAULT_INPUT,
  DEFAULT_API_OUTPUT,
  DEFAULT_CLIENT_OUTPUT,
  CFG_FILENAME,
} from './constants'
// import { generate } from './generator'
import copy from 'rollup-plugin-copy'
import { existsSync } from 'fs'
import pkg from '../package.json'
// import multi from '@rollup/plugin-multi-entry'
import { transformSync } from '@babel/core'
import camelCase from 'lodash.camelcase'
import { config } from './utils/config'
// import multi from './multi'
import virtual from '@rollup/plugin-virtual'
import traverse from '@babel/traverse'
import { parse } from '@babel/parser'
// import multi from '@rollup/plugin-multi-entry'

const targetPkg = require(join(process.cwd(), 'package.json'))

const cfg = config()

// const AS_IMPORT = "import";
// const AS_EXPORT = "export * as x from";

type Config = {
  include: string[]
  exclude: string[]
  entryFileName: string
  production: boolean
}

function createRouteFromPath(path) {
  const [route] = path.replace(join(process.cwd(), cfg.routeDir), '').split('.')
  return route
}

function createNameFromPath(path) {
  return camelCase(createRouteFromPath(path))
}

function multi(conf: Partial<Config> = {}) {
  const config = {
    include: [],
    exclude: [],
    entryFileName: DEFAULT_INPUT,
    exports: true,
    ...conf,
  }

  const exporter = (path) => {
    return `import { ${createNameFromPath(path)} } from ${JSON.stringify(path)}`
  }

  const configure = (input) => {
    if (typeof input === 'string') {
      config.include = [input]
    } else if (Array.isArray(input)) {
      config.include = input
    } else {
      const {
        include = [],
        exclude = [],
        entryFileName = DEFAULT_INPUT,
        exports,
      } = input
      config.include = include
      config.exclude = exclude
      config.entryFileName = entryFileName
    }
  }

  let virtualisedEntry

  return {
    name: 'multi',

    options(options) {
      if (options.input !== config.entryFileName) {
        configure(options.input)
      }
      return {
        ...options,
        input: config.entryFileName,
      }
    },

    outputOptions(options) {
      return {
        ...options,
        entryFileNames: config.entryFileName,
      }
    },

    buildStart(options) {
      const patterns = config.include.concat(
        config.exclude.map((pattern) => `!${pattern}`),
      )
      const entries = patterns.length
        ? matched(patterns, { realpath: true }).then((paths) =>
            paths.map(exporter).join('\n'),
          )
        : Promise.resolve('')

      virtualisedEntry = virtual({ [options.input]: entries })
    },

    resolveId(id, importer) {
      return virtualisedEntry && virtualisedEntry.resolveId(id, importer)
    },

    load(id) {
      return virtualisedEntry && virtualisedEntry.load(id)
    },
  }
}

// function thinly(conf: Partial<Config> = {}) {
//   return {
//     name: 'thinly',

//     transform(code, id) {
//       return compile(code, id, {
//         isEntryFile: isVirtual(id),
//         parse: this.parse,
//         production: !!conf?.production,
//         routeDir: join(process.cwd(), cfg.routeDir),
//       })
//     },
//   }
// }

// function thinlyClient(conf: Partial<Config> = {}) {
//   return {
//     name: 'thinly-client',

//     transform(code, id) {
//       return generate(code, id, {
//         isEntryFile: isVirtual(id),
//         parse: this.parse,
//         production: !!conf?.production,
//         routeDir: join(process.cwd(), cfg.routeDir),
//       })
//     },
//   }
// }

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
        name: 'thinly-route',

        transform(code, id) {
          // Exit when the file is a virtual file from @rollup/plugin/multi-entry
          if (isVirtual(id)) {
            return code
          }

          // const [route] = id
          //   .replace(join(process.cwd(), cfg.routeDir), '')
          //   .split('.')

          // const name = camelCase(route)

          const route = createRouteFromPath(id)
          const name = createNameFromPath(id)

          let hasHandler = false

          return transformSync(code, {
            babelrcRoots: false,
            plugins: [
              ({ types: t }) => {
                return {
                  visitor: {
                    Program: {
                      exit: (path) => {
                        path.node.body.push(
                          t.exportNamedDeclaration(
                            t.variableDeclaration('const', [
                              t.variableDeclarator(
                                t.identifier(name),
                                t.objectExpression([
                                  t.objectProperty(
                                    t.identifier('path'),
                                    t.stringLiteral(route),
                                  ),
                                  ...(hasHandler && [
                                    t.objectProperty(
                                      t.identifier('handler'),
                                      t.identifier('handler'),
                                    ),
                                  ]),
                                ]),
                              ),
                            ]),
                          ),
                        )
                      },
                    },

                    ExportDefaultDeclaration: {
                      enter: (path) => {
                        // todo handle error if exported value is not a value handler

                        hasHandler = true

                        path.replaceWith(
                          t.variableDeclaration('const', [
                            t.variableDeclarator(
                              t.identifier('handler'),
                              t.cloneNode(path.node.declaration),
                            ),
                          ]),
                        )
                      },
                    },
                  },
                }
              },
            ],
          })
        },
      },
      {
        name: 'thinly',

        transform(code, id) {
          if (!isVirtual(id)) {
            return code
          }

          const ast = parse(code, { sourceType: 'module' })

          const names = []

          traverse(ast, {
            ImportSpecifier(path) {
              names.push(path.node.imported.name)
            },
          })

          return [
            code,

            "import express from 'express'",
            "import bodyParser from 'body-parser'",

            'const app = express()',
            'app.use(bodyParser.json())',

            ...names.reduce((acc, name) => {
              return [...acc, `app.get('/api' + ${name}.path, ${name}.handler)`]
            }, []),

            'export default app',
          ].join('\n')
        },
      },
    ],

    external: [
      ...Object.keys(targetPkg.dependencies),
      ...pkg.bundledDependencies,
    ],
  })

  await bundle.write({
    file: '.thinly/cache/routes.js',
    format: 'cjs',
  })

  await bundle.close()
}

async function buildServer() {
  const bundle = await rollup({
    // input: [
    //   // '.thinly/cache/routes.js',
    //   join(__dirname, '..', 'server/app.js'),
    //   join(__dirname, '..', 'server/dev.js'),
    // ],
    input: join(__dirname, '..', 'server/app.js'),

    plugins: [
      typescript(),
      // multi(),
      // {
      //   name: 'merge',

      //   transform(code, id) {
      //     if (isVirtual(id)) {
      //       // const names = this.parse(code)
      //       //   .body.filter((node) => node.type === 'ImportDeclaration')
      //       //   .map((node) => node.specifiers[0].local.name)
      //       //   .filter((v) => v)

      //       return [
      //         "require('dotenv').config()",

      //         code,

      //         // ...names.map((name) => {
      //         //   return `app.use('/api/${name}', ${name})`
      //         // }),

      //         "app.listen(3000, () => console.log('API running on http://localhost:3000'))",

      //         'module.exports = app',
      //       ]
      //         .filter((v) => v)
      //         .join('\n')
      //     }
      //   },
      // },
    ],

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

// async function buildClient(options?: Options) {
//   const bundle = await rollup({
//     input: [
//       join(process.cwd(), cfg.routeDir, '**', '*.ts'),
//       join(process.cwd(), cfg.routeDir, '**', '*.js'),
//     ],

//     plugins: [
//       typescript(),
//       multi(),
//       thinlyClient({ production: true, ...options }),
//       copy({
//         targets: [
//           {
//             src: join(__dirname, 'package.json'),
//             dest: cfg.output,
//           },
//         ],
//       }),
//     ],

//     external: [
//       ...Object.keys(targetPkg.dependencies),
//       ...pkg.bundledDependencies,
//     ],
//   })

//   await bundle.write({
//     file: join(cfg.output, 'index-browser.js'),
//     format: 'es',
//   })

//   await bundle.write({
//     file: join(cfg.output, 'index.js'),
//     format: 'cjs',
//   })

//   await bundle.close()
// }

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
