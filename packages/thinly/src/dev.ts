import build from './build'
import { watch } from 'chokidar'
import { input } from './bundleRoutes'
import type { Application } from 'express'
import type { Server } from 'http'
import chalk from 'chalk'

export type Options = {
  port: number
}

export let server: Server = null

export async function start({ port }: Options): Promise<Server> {
  const app: Application = await build()

  server = app.listen(port, () => {
    console.log('\n')
    console.log(
      chalk.bgGreen(
        `  > API running on ${chalk.underline(`http://localhost:${port}`)}  `,
      ),
    )
  })

  return server
}

export async function restart({ port }: Options) {
  if (!server) return

  server.close((error) => {
    if (error) throw error
    start({ port })
  })
}

const defaultOptions: Options = {
  port: 3000,
}

export default async (overrideOptions: Partial<Options>) => {
  const options: Options = {
    ...defaultOptions,
    ...overrideOptions,
  }

  watch(input, { awaitWriteFinish: true })
    .on('ready', () => start(options))
    .on('add', () => restart(options))
    .on('change', () => restart(options))
    .on('unlink', () => restart(options))
}
