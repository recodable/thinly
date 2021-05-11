import { createMap } from './mapper'
import axios from 'axios'
import * as validation from '@thinly/validation'

// @ts-ignore
import routes from 'routes'

const defaultOptions = { env: { API_URL: '' } }

export function walk(map, targetKey, fn) {
  return Object.keys(map).reduce((acc, key) => {
    if (key.startsWith(':')) {
      return {
        ...acc,
        [key.slice(1)]: (value) => {
          return walk(acc[key], targetKey, fn)
        },
      }
    }

    if (key === targetKey) {
      return { ...acc, ...fn(map[key]) }
    }

    return { ...acc, [key]: walk(acc[key], targetKey, fn) }
  }, map)
}

export function createClient(options) {
  options = { ...defaultOptions, ...options }

  const result = createMap(routes)

  return walk(result, '_routes', (routes) => {
    return routes.reduce((acc, route) => {
      return {
        ...acc,
        [route.method]: (data) => {
          if (!route.validationSchema) {
            return axios[route.method](options.env.API_URL + route.path, data)
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
  })
}
