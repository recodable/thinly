import typescript from '@rollup/plugin-typescript'
import shebang from 'rollup-plugin-preserve-shebang'
import executable from 'rollup-plugin-executable-output'
import pkg from './package.json'
// import copy from 'rollup-plugin-copy'
import json from '@rollup/plugin-json'

export default [
  {
    input: 'cli/main.ts',

    output: {
      file: 'dist/cli/index.js',
      format: 'cjs',
    },

    plugins: [
      typescript(),
      shebang(),
      executable(),
      // copy({
      //   targets: [
      //     {
      //       src: 'client/package.example.json',
      //       dest: 'dist/client',
      //       rename: 'package.json',
      //     },
      //   ],
      // }),
      json(),
    ],

    external: [...Object.keys(pkg.dependencies), 'path', 'child_process', 'fs'],
  },

  {
    input: 'validation/index.ts',

    output: [
      {
        file: 'validation/dist/index.js',
        format: 'cjs',
      },
      {
        file: 'validation/dist/index.esm.js',
        format: 'es',
      },
    ],

    plugins: [typescript()],

    external: Object.keys(require('./validation/package.json').dependencies),
  },

  {
    input: 'server/app.ts',

    output: [
      {
        file: 'dist/server/app.js',
        format: 'cjs',
      },
      {
        file: 'dist/server/app.esm.js',
        format: 'es',
      },
    ],

    plugins: [typescript()],

    external: [...Object.keys(pkg.dependencies), 'path', 'child_process', 'fs'],
  },

  {
    input: 'routes/index.ts',

    output: [
      {
        file: 'routes/dist/index.js',
        format: 'cjs',
      },
      {
        file: 'routes/dist/index.esm.js',
        format: 'es',
      },
    ],

    plugins: [typescript()],

    external: [...Object.keys(pkg.dependencies), 'path', 'child_process', 'fs'],
  },

  // {
  //   input: 'db/index.ts',

  //   output: [
  //     {
  //       file: 'db/dist/index.js',
  //       format: 'cjs',
  //     },
  //     {
  //       file: 'db/dist/index.esm.js',
  //       format: 'es',
  //     },
  //   ],

  //   plugins: [typescript()],

  //   external: Object.keys(require('./db/package.json').dependencies),
  // },
]
