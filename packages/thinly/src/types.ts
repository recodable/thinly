export type BaseRoute = {
  path: string
  method: 'get' | 'post' | 'put' | 'patch' | 'delete'
  validationSchema?: any
}

export interface ServerRoute extends BaseRoute {
  handler: (req) => any | Promise<any>
}

export interface ClientRoute extends BaseRoute {}
