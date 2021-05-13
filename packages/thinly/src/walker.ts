// export type Modifier = {
//   match: (string) => boolean
//   handler: (Context) => any
// }

// export type Context = {
//   key: string
//   routes: any
//   modifiers: Modifier[]
//   depth: number
// }

export function walk(
  map,
  modifiers,
  depth = 0,
  context = {},
  initialValue = null,
) {
  initialValue = initialValue || map

  return Object.keys(map).reduce((acc, key, index) => {
    const modifier = modifiers.find((modifier) => modifier.match(key))

    if (modifier) {
      return modifier.handler({
        routes: acc,
        key,
        modifiers,
        depth,
        context,
        initialValue,
        index,
      })
    }

    throw new Error('Unhandled modifier')
    // console.log({ acc, key, where: 'default' })
    // return {
    //   ...acc,
    //   [key]: walk(acc[key], modifiers, depth + 1, context, initialValue),
    // }
  }, initialValue)
}
