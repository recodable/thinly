import { mapAction, compile } from "thinly";
import { join } from "path";
import { createFilter } from "@rollup/pluginutils";
import type { FilterPattern } from "@rollup/pluginutils";

export type ThinlyOptions = {
  include?: FilterPattern;
  exclude?: FilterPattern;
};

export default function thinly(options: ThinlyOptions = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: "thinly",

    async transform(code, id) {
      if (!filter(id)) return;

      const actionPath = join(
        process.cwd(),
        "node_modules",
        ".thinly",
        "actions"
      );

      const actionModule = await import(actionPath);

      const routers = await Object.entries(actionModule).reduce(
        async (prevPromise, [resourceName, actions]: [string, any]) => {
          const acc = await prevPromise;
          return {
            ...acc,
            [resourceName.toLowerCase()]: await mapAction(
              resourceName.toLowerCase(),
              actions.prototype
            ),
          };
        },
        {}
      );

      const actions = Object.entries(routers).reduce(
        (acc, [key, router]: [string, any]) => {
          return { ...acc, [key]: router.stack };
        },
        {}
      );

      return {
        code: compile(actions),
        map: { mappings: "" },
      };
    },
  };
}
