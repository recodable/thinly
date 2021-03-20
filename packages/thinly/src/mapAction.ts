const path = require("path");
const Router = require("@koa/router");

export async function mapAction(filePath) {
  // const actionModule = prefix
  //   ? require(`${prefix}/${actionDirectory}/${path}.js`)
  //   : await import(`./${actionDirectory}/${path}.ts`);
  const actionModule = require(filePath);

  const fileName = path.basename(filePath, path.extname(filePath));

  const router = new Router();

  if (actionModule.findMany) {
    router.get(`/${fileName}`, async function findMany(ctx) {
      ctx.body = await actionModule.findMany();
    });
  }

  if (actionModule.find) {
    router.get(`/${fileName}/:id`, async function find(ctx) {
      ctx.body = await actionModule.find(ctx);
    });
  }

  if (actionModule.create) {
    router.post(`/${fileName}`, async function create(ctx) {
      ctx.body = await actionModule.create(ctx);
    });
  }

  if (actionModule.update) {
    router.patch(`/${fileName}/:id`, async function update(ctx) {
      ctx.body = await actionModule.update(ctx);
    });
  }

  if (actionModule.del) {
    router.del(`/${fileName}/:id`, async function del(ctx) {
      ctx.body = await actionModule.del(ctx);
    });
  }

  return router;
}
