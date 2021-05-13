import build from './build'
import { watch } from 'chokidar'
import { input } from './bundleRoutes'
import type { Application } from 'express'
import type { Server } from 'http'

export let server: Server = null

export async function start(): Promise<Server> {
  await build()

  const bundledOuput = process.cwd() + '/.thinly/index.js'

  delete require.cache[bundledOuput]

  const app: Application = require(bundledOuput)

  server = app.listen(3000, () =>
    console.log('API running on http://localhost:3000'),
  )

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
