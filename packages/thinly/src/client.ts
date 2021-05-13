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

  console.log({ result })

  return walk(result, [
    {
      match: (key) => key.startsWith(':'),
      handler: ({ routes, key, modifiers, depth, context }) => {
        console.log({ acc: routes, key, where: '":" handler' })

        const methodName = key.slice(1)

        return {
          ...routes,
          [methodName]: (value) => {
            return walk(routes[key], modifiers, depth + 1, {
              ...context,
              params: {
                ...(context.params || {}),
                [methodName]: value,
              },
            })
          },
        }
      },
    },
    {
      match: (key) => key === '_routes',
      handler: ({ routes, key, context }) => {
        console.log({ acc: routes, key, where: '"_routes" handler' })

        return routes[key].reduce((acc, route) => {
          if (context?.params) {
            route.path = Object.entries(context.params).reduce(
              (path, [key, value]) => {
                return path.replace(`:${key}`, value)
              },
              route.path,
            )
          }

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
        }, routes)
      },
    },
    {
      match: () => true,
      handler: ({ routes, key, modifiers, depth, context }) => {
        console.log({ acc: routes, key, where: 'default' })
        return {
          ...routes,
          [key]: walk(routes[key], modifiers, depth + 1, context),
        }
      },
    },
  ])
}
