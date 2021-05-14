import { createClient } from '../src/client'

const client = createClient({ env: { API_URL: '' } })

test('client map GET methods on simple path', () => {
  expect(typeof client.posts.get).toBe('function')
})

test('client map POST methods on simple path', () => {
  expect(typeof client.posts.post).toBe('function')
})

test('client map PUT methods on simple path', () => {
  expect(typeof client.posts.put).toBe('function')
})

test('client map PATCH methods on simple path', () => {
  expect(typeof client.posts.patch).toBe('function')
})

test('client map DELETE methods on simple path', () => {
  expect(typeof client.posts.delete).toBe('function')
})

test('client map to `id` method if there is a route parameter named: `id`', () => {
  expect(typeof client.posts.id).toBe('function')

  expect(Object.keys(client.posts.id())).toStrictEqual(['comments'])

  const keys = Object.keys(client.posts.id().comments)
  expect(keys.includes('get')).toBe(true)
  expect(keys.includes('post')).toBe(true)
})

test('print map into client', () => {
  expect(typeof client.posts.id).toBe('function')

  expect(typeof client.posts.id().comments.commentId).toBe('function')

  expect(typeof client.posts.id().comments.get).toBe('function')

  expect(typeof client.posts.id().comments.post).toBe('function')

  expect(typeof client.posts.id().comments.commentId().get).toBe('function')
})
