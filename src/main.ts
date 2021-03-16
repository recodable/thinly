require('dotenv').config()

const Koa = require('koa')
const Router = require('@koa/router')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser')
import { compile } from './compiler'

async function main() {
  const app = new Koa()

  app.use(cors())
  app.use(bodyParser())

  const actionDirectory = 'actions'

  async function mapAction(path) {
    const actionModule = await import(`./${actionDirectory}/${path}.ts`)
    const router = new Router()

    if (actionModule.findMany) {
      router.get(`/${path}`, async function findMany(ctx) {
        ctx.body = await actionModule.findMany(ctx)
      })
    }

    if (actionModule.find) {
      router.get(`/${path}/:id`, async function find(ctx) {
        ctx.body = await actionModule.find(ctx)
      })
    }

    if (actionModule.create) {
      router.post(`/${path}`, async function create(ctx) {
        ctx.body = await actionModule.create(ctx)
      })
    }

    if (actionModule.update) {
      router.patch(`/${path}/:id`, async function update(ctx) {
        ctx.body = await actionModule.update(ctx)
      })
    }

    if (actionModule.del) {
      router.del(`/${path}/:id`, async function del(ctx) {
        ctx.body = await actionModule.del(ctx)
      })
    }

    app.use(router.routes()).use(router.allowedMethods())

    return router.stack
  }

  const actions = {
    posts: await mapAction('posts'),
  }

  compile(actions)

  app.listen(process.env.API_PORT, () => {
    console.log(`Listening to port: ${process.env.API_PORT}`)
  })
}

if (process.env.NODE_ENV === 'development') {
  main()
}

export { main }