import build from './build'
import { watch } from 'chokidar'
import { input } from './bundleRoutes'
import type { Application } from 'express'
import type { Server } from 'http'
import chalk from 'chalk'

export let server: Server = null

export async function start(): Promise<Server> {
  const app: Application = await build()

  server = app.listen(3000, () => {
    console.log('\n')
    console.log(
      chalk.bgGreen(
        `  > API running on ${chalk.underline('http://localhost:3000')}  `,
      ),
    )
  })

  return server
}

export async function restart() {
  if (!server) return

  server.close((error) => {
    if (error) throw error
    start()
  })
}

export default async () => {
  watch(input)
    .on('ready', start)
    .on('add', restart)
    .on('change', restart)
    .on('unlink', restart)
}
