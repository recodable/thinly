import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class Posts {
  async findMany() {
    return await prisma.post.findMany()
  }

  async find(ctx) {
    const { id } = ctx.params
    return await prisma.post.findFirst({ where: { id: +id } })
  }

  async create({ request }) {
    return await prisma.post.create({
      data: {
        title: request.body.title,
        content: request.body.content,
      },
    })
  }

  async update({ params, body }) {
    return await prisma.post.update({
      where: { id: +params.id },
      data: { ...body },
    })
  }

  async del({ params }) {
    return await prisma.post.delete({ where: { id: +params.id } })
  }
}
