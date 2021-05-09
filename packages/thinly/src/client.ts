import axios from 'axios'
import * as validation from '@thinly/validation'

// @ts-ignore
import routes from 'routes'

export function createClient({ env }) {
  let client = {}

  Object.entries(routes).forEach(([name, route]) => {
    client[name] = (data) => {
      if (!route.validationSchema) {
        return axios[route.method](env.API_URL + route.path, data)
      }

      const schema = validation.object().shape(route.validationSchema)

      return schema
        .validate(data)
        .then((validatedData) => {
          return axios[route.method](env.API_URL + route.path, validatedData)
        })
        .catch(console.log)
    }
  })

  return client
}
