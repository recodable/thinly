const Router = require("@koa/router");

export async function mapAction(resourceName, actionModule) {
  const router = new Router();

  if (actionModule.findMany) {
    router.get(`/${resourceName}`, async function findMany(ctx) {
      ctx.body = await actionModule.findMany();
    });
  }

  if (actionModule.find) {
    router.get(`/${resourceName}/:id`, async function find(ctx) {
      ctx.body = await actionModule.find(ctx);
    });
  }

  if (actionModule.create) {
    router.post(`/${resourceName}`, async function create(ctx) {
      ctx.body = await actionModule.create(ctx);
    });
  }

  if (actionModule.update) {
    router.patch(`/${resourceName}/:id`, async function update(ctx) {
      ctx.body = await actionModule.update(ctx);
    });
  }

  if (actionModule.del) {
    router.del(`/${resourceName}/:id`, async function del(ctx) {
      ctx.body = await actionModule.del(ctx);
    });
  }

  return router;
}
