#!/usr/bin/env node
import { program } from 'commander'
import dev from './dev'
import build from './build'

program.command('dev').action(dev)
program.command('build').action(() => {
  build()
})

program.parse(process.argv)
