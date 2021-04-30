import { join } from 'path'
import { rollup } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import multi from '@rollup/plugin-multi-entry'
import camelCase from 'lodash.camelcase'
import { transformSync } from '@babel/core'
import pkg from '../package.json'

function isVirtual(id): boolean {
  return /\x00virtual:.*/.test(id)
}

function createRouteFromPath(path) {
  const [route] = path.replace(join(process.cwd(), 'routes'), '').split('.')
  return route
}

function createNameFromPath(path) {
  return camelCase(createRouteFromPath(path))
}

export default async function bundleRoutes() {
  const bundle = await rollup({
    input: [
      join(process.cwd(), 'routes', '**', '*.ts'),
      join(process.cwd(), 'routes', '**', '*.js'),
    ],
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

          const route = createRouteFromPath(id)
          const name = createNameFromPath(id)

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
                                  ...(hasHandler && [
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

  const { output } = await bundle.generate({
    file: '.thinly/routes.js',
    format: 'cjs',
  })

  await bundle.close()

  return output
}
