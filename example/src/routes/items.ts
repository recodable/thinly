import type { Request, Response } from 'express'

export function get(req: Request, res: Response) {
  const { slug } = req.params
  res.end(`Item: ${slug}`)
}

export function post(req: Request, res: Response) {
  const { slug } = req.body
  res.end(`Item: ${slug}`)
}
