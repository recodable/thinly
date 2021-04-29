#!/usr/bin/env node

import { program } from 'commander'
import dev from './dev'
// import build from './build'

program.command('dev').action(dev)

program.parse(process.argv)
