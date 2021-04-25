import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";

export type CompilerOptions = {
  isEntryFile: boolean;
  parse: (string) => any;
  production: boolean;
  routeDir: string;
};

export function compile(code: string, id: string, options: CompilerOptions) {
  const names = options
    .parse(code)
    .body.filter((node) => node.type === "ImportDeclaration")
    .map((node) => node.specifiers[0].local.name)
    .filter((v) => v);

  if (options.isEntryFile) {
    return [
      !options.production && "require('dotenv').config()",

      'import express from "express"',
      'import bodyParser from "body-parser"',

      "const app = express()",

      "app.use(bodyParser.json())",

      code,

      ...names.map((name) => {
        return `app.use('/api/${name}', ${name})`;
      }),

      !options.production &&
        "app.listen(3000, () => console.log('API running on http://localhost:3000'))",

      options.production && "module.exports = app",
    ]
      .filter((v) => v)
      .join("\n");
  }

  const ast = parse(
    [
      'import { Router } from "express"',
      "const router = Router()",
      code,
      "export default router",
    ].join("\n"),
    { sourceType: "module" }
  );

  traverse(ast, {
    ExportNamedDeclaration: (path) => {
      const [route] = id.replace(options.routeDir, "").split(".");

      const name = path?.node?.declaration?.id?.name;

      if (!name || !["get", "put", "post", "delete", "patch"].includes(name)) {
        return;
      }

      console.log(`Mapping ${name.toUpperCase()} ${route}...`);

      const { program } = parse(`router.${name}("/", ${name})`);

      path.parentPath.node.body = [
        ...path.parentPath.node.body,
        ...program.body,
      ];
    },
  });

  return generate(ast, {}, code);
}
