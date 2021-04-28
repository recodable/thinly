import { existsSync } from 'fs'
import { DEFAULT_CLIENT_OUTPUT, CFG_FILENAME } from '../constants'
import { join } from 'path'

const defaultCfg = {
  output: DEFAULT_CLIENT_OUTPUT,
  routeDir: join(process.cwd(), 'src', 'routes'),
}

export function config() {
  return existsSync(CFG_FILENAME)
    ? { ...defaultCfg, ...require(join(process.cwd(), CFG_FILENAME)) }
    : defaultCfg
}
