import { createMap } from '../src/mapper'
import { BaseRoute } from '../src/types'

const routes: BaseRoute[] = [
  { path: '/posts/:id/comments', method: 'get' },
  { path: '/posts/:id/comments', method: 'post' },
  {
    path: '/posts/:id/comments/:commentId',
    method: 'get',
  },
]

const result: any = createMap(routes)

test('map all routes into a API map', () => {
  expect(result.posts[':id'].comments._routes.length).toBe(2)
  expect(result.posts[':id'].comments[':commentId']._routes.length).toBe(1)
})
