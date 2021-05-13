export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete'

export type BaseRoute = {
  path: string
  method: Method
  validationSchema?: any
}

export interface ServerRoute extends BaseRoute {
  handler: (req) => any | Promise<any>
}

export interface ClientRoute extends BaseRoute {}
