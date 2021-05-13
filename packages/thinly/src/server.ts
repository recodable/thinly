// @ts-ignore
import routes from 'routes'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import * as validation from '@thinly/validation'
import { ServerRoute } from './types'

const app = express()

app.use(bodyParser.json())

app.use(cors())

Object.values(routes).map((route: ServerRoute) => {
  app[route.method]('/api' + route.path, async (req, res, next) => {
    if (route.validationSchema) {
      const schema = validation.object().shape(route.validationSchema)

      const valid = await schema.isValid(req.body)

      if (!valid) {
        return res.status(422).send({ errors: ['invalid data'] })
      }
    }

    const result = await route.handler(req)

    return res.send(result)
  })
})

export default app
