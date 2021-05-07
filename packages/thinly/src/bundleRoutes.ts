import { join, basename } from 'path'
import rollup from 'rollup'
import typescript from '@rollup/plugin-typescript'
import multi from '@rollup/plugin-multi-entry'
import camelCase from 'lodash.camelcase'
import { transformSync } from '@babel/core'
import pkg from '../package.json'

function isVirtual(id): boolean {
  return /\x00virtual:.*/.test(id)
}

export type Hooks = {
  started?: () => any
  bundled?: (output) => any
}

export type Options = {
  watch?: boolean
  hooks?: Hooks
  exclude?: string[]
}

const defaultOptions = {
  watch: false,
  hooks: {},
  exclude: [],
}

export default async function bundleRoutes(options: Options = {}) {
  options = {
    ...defaultOptions,
    ...options,
  }

  const watcher = await rollup.watch({
    input: [
      join(process.cwd(), 'routes', '**', '*.ts'),
      join(process.cwd(), 'routes', '**', '*.js'),
    ],

    output: {
      file: '.thinly/routes.js',
      format: 'es',
    },

    plugins: [
      typescript(),
      multi(),
      {
        name: 'thinly-routes',

        transform(code, id) {
          // Exit when the file is a virtual file from @rollup/plugin/multi-entry
          if (isVirtual(id)) {
            return code
          }

          // const [route] = id
          //   .replace(join(process.cwd(), cfg.routeDir), '')
          //   .split('.')

          // const name = camelCase(route)

          let [route] = id.replace(join(process.cwd(), 'routes'), '').split('.')

          const name = camelCase(route)

          let method = 'get'

          if (
            ['get', 'post', 'put', 'patch', 'delete'].includes(basename(route))
          ) {
            const parts = route.split('/')

            method = parts.pop().toLowerCase()

            route = parts.join('/')
          }

          let hasHandler = false
          let namedExports = []

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

                                  t.objectProperty(
                                    t.identifier('method'),
                                    t.stringLiteral(method),
                                  ),

                                  ...(hasHandler &&
                                    !options.exclude.includes('handler') && [
                                      t.objectProperty(
                                        t.identifier('handler'),
                                        t.identifier('handler'),
                                      ),
                                    ]),

                                  ...namedExports.map((name) => {
                                    return t.objectProperty(
                                      t.identifier(name),
                                      t.identifier(name),
                                    )
                                  }),
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

                    ExportNamedDeclaration: {
                      enter: (path) => {
                        if (t.isFunctionDeclaration(path.node.declaration)) {
                          namedExports.push(path.node.declaration.id.name)
                        }

                        if (t.isVariableDeclaration(path.node.declaration)) {
                          path.node.declaration.declarations.forEach(({ id }) =>
                            namedExports.push(id.name),
                          )
                        }

                        path.replaceWith(path.node.declaration)
                      },
                    },
                  },
                }
              },
            ],
          })
        },
      },
    ],

    external: [...Object.keys(pkg.dependencies)],
  })

  watcher.on('event', async (event) => {
    if (event.code === 'START') {
      console.log('compiling...')

      if (options.hooks.started) {
        options.hooks.started()
      }
    }

    if (event.code === 'BUNDLE_END') {
      const { output } = await event.result.generate({
        file: '.thinly/routes.js',
        format: 'es',
      })

      if (options.hooks.bundled) {
        options.hooks.bundled(output)
      }
    }

    if (event.code === 'END' && !options.watch) {
      watcher.close()
    }
  })

  watcher.on('event', ({ result }) => {
    if (result) {
      result.close()
    }
  })

  // const { output } = await bundle.generate({
  //   file: '.thinly/routes.js',
  //   format: 'cjs',
  // })

  // await bundle.close()

  // return output
}
