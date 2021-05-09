// import type { Request, Response, NextFunction } from 'express'
export * from 'yup'

// export type PART = 'body' | 'params' | 'query'

// export function validate(shape, part: PART = 'body') {
//   return (req: Request, res: Response, next: NextFunction) => {
//     return validation
//       .object()
//       .shape(shape)
//       .validate(req[part])
//       .then((data) => {
//         return next(data)
//       })
//       .catch(({ path, type, errors }) => {
//         return res.status(422).send({ path, type, errors })
//       })
//   }
// }
