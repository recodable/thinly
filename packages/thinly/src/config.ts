import { join } from 'path'

export type ClientOptions = {
  output: string
}

export type ServerOptions = {
  output: string
}

export type Options = {
  client: ClientOptions
  server: ServerOptions
}

export const defaultConfig: Options = {
  client: {
    output: '.thinly/client',
  },
  server: {
    output: '.thinly',
  },
}

const config: Options = {
  ...defaultConfig,
  ...require(join(process.cwd(), 'thinly.config.js')),
}

export default config
