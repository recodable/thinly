import { build } from './build'
import { join } from 'path'
import { fork } from 'child_process'
import { DEFAULT_API_OUTPUT } from './constants'

export default function run() {
  build({ production: false }).then(() => {
    fork(join(process.cwd(), DEFAULT_API_OUTPUT))
  })
}
