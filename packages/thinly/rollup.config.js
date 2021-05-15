import pkg from './package.json'
import typescript from '@rollup/plugin-typescript'
import shebang from 'rollup-plugin-preserve-shebang'
import executable from 'rollup-plugin-executable-output'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import { join } from 'path'

export default [
  {
    input: 'src/cli.ts',

    output: {
      file: 'dist/bin/thinly.js',
      format: 'cjs',
    },

    plugins: [
      typescript(),
      shebang(),
      executable(),
      json(),
      replace({
        preventAssignment: true,
        values: {
          __dirname: JSON.stringify(join(__dirname, 'src')),
        },
      }),
    ],

    external: [
      ...Object.keys(pkg.dependencies),
      'path',
      'fs',
      'util',
      'fs/promises',
    ],
  },
]
