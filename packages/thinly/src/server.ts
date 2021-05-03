import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
// import type { Route } from './types'
import validation from '@thinly/validation'

// @ts-ignore
import routes from 'routes'

const app = express()

app.use(bodyParser.json())

app.use(cors())

Object.values(routes).map((route) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${route.method.toUpperCase()} ${route.path}`)
  }

  app[route.method]('/api' + route.path, async (req, res, next) => {
    // let valid = true

    // if (route.validate) {
    //   valid = route.validate(req.body)
    // }

    // if (!valid) {
    //   return res.status(422).send({ errors: ['invalid data'] })
    // }

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
