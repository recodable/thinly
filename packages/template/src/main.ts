require('dotenv').config()

const Koa = require('koa')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser')
const serverless = require('serverless-http')
import { mapAction } from 'thinly'

async function main() {
  const app = new Koa()

  app.use(cors())
  app.use(bodyParser())

  const actionModule = await import('./actions/posts')
  const router = await mapAction('posts', actionModule)

  app.use(router.routes()).use(router.allowedMethods())

  app.listen(process.env.API_PORT, () => {
    console.log(`Listening to port: ${process.env.API_PORT}`)
  })
}

if (process.env.NODE_ENV === 'development') {
  main()
}

export const handler = serverless(main)