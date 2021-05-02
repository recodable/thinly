import axios from 'axios'

// @ts-ignore
import routes from 'routes'

export function createClient({ env }) {
  let client = {}

  Object.entries(routes).forEach(([name, route]) => {
    client[name] = (data) => {
      if (!route.validate || route.validate(data)) {
        return axios[route.method](env.API_URL + route.path, data)
      }

      console.log('failed')
    }
  })

  return client
}
