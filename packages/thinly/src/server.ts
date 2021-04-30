import express from 'express'
import bodyParser from 'body-parser'
import { basename } from 'path'

// @ts-ignore
import routes from 'routes'

const app = express()

app.use(bodyParser.json())

// type Route = {
//   path: string
//   handler: (req, res, next) => any
// }

Object.values(routes).map((route) => {
  let method = 'get'

  if (
    ['get', 'post', 'put', 'patch', 'delete'].includes(basename(route.path))
  ) {
    const parts = route.path.split('/')

    method = parts.pop().toLowerCase()

    route.path = parts.join('/')
  }

  console.log(`${method.toUpperCase()} ${route.path}`)
  app[method]('/api' + route.path, (req, res, next) => {
    let valid = true

    if (route.validate) {
      valid = route.validate(req.body)
    }

    if (!valid) {
      return res.status(422).send({ errors: ['invalid data'] })
    }

    return route.handler(req, res, next)
  })
})

export default app
