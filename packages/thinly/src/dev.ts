import { rollup } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { join } from 'path'
import bundleRoutes from './bundleRoutes'
import virtual from '@rollup/plugin-virtual'
import pkg from '../package.json'
import replace from '@rollup/plugin-replace'
import ts, { createSourceFile, factory, createPrinter } from 'typescript'
import { writeFileSync } from 'fs'

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

async function buildServer(routes) {
  const bundle = await rollup({
    input: join(__dirname, '..', '..', 'src/server.ts'),

    plugins: [
      typescript(),

      virtual({
        routes: `
          ${routes.code}
          export default { ${routes.exports} }
        `,
      }),

      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
    ],

    external: [...Object.keys(pkg.dependencies), 'path'],
  })

  await bundle.write({
    file: '.thinly/index.js',
    format: 'cjs',
    exports: 'auto',
  })

  await bundle.close()
}

async function buildClient(routes) {
  const bundle = await rollup({
    input: join(__dirname, '..', '..', 'src/client.ts'),

    plugins: [
      typescript(),

      virtual({
        routes: `
          ${routes.code}
          export default { ${routes.exports} }
        `,
      }),

      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
    ],

    external: [...Object.keys(pkg.dependencies), 'path'],
  })

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

async function buildClientTypes(routes) {
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
      factory.createIdentifier('thinly'),
      factory.createModuleBlock([
        factory.createInterfaceDeclaration(
          undefined,
          undefined,
          factory.createIdentifier('Client'),
          undefined,
          undefined,
          routes.exports.map((name) => {
            return factory.createMethodSignature(
              undefined,
              factory.createIdentifier(name),
              undefined,
              undefined,
              [],
              factory.createTypeReferenceNode(
                factory.createIdentifier('Promise'),
                [factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)],
              ),
            )
          }),
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
                  factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
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
                      factory.createIdentifier('Options'),
                      undefined,
                      undefined,
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
              ts.NodeFlags.Ambient |
              ts.NodeFlags.ContextFlags,
          ),
        ),
      ]),
      ts.NodeFlags.Namespace | ts.NodeFlags.Ambient | ts.NodeFlags.ContextFlags,
    ),
    factory.createExportAssignment(
      undefined,
      undefined,
      true,
      factory.createIdentifier('thinly'),
    ),
  ])

  // const ast = factory.createNodeArray([
  //   factory.createModuleDeclaration(
  //     undefined,
  //     [factory.createModifier(ts.SyntaxKind.DeclareKeyword)],
  //     factory.createStringLiteral('@thinly/client'),
  //     factory.createModuleBlock([
  //       factory.createInterfaceDeclaration(
  //         undefined,
  //         undefined,
  //         factory.createIdentifier('Client'),
  //         undefined,
  //         undefined,
  //         routes.exports.map((name) => {
  //           return factory.createMethodSignature(
  //             undefined,
  //             factory.createIdentifier(name),
  //             undefined,
  //             undefined,
  //             [],
  //             factory.createTypeReferenceNode(
  //               factory.createIdentifier('Promise'),
  //               [factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)],
  //             ),
  //           )
  //         }),
  //       ),
  //       factory.createVariableStatement(
  //         undefined,
  //         factory.createVariableDeclarationList(
  //           [
  //             factory.createVariableDeclaration(
  //               factory.createIdentifier('client'),
  //               undefined,
  //               factory.createTypeReferenceNode(
  //                 factory.createIdentifier('Client'),
  //                 undefined,
  //               ),
  //               undefined,
  //             ),
  //           ],
  //           ts.NodeFlags.Const |
  //             ts.ModifierFlags.Ambient |
  //             ts.NodeFlags.ContextFlags,
  //         ),
  //       ),
  //       factory.createExportAssignment(
  //         undefined,
  //         undefined,
  //         true,
  //         factory.createIdentifier('client'),
  //       ),
  //     ]),
  //     ts.ModifierFlags.Ambient | ts.NodeFlags.ContextFlags,
  //   ),
  // ])

  const result = printer.printList(ts.ListFormat.MultiLine, ast, resultFile)

  writeFileSync(join(config.client.output, 'index.d.ts'), result)
}

export default async () => {
  let server

  await bundleRoutes({
    watch: true,

    hooks: {
      started: () => {
        if (server) {
          server.close()
        }
      },

      bundled: async (output) => {
        const [routes] = output

        await buildServer(routes)

        const bundledOuput = process.cwd() + '/.thinly/index.js'

        delete require.cache[bundledOuput]

        const app = require(bundledOuput)

        server = app.listen(3000, () =>
          console.log('API running on http://localhost:3000'),
        )

        await bundleRoutes({
          watch: true,

          exclude: ['handler'],

          hooks: {
            bundled: async (output) => {
              const [routes] = output

              await buildClient(routes)

              await buildClientTypes(routes)
            },
          },
        })
      },
    },
  })
}
