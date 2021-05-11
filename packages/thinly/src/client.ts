import { createMap, transform } from './mapper'

// @ts-ignore
import routes from 'routes'

// function createCurrent([current, ...remaining], route, handler) {
//   if (current.startsWith(':')) {
//     current = current.slice(1)

//     if (remaining.length === 0) {
//       return {
//         [current]: () => {
//           return {
//             [route.method]: handler,
//           }
//         },
//       }
//     }

//     return {
//       [current]: () => {
//         return createCurrent(remaining, route, handler)
//       },
//     }
//   }

//   if (remaining.length === 0) {
//     return {
//       [current]: {
//         [route.method]: handler,
//       },
//     }
//   }

//   return {
//     [current]: createCurrent(remaining, route, handler),
//   }
// }

export function createClient({ env }) {
  // let client = {}
  // Object.entries(routes).forEach(([name, route]) => {
  //   const [, ...parts] = route.path.split('/')
  //   client = merge(
  //     client,
  //     createCurrent(parts, route, (data) => {
  //       if (!route.validationSchema) {
  //         return axios[route.method](env.API_URL + route.path, data)
  //       }
  //       const schema = validation.object().shape(route.validationSchema)
  //       return schema
  //         .validate(data)
  //         .then((validatedData) => {
  //           return axios[route.method](env.API_URL + route.path, validatedData)
  //         })
  //         .catch(console.log)
  //     }),
  //   )
  // })
  // return client
  const result = createMap(routes)

  return transform(result, { env })
}
