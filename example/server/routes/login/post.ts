import * as validation from '@thinly/validation'
import { PrismaClient } from '@prisma/client'

export const validationSchema = {
  email: validation.string().email().required(),
  password: validation.string().required(),
}

export default (req) => {
  const prisma = new PrismaClient()
  return prisma.user.findFirst({ where: { email: req.body.email } })
}
