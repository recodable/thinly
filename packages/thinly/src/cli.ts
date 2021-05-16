#!/usr/bin/env node
import { program } from 'commander'
import dev from './dev'
import build from './build'
import vercel from './vercel'

program
  .command('dev')
  .option('--port <port>', 'Port on which Thinly server will run on', '4000')
  .action(dev)
program.command('build').action(() => {
  build()
})
program.command('vercel').action(vercel)

program.parse(process.argv)
