import type { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import validation from '@thinly/validation'

const db = new PrismaClient()

export default {
  body: {
    username: validation.string().required(),
  },

  handler: async (req: Request, res: Response) => {
    const user = await db.user.findFirst({
      where: { username: req.body.username },
    })

    res.send(user)
  },
}
