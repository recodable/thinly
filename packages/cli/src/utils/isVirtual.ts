export function isVirtual(id): boolean {
  return /\x00virtual:.*/.test(id)
}
