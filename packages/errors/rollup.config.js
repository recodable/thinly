import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'

export default {
  input: './index.ts',

  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
    },
  ],

  plugins: [typescript()],

  external: [...Object.keys(pkg.dependencies)],
}
