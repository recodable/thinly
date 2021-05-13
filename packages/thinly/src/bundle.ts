import { rollup } from 'rollup'
import { join } from 'path'
import virtual from '@rollup/plugin-virtual'
import pkg from '../package.json'
import replace from '@rollup/plugin-replace'
import sucrase from '@rollup/plugin-sucrase'

export const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(require(join(process.cwd(), 'package.json')).dependencies),
  'path',
]

export async function createBundle(input: string, routes) {
  return rollup({
    input,

    plugins: [
      sucrase({
        exclude: ['node_modules/**'],
        transforms: ['typescript'],
      }),

      virtual({
        routes: `
          ${routes.code}
          export default { ${routes.exports} }
        `,
      }),

      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify('development'),
        },
      }),
    ],

    external,
  })
}
