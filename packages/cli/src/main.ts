#!/usr/bin/env node

import { program } from "commander";
import dev from "./dev";
import build from "./build";
import deploy from "./deploy";

program.command("dev").action(dev);

program.command("build").action(build);

program.command("deploy").action(deploy);

program.parse(process.argv);
