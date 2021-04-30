export type Route = {
  path: string
  validate?: (body: any) => boolean
  handler: (req, res, next) => any
}
