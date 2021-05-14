// @ts-ignore
import routes from 'routes'
import { createMap } from './mapper'
import axios from 'axios'
import * as validation from '@thinly/validation'
import { walk } from './walker'

const defaultOptions = { env: { API_URL: '' } }

type Input = {
  body?: object
}

export function createClient(options) {
  options = { ...defaultOptions, ...options }

  const result = createMap(routes)

  return walk(result, [
    {
      match: (key) => key.startsWith(':'),
      handler: ({ routes, key, modifiers, depth, context }) => {
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
            [route.method]: async (input: Input = {}) => {
              if (route.validationSchema) {
                const schema = validation.object().shape(route.validationSchema)

                await schema.validate(input.body)
              }

              return fetch(options.env.API_URL + route.path, {
                method: route.method,
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                },
                ...(input.body ? { body: JSON.stringify(input.body) } : {}),
              })
                .then((res) => res.text())
                .then((text) => (text.length ? JSON.parse(text) : null))
            },
          }
        }, routes)
      },
    },
    {
      match: () => true,
      handler: ({ routes, key, modifiers, depth, context }) => {
        return {
          ...routes,
          [key]: walk(routes[key], modifiers, depth + 1, context),
        }
      },
    },
  ])
}
