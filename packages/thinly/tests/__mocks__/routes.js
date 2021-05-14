export default {
  postsGet: { path: '/posts', method: 'get' },
  postsPost: { path: '/posts', method: 'post' },
  postsPut: { path: '/posts', method: 'put' },
  postsPatch: { path: '/posts', method: 'patch' },
  postsDelete: { path: '/posts', method: 'delete' },

  postsIdCommentsGet: { path: '/posts/:id/comments', method: 'get' },
  postsIdCommentsPost: { path: '/posts/:id/comments', method: 'post' },

  postsIdCommentsCommentIdGet: {
    path: '/posts/:id/comments/:commentId',
    method: 'get',
  },
}
