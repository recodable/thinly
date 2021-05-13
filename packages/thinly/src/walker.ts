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

export function walk(map, modifiers, depth = 0) {
  return Object.keys(map).reduce((acc, key) => {
    const modifier = modifiers.find((modifier) => modifier.match(key))

    if (modifier) {
      return modifier.handler({ routes: acc, key, modifiers, depth })
    }

    return { ...acc, [key]: walk(acc[key], modifiers, depth + 1) }
  }, map)
}
