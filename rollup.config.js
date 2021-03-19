import pkg from './package.json'
import typescript from '@rollup/plugin-typescript'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import run from '@rollup/plugin-run'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'

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
    input: 'src/mapAction.ts',
    output: {
      file: './node_modules/.thinly/mapAction.js',
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
    ],
    external: [...Object.keys(pkg.dependencies)],
  },
  {
    input: 'src/compiler.ts',
    output: {
      file: './node_modules/.thinly/compiler.js',
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
    ],
    external: [...Object.keys(pkg.dependencies)],
  },
  {
    input: 'src/actions/posts.ts',
    output: {
      file: './node_modules/.thinly/actions/posts.js',
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
    ],
    external: [...Object.keys(pkg.dependencies)],
  },
  {
    input: 'src/client.js',
    output: {
      file: './node_modules/.thinly/client.js',
      format: 'es',
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
      // nodeResolve(),
      // typescript(),
      // dynamicImportVars(),
      {
        name: 'thinly',
        async transform() {
          const { mapAction } = require('./node_modules/.thinly/mapAction')
          const { compile } = require('./node_modules/.thinly/compiler')
          // const { mapAction } = require('./node_modules/.thinly/mapAction')
          // const { compile } = await import('./node_modules/.thinly/compiler')

          const routers = {
            posts: await mapAction('posts', 'node_modules/.thinly'),
          }

          const actions = Object.entries(routers).reduce(
            (acc, [key, router]) => {
              return { ...acc, [key]: router.stack }
            },
            {},
          )

          return {
            code: compile(actions),
            map: { mappings: '' },
          }
        },
      },
    ],
    external: [...Object.keys(pkg.dependencies)],
  },
]
