import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

export async function post(req, res) {
  const count = await db.user.count()
  res.send({ count })
}
