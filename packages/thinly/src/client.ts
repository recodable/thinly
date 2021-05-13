// @ts-ignore
import routes from 'routes'
import { createMap } from './mapper'
import axios from 'axios'
import * as validation from '@thinly/validation'
import { walk } from './walker'

const defaultOptions = { env: { API_URL: '' } }

export function createClient(options) {
  options = { ...defaultOptions, ...options }

  const result = createMap(routes)

  return walk(result, [
    {
      match: (key) => key.startsWith(':'),
      handler: ({ routes, key, modifiers }) => {
        return {
          ...routes,
          [key.slice(1)]: (value) => {
            return walk(routes[key], modifiers)
          },
        }
      },
    },
    {
      match: (key) => key === '_routes',
      handler: ({ routes, key }) => {
        return routes[key].reduce((acc, route) => {
          return {
            ...acc,
            [route.method]: (data) => {
              if (!route.validationSchema) {
                return axios[route.method](
                  options.env.API_URL + route.path,
                  data,
                )
              }
              const schema = validation.object().shape(route.validationSchema)
              return schema
                .validate(data)
                .then((validatedData) => {
                  return axios[route.method](
                    options.env.API_URL + route.path,
                    validatedData,
                  )
                })
                .catch(console.log)
            },
          }
        }, {})
      },
    },
  ])
}
