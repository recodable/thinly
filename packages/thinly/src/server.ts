// @ts-ignore
import routes from 'routes'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import * as validation from '@thinly/validation'
import { ServerRoute } from './types'
import chalk from 'chalk'
import { ThinlyError } from '@thinly/errors'

const app = express()

app.use(bodyParser.json())

app.use(cors())

Object.values(routes).map((route: ServerRoute) => {
  app[route.method]('/api' + route.path, async (req, res, next) => {
    if (route.validationSchema) {
      const schema = validation.object().shape(route.validationSchema)

      try {
        await schema.validate(req.body)
      } catch ({ errors, type, path }) {
        return res.status(422).send({ path, type, errors })
      }
    }
    return new Promise((resolve) => resolve(route.handler(req)))
      .then((result) => {
        return res.send(result)
      })
      .catch((error: ThinlyError) => {
        if (error instanceof ThinlyError) {
          return res.status(error.status).send(error.message)
        }

        throw error
      })
      .catch(({ name, message, stack }: Error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('\n')

          console.error(`${chalk.bgRed(name)} ${chalk.red(message)}`)

          const [_, ...stackTrace] = stack.split('\n')
          console.error(chalk.gray(stackTrace.join('\n')))

          console.error('\n')
        }

        return res.status(500).send('Internal Server Error')
      })
  })
})

export default app
