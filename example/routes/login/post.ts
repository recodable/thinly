export function validate(body) {
  console.log(body)
  return true
}

export const test = () => console.log('test')

export default (req, res) => {
  res.send('Login page')
}
