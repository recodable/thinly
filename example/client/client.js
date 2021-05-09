import { createClient } from '@thinly/client'

const client = createClient({
  env: { API_URL: 'http://localhost:3000/api' },
})

export default client
