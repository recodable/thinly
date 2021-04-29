import express from 'express'
import bodyParser from 'body-parser'
// import routes from 'routes'

const app = express()

app.use(bodyParser.json())

// console.log(routes)

// Object.values(routes).forEach((route) => {
//   console.log(`GET ${route.path}`)
//   app.get(`/api${route.path}`, route.handler)
// })

export default app
