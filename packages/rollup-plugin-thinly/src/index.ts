import { mapAction, compile } from "thinly";
import { join } from "path";

export default function thinly() {
  return {
    name: "thinly",

    async transform() {
      const routers = {
        posts: await mapAction(
          join(process.cwd(), "node_modules", ".thinly", "actions", "posts.js")
        ),
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
