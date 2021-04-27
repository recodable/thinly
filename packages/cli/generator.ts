import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'

export type CompilerOptions = {
  isEntryFile: boolean
  parse: (string) => any
  production: boolean
  routeDir: string
}

export function generate(code: string, id: string, options: CompilerOptions) {
  const names = options
    .parse(code)
    .body.filter((node) => node.type === 'ImportDeclaration')
    .map((node) => node.specifiers[0].local.name)
    .filter((v) => v)

  if (options.isEntryFile) {
    return [
      "require('dotenv').config()",

      code,

      'export class ThinlyClient {',

      ...names.reduce((acc, name) => {
        return [...acc, `get ${name}() {`, `return ${name}`, '}']
      }, []),

      '}',
    ].join('\n')
  }

  const ast = parse([code, 'export default {', '', '}'].join('\n'), {
    sourceType: 'module',
  })

  let methods = []

  traverse(ast, {
    ExportNamedDeclaration: (path) => {
      const name = path?.node?.declaration?.id?.name

      if (!name || !['get', 'put', 'post', 'delete', 'patch'].includes(name)) {
        return
      }

      methods = [...methods, name]

      // const { program } = parse(`router.${name}("/", ${name})`);

      //   path.parentPath.node.body = [
      //     ...path.parentPath.node.body,
      //     ...program.body,
      //   ];
    },
  })

  // return generate(ast, {}, code);

  const [route] = id.replace(options.routeDir, '').split('.')

  return [
    "import axios from 'axios'",
    'export default {',
    ...methods.reduce((acc, method) => {
      return [
        ...acc,
        `${method}(data) {`,
        `return axios.${method}(process.env.API_URL + '${route}', data)`,
        '}',
      ]
    }, []),
    '}',
  ].join('\n')
}
