import { rollup } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { join } from 'path'
import bundleRoutes from './bundleRoutes'
import virtual from '@rollup/plugin-virtual'
import pkg from '../package.json'

export default async () => {
  const [routes] = await bundleRoutes()

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
    ],

    external: [...Object.keys(pkg.dependencies), 'path'],
  })

  await bundle.write({
    file: '.thinly/index.js',
    format: 'cjs',
  })

  await bundle.close()

  const app = require(process.cwd() + '/.thinly/index.js')

  app.listen(3000, () => console.log('API running on http://localhost:3000'))
}
