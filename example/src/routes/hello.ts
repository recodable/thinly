import type { Request, Response } from 'express'

export function get(req: Request, res: Response) {
  res.end('Hello world!')
}
