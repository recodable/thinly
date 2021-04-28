import type { Request, Response } from 'express'

// export default {
//   handler: (req: Request, res: Response) => {
//     res.end('Hello world!')
//   },
// }

export default (req: Request, res: Response) => {
  res.end('Hello world!')
}
