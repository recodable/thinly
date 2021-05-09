export type Route = {
  path: string
  method: 'get' | 'post' | 'put' | 'patch' | 'delete'
  // validate?: (body: any) => boolean
  validationSchema?: any
  handler: (req) => any | Promise<any>
}
