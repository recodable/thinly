import { mapAction, compile } from "thinly";

export default function thinly({
  actionFile,
  thinlyDir = "node_modules/.thinly",
}) {
  return {
    name: "thinly",

    async transform() {
      const routers = {
        posts: await mapAction(actionFile, thinlyDir),
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
