import typescript from '@rollup/plugin-typescript'
import shebang from 'rollup-plugin-preserve-shebang'
import executable from 'rollup-plugin-executable-output'
import pkg from './package.json'
import copy from 'rollup-plugin-copy'

export default {
  input: 'cli/main.ts',

  output: {
    file: 'dist/cli/index.js',
    format: 'cjs',
  },

  plugins: [
    typescript(),
    shebang(),
    executable(),
    copy({
      targets: [
        {
          src: 'client/package.example.json',
          dest: 'dist/client',
          rename: 'package.json',
        },
      ],
    }),
  ],

  external: [...Object.keys(pkg.dependencies), 'path', 'child_process', 'fs'],
}
