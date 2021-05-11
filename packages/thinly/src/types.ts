export type BaseRoute = {
  path: string
  method: 'get' | 'post' | 'put' | 'patch' | 'delete'
}

export interface Route extends BaseRoute {
  validationSchema?: any
  handler: (req) => any | Promise<any>
}
