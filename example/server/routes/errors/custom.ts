import { ThinlyError } from '@thinly/errors'

export default () => {
  throw new ThinlyError('Custom 401 Unauthorized', 401)
}
