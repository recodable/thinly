import validation from '@thinly/validation'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const validationSchema = {
  email: validation.string().email().required(),
  password: validation.string().required(),
}

export default async (req) => {
  return await prisma.user.findFirst({ where: { email: req.body.email } })
}
