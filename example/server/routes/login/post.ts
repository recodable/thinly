import validation from '@thinly/validation'

// export function validationSchema(body) {
//   return body.password === 'password'
// }
export const validationSchema = {
  username: validation.string().min(3).required(),
  password: validation.string().required(),
}

export default (req) => {
  // res.send('Login page')
  return 'Login page'
}
