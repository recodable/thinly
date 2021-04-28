require('dotenv').config()

import express from 'express'
import bodyParser from 'body-parser'

const app = express()

app.use(bodyParser.json())

// Object.values(routes).forEach((route) => {
//   console.log(`GET ${route.path}`)
//   app.get(`/api${route.path}`, route.handler)
// })

export default app
