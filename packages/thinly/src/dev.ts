import build from './build'

export default async () => {
  await build()

  const bundledOuput = process.cwd() + '/.thinly/index.js'

  delete require.cache[bundledOuput]

  const app = require(bundledOuput)

  app.listen(3000, () => console.log('API running on http://localhost:3000'))
}
