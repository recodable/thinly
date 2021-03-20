import pkg from './package.json'
import typescript from '@rollup/plugin-typescript'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import run from '@rollup/plugin-run'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import thinly from 'rollup-plugin-thinly'
import multi from '@rollup/plugin-multi-entry'

// const walkSync = function (dir, filelist) {
//   var fs = fs || require('fs'),
//     files = fs.readdirSync(dir)
//   filelist = filelist || []
//   files.forEach(function (file) {
//     if (fs.statSync(dir + file).isDirectory()) {
//       filelist = walkSync(dir + file + '/', filelist)
//     } else {
//       filelist.push(file)
//     }
//   })
//   return filelist
// }

const dev = process.env.ROLLUP_WATCH === 'true'

export default [
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/main.js',
      format: 'cjs',
      sourcemap: dev,
      inlineDynamicImports: true,
    },
    plugins: [
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(
          dev ? 'development' : 'production',
        ),
      }),
      nodeResolve(),
      typescript(),
      dynamicImportVars(),
      dev && run(),
    ],
    external: [...Object.keys(pkg.dependencies)],
  },
  {
    input: 'src/actions/**/*.ts',
    output: {
      dir: `./node_modules/.thinly/`,
      format: 'cjs',
      sourcemap: dev,
    },
    plugins: [
      multi({
        entryFileName: 'actions.js',
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(
          dev ? 'development' : 'production',
        ),
      }),
      nodeResolve(),
      typescript(),
      dynamicImportVars(),
    ],
    external: [...Object.keys(pkg.dependencies)],
  },
  {
    input: 'src/client.ts',
    output: {
      file: './node_modules/.thinly/client.js',
      format: 'es',
      sourcemap: dev,
      inlineDynamicImports: true,
    },
    plugins: [thinly()],
    external: [...Object.keys(pkg.dependencies)],
  },
]
