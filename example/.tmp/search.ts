import validation from '@thinly/validation'

export const method = 'GET'

export const params = {
  q: validation.string(),
}

export default (req, res) => {}
