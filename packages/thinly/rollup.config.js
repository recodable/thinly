import pkg from './package.json'
import typescript from '@rollup/plugin-typescript'
import shebang from 'rollup-plugin-preserve-shebang'
import executable from 'rollup-plugin-executable-output'

export default {
  input: 'src/cli.ts',

  output: {
    file: 'dist/bin/thinly.js',
    format: 'cjs',
  },

  plugins: [typescript(), shebang(), executable()],

  external: [...Object.keys(pkg.dependencies), 'path', 'fs'],
}
