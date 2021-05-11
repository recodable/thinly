import axios from 'axios'
import * as validation from '@thinly/validation'

export function createMap(routes) {
  let result = {}

  Object.values(routes).forEach((route) => {
    const parts = route.path.split('/').filter((v) => v)
    result = map(parts, route, result)
  })

  return result
}

export function map([current, ...remaining], value, initialValue) {
  const currentValue = initialValue[current] || {}

  if (remaining.length === 0) {
    const currentRoutes = currentValue._routes || []
    return {
      ...initialValue,
      [current]: { ...currentValue, _routes: [...currentRoutes, value] },
    }
  }

  return {
    ...initialValue,
    [current]: map(remaining, value, currentValue),
  }
}

function walk(map, targetKey, fn) {
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

const defaultOptions = { env: { API_URL: '' } }

export function transform(initialMap, options = {}) {
  options = { ...options, ...defaultOptions }

  const map = { ...initialMap }

  return walk(map, '_routes', (routes) => {
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
                env.API_URL + route.path,
                validatedData,
              )
            })
            .catch(console.log)
        },
      }
    }, {})
  })
}
