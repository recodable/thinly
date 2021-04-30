import pkg from './package.json'
import typescript from '@rollup/plugin-typescript'
import shebang from 'rollup-plugin-preserve-shebang'
import executable from 'rollup-plugin-executable-output'
import json from '@rollup/plugin-json'

export default {
  input: 'src/cli.ts',

  output: {
    file: 'dist/bin/thinly.js',
    format: 'cjs',
  },

  plugins: [typescript(), shebang(), executable(), json()],

  external: [...Object.keys(pkg.dependencies), 'path', 'fs'],
}
