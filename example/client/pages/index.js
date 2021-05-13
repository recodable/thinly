import { useEffect, useState } from 'react'
import client from '../client'

export default function Home() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  useEffect(() => {
    client.posts.id(1).comments.get()
  }, [])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        client.login.post(formData)
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
