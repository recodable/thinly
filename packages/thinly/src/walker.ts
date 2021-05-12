// export type Modifier = {
//   match: (string) => boolean
//   handler: (Context) => any
// }

// export type Context = {
//   key: string
//   routes: any
//   modifiers: Modifier[]
// }

export function walk(map, modifiers) {
  return Object.keys(map).reduce((acc, key) => {
    const modifier = modifiers.find((modifier) => modifier.match(key))

    if (modifier) {
      return modifier.handler({ routes: acc, key, modifiers })
    }

    return { ...acc, [key]: walk(acc[key], modifiers) }
  }, map)
}
