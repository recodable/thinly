import { factory, ClassElement, NodeArray } from 'typescript'

export function generateClient(
  members: readonly ClassElement[] = [],
  delegators = [],
): NodeArray<any> {
  return factory.createNodeArray([
    factory.createImportDeclaration(
      undefined,
      undefined,
      factory.createImportClause(
        false,
        factory.createIdentifier('axios'),
        undefined,
      ),
      factory.createStringLiteral('axios'),
    ),
    // factory.createImportDeclaration(
    //   undefined,
    //   undefined,
    //   factory.createImportClause(
    //     false,
    //     undefined,
    //     factory.createNamespaceImport(factory.createIdentifier('yup')),
    //   ),
    //   factory.createStringLiteral('yup'),
    // ),

    factory.createClassDeclaration(
      undefined,
      [],
      factory.createIdentifier('Client'),
      undefined,
      undefined,
      members,
    ),

    ...delegators,

    factory.createExportDeclaration(
      undefined,
      undefined,
      false,
      factory.createNamedExports([
        factory.createExportSpecifier(
          undefined,
          factory.createIdentifier('Client'),
        ),
      ]),
      undefined,
    ),
  ])
}
