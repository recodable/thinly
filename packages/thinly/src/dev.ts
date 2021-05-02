import { rollup } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { join } from 'path'
import bundleRoutes from './bundleRoutes'
import virtual from '@rollup/plugin-virtual'
import pkg from '../package.json'
import replace from '@rollup/plugin-replace'

export type ClientOptions = {
  output: string
}

export type Options = {
  client: ClientOptions
}

const defaultConfig: Options = {
  client: {
    output: '.thinly/client.js',
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
    file: config.client.output,
    format: 'es',
  })

  await bundle.close()
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

        await buildClient(routes)
      },
    },
  })
}
