import { map, createMap, transform } from '../src/mapper'
import { BaseRoute } from '../src/types'

const routes: BaseRoute[] = [
  { path: '/posts/:id/comments', method: 'get' },
  { path: '/posts/:id/comments', method: 'post' },
  {
    path: '/posts/:id/comments/:commentId',
    method: 'get',
  },
]

const result = createMap(routes)

const client = transform(result)

test('map all routes into a API map', () => {
  // @ts-ignore
  expect(result.posts[':id'].comments._routes.length).toBe(2)
  // @ts-ignore
  expect(result.posts[':id'].comments[':commentId']._routes.length).toBe(1)
})

test('print map into client', () => {
  expect(typeof client.posts.id).toBe('function')

  expect(typeof client.posts.id().comments.commentId).toBe('function')

  expect(typeof client.posts.id().comments.get).toBe('function')

  expect(typeof client.posts.id().comments.post).toBe('function')

  expect(typeof client.posts.id().comments.commentId().get).toBe('function')
})
