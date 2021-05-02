import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
// import type { Route } from './types'

// @ts-ignore
import routes from 'routes'

const app = express()

app.use(bodyParser.json())

app.use(cors())

  if (process.env.NODE_ENV === 'development') {
    console.log(`${route.method.toUpperCase()} ${route.path}`)
  }

  app[route.method]('/api' + route.path, (req, res, next) => {
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
