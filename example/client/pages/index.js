import { useEffect, useState } from 'react'
import client from '../client'

export default function Home() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  useEffect(() => {
    client.posts.id(1).comments.get().then(console.log)
    // console.log({ client })
    // console.log({ test: client.posts.id(1).comments.post() })
    // setTimeout(() => {
    //   console.log({ test: client.posts.id(1).comments.get() })
    // }, 2000)
  }, [])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        client.login.post({ body: formData }).then(console.log)
      }}
    >
      <input
        type="text"
        name="email"
        value={formData.email}
        onChange={(e) =>
          setFormData({ ...formData, [e.target.name]: e.target.value })
        }
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={(e) =>
          setFormData({ ...formData, [e.target.name]: e.target.value })
        }
      />

      <button type="submit">Submit</button>
    </form>
  )
}
