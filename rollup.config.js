import pkg from './package.json'
import typescript from '@rollup/plugin-typescript'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import run from '@rollup/plugin-run'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'

const dev = process.env.ROLLUP_WATCH === 'true'

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: dev,
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(
        dev ? 'development' : 'production',
      ),
    }),
    nodeResolve(),
    typescript(),
    dynamicImportVars(),
    dev && run(),
  ],
  external: Object.keys(pkg.dependencies),
}
