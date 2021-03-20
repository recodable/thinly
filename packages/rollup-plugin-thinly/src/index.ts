import { mapAction, compile } from "thinly";
import { join, basename, extname } from "path";

export default function thinly() {
  return {
    name: "thinly",

    async transform() {
      const actionPath = join(
        process.cwd(),
        "node_modules",
        ".thinly",
        "actions",
        "posts.js"
      );
      const actionModule = require(actionPath);
      const resourceName = basename(actionPath, extname(actionPath));
      const routers = {
        posts: await mapAction(resourceName, actionModule),
      };

      const actions = Object.entries(routers).reduce((acc, [key, router]) => {
        return { ...acc, [key]: router.stack };
      }, {});

      return {
        code: compile(actions),
        map: { mappings: "" },
      };
    },
  };
}
