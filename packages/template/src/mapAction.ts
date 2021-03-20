const Router = require('@koa/router')

const actionDirectory = 'actions'

export async function mapAction(path, prefix = '') {
  const actionModule = prefix
    ? require(`./${actionDirectory}/${path}.js`)
    : await import(`./${actionDirectory}/${path}.ts`)
  const router = new Router()

  if (actionModule.findMany) {
    router.get(`/${path}`, async function findMany(ctx) {
      ctx.body = await actionModule.findMany()
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

  return router
}
