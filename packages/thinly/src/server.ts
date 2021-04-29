import express from 'express'
import bodyParser from 'body-parser'
import routes from 'routes'

const app = express()

app.use(bodyParser.json())

Object.values(routes).map((route) => {
  app.get('/api' + route.path, route.handler)
})

export default app
