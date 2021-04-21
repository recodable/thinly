import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";

export type CompilerOptions = {
  isEntryFile: boolean;
  parse: (string) => any;
};

export function compile(code: string, id: string, options: CompilerOptions) {
  if (options.isEntryFile) {
    const ast = options.parse(code);

    const names = ast.body
      .filter((node) => node.type === "ImportDeclaration")
      .map((node) => node.specifiers[0].local.name)
      .filter((v) => v);

    return [
      'import express from "express"',
      'import bodyParser from "body-parser"',
      "const app = express()",
      "app.use(bodyParser.json())",
      code,
      ...names.map((name) => {
        return `app.use('/api/${name}', ${name})`;
      }),
      "app.listen(3000, () => console.log('API running on http://localhost:3000'))",
    ].join("\n");
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
      const { name } = path.node.declaration.id;

      console.log(`Mapping ${name.toUpperCase()} ${id}...`);

      const { program } = parse(`router.${name}("/", ${name})`);

      path.parentPath.node.body = [
        ...path.parentPath.node.body,
        ...program.body,
      ];
    },
  });

  return generate(ast, {}, code);
}
