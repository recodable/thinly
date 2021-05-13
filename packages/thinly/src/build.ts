import { join } from 'path'
import bundleRoutes from './bundleRoutes'
import ts, { createSourceFile, factory, createPrinter } from 'typescript'
import { writeFileSync } from 'fs'
import { createMap } from './mapper'
import { walk } from './walker'
import { createBundle } from './bundle'
import chalk from 'chalk'
import spinner from './spinner'
import { Application } from 'express'
import { Method } from './types'

export type ClientOptions = {
  output: string
}

export type Options = {
  client: ClientOptions
}

const defaultConfig: Options = {
  client: {
    output: '.thinly/client',
  },
}

const config: Options = {
  ...defaultConfig,
  ...require(join(process.cwd(), 'thinly.config.js')),
}

export async function buildServer(routes) {
  const bundle = await createBundle(join(__dirname, 'server.ts'), routes)

  await bundle.write({
    file: '.thinly/index.js',
    format: 'cjs',
    exports: 'auto',
  })

  await bundle.close()
}

export async function buildClient(routes) {
  const bundle = await createBundle(join(__dirname, 'client.ts'), routes)

  await bundle.write({
    file: join(config.client.output, 'index.js'),
    format: 'cjs',
  })

  await bundle.write({
    file: join(config.client.output, 'index.esm.js'),
    format: 'es',
  })

  await bundle.close()
}

export async function buildClientTypes(routes) {
  const map = createMap(routes)

  const resultFile = createSourceFile(
    'index.d.ts',
    '',
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS,
  )

  const printer = createPrinter({ newLine: ts.NewLineKind.LineFeed })

  const ast = factory.createNodeArray([
    factory.createModuleDeclaration(
      undefined,
      [factory.createModifier(ts.SyntaxKind.DeclareKeyword)],
      factory.createStringLiteral('@thinly/client'),
      factory.createModuleBlock([
        factory.createModuleDeclaration(
          undefined,
          undefined,
          factory.createIdentifier('thinly'),
          factory.createModuleBlock([
            factory.createInterfaceDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('Client'),
              undefined,
              undefined,
              walk(
                map,
                [
                  {
                    match: (key) => key === '_routes',
                    handler: ({ routes, index }) => {
                      return routes[index].reduce((acc, route) => {
                        return [
                          ...acc,
                          factory.createMethodSignature(
                            undefined,
                            factory.createIdentifier(route.method),
                            undefined,
                            undefined,
                            [],
                            undefined,
                          ),
                        ]
                      }, Object.values(routes))
                    },
                  },
                  {
                    match: (key) => key.startsWith(':'),
                    handler: ({
                      routes,
                      key,
                      modifiers,
                      depth,
                      context,
                      index,
                    }) => {
                      routes[index] = factory.createMethodSignature(
                        undefined,
                        factory.createIdentifier(key.slice(1)),
                        undefined,
                        undefined,
                        [
                          factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            factory.createIdentifier('value'),
                            undefined,
                            factory.createUnionTypeNode([
                              factory.createKeywordTypeNode(
                                ts.SyntaxKind.StringKeyword,
                              ),
                              factory.createKeywordTypeNode(
                                ts.SyntaxKind.NumberKeyword,
                              ),
                            ]),
                            undefined,
                          ),
                        ],
                        factory.createTypeLiteralNode(
                          walk(
                            routes[index],
                            modifiers,
                            depth + 1,
                            context,
                            Object.values(routes[index]),
                          ),
                        ),
                      )

                      return routes
                    },
                  },
                  {
                    match: () => true,
                    handler: ({
                      routes,
                      key,
                      modifiers,
                      depth,
                      context,
                      index,
                    }) => {
                      routes[index] = factory.createPropertySignature(
                        undefined,
                        factory.createIdentifier(key),
                        undefined,
                        factory.createTypeLiteralNode(
                          walk(
                            routes[index],
                            modifiers,
                            depth + 1,
                            context,
                            Object.values(routes[index]),
                          ),
                        ),
                      )

                      return routes
                    },
                  },
                ],
                0,
                {},
                Object.values(map),
              ),
            ),
            factory.createTypeAliasDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('Options'),
              undefined,
              factory.createTypeLiteralNode([
                factory.createPropertySignature(
                  undefined,
                  factory.createIdentifier('env'),
                  undefined,
                  factory.createTypeLiteralNode([
                    factory.createPropertySignature(
                      undefined,
                      factory.createIdentifier('API_URL'),
                      undefined,
                      factory.createKeywordTypeNode(
                        ts.SyntaxKind.StringKeyword,
                      ),
                    ),
                  ]),
                ),
              ]),
            ),
            factory.createVariableStatement(
              undefined,
              factory.createVariableDeclarationList(
                [
                  factory.createVariableDeclaration(
                    factory.createIdentifier('createClient'),
                    undefined,
                    factory.createFunctionTypeNode(
                      undefined,
                      [
                        factory.createParameterDeclaration(
                          undefined,
                          undefined,
                          undefined,
                          factory.createIdentifier('options'),
                          undefined,
                          factory.createTypeReferenceNode(
                            factory.createIdentifier('Options'),
                            undefined,
                          ),
                          undefined,
                        ),
                      ],
                      factory.createTypeReferenceNode(
                        factory.createIdentifier('Client'),
                        undefined,
                      ),
                    ),
                    undefined,
                  ),
                ],
                ts.NodeFlags.Const |
                  ts.ModifierFlags.Ambient |
                  ts.NodeFlags.ContextFlags,
              ),
            ),
          ]),
          ts.NodeFlags.Namespace |
            ts.NodeFlags.ExportContext |
            ts.ModifierFlags.Ambient |
            ts.NodeFlags.ContextFlags,
        ),
        factory.createExportAssignment(
          undefined,
          undefined,
          true,
          factory.createIdentifier('thinly'),
        ),
      ]),
      ts.ModifierFlags.Ambient | ts.NodeFlags.ContextFlags,
    ),
  ])

  const result = printer.printList(ts.ListFormat.MultiLine, ast, resultFile)

  writeFileSync(join(config.client.output, 'index.d.ts'), result)
}

function getColorMethod(method: Method) {
  if (method === 'get') return chalk.green
  if (method === 'post') return chalk.blue
  if (method === 'put') return chalk.yellow
  if (method === 'patch') return chalk.cyan
  if (method === 'delete') return chalk.red

  throw new Error(`Method ${method} is not supported`)
}

export default async () => {
  spinner.start('Bundle routes')
  const [serverRoutes] = await bundleRoutes()

  spinner.start('Build API server')
  await buildServer(serverRoutes)

  spinner.start('Bundle routes')
  const [clientRoutes] = await bundleRoutes({ exclude: ['handler'] })

  spinner.start('Build client')
  await buildClient(clientRoutes)

  spinner.start('Generate client types')
  await buildClientTypes(await import(join(process.cwd(), '.thinly/routes')))

  spinner.stop()

  // import app
  const bundledOuput = process.cwd() + '/.thinly/index.js'

  delete require.cache[bundledOuput]

  const app: Application = require(bundledOuput)

  app._router.stack
    .map((layer) => layer.route)
    .filter((v) => v)
    .forEach((route) => {
      const methods = Object.keys(route.methods)
        .map((method: Method) => {
          const coloring = getColorMethod(method)

          return coloring(method.toUpperCase().padEnd(5))
        })
        .join(' | ')

      return console.log(`${methods} ${route.path}`)
    })

  return app
}
