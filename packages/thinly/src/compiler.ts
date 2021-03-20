import {
  factory,
  createSourceFile,
  ScriptTarget,
  ScriptKind,
  createPrinter,
  NewLineKind,
  MethodDeclaration,
  ListFormat,
  TemplateExpression,
  StringLiteral,
  NodeFlags,
} from "typescript";
import { generateClient } from "./generateClient";
const startCase = require("lodash.startcase");

function getDelegateName(resourceName) {
  return [...startCase(resourceName).split(" "), "Delegate"].join("");
}

export function compile(actions) {
  let ast = generateClient(
    [
      ...Object.keys(actions).map((resourceName) => {
        return factory.createGetAccessorDeclaration(
          undefined,
          undefined,
          factory.createIdentifier(resourceName),
          [],
          undefined,
          factory.createBlock(
            [
              factory.createReturnStatement(
                factory.createIdentifier(getDelegateName(resourceName))
              ),
            ],
            true
          )
        );
      }),
    ],
    [
      ...Object.entries(actions).map(
        ([resourceName, routes]: [string, any]) => {
          return factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier(getDelegateName(resourceName)),
                  undefined,
                  undefined,
                  factory.createObjectLiteralExpression(
                    routes.map(compileEndpoint),
                    true
                  )
                ),
              ],
              NodeFlags.Const
            )
          );
        }
      ),
    ]
  );

  const resultFile = createSourceFile(
    "client.ts",
    "",
    ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ScriptKind.TS
  );

  const printer = createPrinter({ newLine: NewLineKind.LineFeed });

  const result = printer.printList(ListFormat.MultiLine, ast, resultFile);

  // writeFile('./dist/client.ts', result, (error) => {
  //   if (error) return console.log(error)
  //   console.log('Done!')
  // })

  return result;
}

function compileEndpoint(endpoint): MethodDeclaration {
  const axiosMethod = findAxiosMethod(endpoint.methods);

  return factory.createMethodDeclaration(
    undefined,
    undefined,
    undefined,
    factory.createIdentifier(endpoint.stack[0].name),
    undefined,
    undefined,
    [
      ...endpoint.paramNames.map(({ name }) => {
        return factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier(name)
        );
      }),
      ...(["post", "patch"].includes(axiosMethod)
        ? [
            factory.createParameterDeclaration(
              undefined,
              undefined,
              undefined,
              factory.createIdentifier("data"),
              undefined,
              undefined,
              undefined
            ),
          ]
        : []),
    ],
    undefined,
    factory.createBlock(
      [
        factory.createReturnStatement(
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier("axios"),
              factory.createIdentifier(axiosMethod)
            ),
            undefined,
            [
              createTemplateExpressionFromURL(endpoint.path),

              ...(["post", "patch"].includes(axiosMethod)
                ? [factory.createIdentifier("data")]
                : []),
            ]
          )
        ),
      ],
      true
    )
  );
}

function findAxiosMethod(methods) {
  if (methods.includes("GET")) {
    return "get";
  }

  if (methods.includes("POST")) {
    return "post";
  }

  if (methods.includes("PUT")) {
    return "put";
  }

  if (methods.includes("PATCH")) {
    return "patch";
  }

  if (methods.includes("DELETE")) {
    return "delete";
  }

  throw new Error("method not supported");
}

function createTemplateExpressionFromURL(
  path: string
): TemplateExpression | StringLiteral {
  let isDynamic = false;
  const headStaticPath = path
    .split("/")
    .filter((v) => v)
    .reduce((acc, part) => {
      if (part.charAt(0) === ":") isDynamic = true;
      if (isDynamic) return acc;
      return `${acc}/${part}`;
    }, process.env.API_URL);

  const dynamicParts = path
    .split("/")
    .filter((v) => v)
    .filter((part) => part.charAt(0) === ":");

  if (!isDynamic) {
    return factory.createStringLiteral([process.env.API_URL, path].join(""));
  }

  return factory.createTemplateExpression(
    factory.createTemplateHead(`${headStaticPath}/`),
    dynamicParts.reduce((acc, part) => {
      return [
        ...acc,
        factory.createTemplateSpan(
          factory.createIdentifier(part.slice(1)),
          factory.createTemplateTail("")
        ),
      ];
    }, [])
  );
}
