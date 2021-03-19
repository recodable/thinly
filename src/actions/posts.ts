import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function findMany() {
  return await prisma.post.findMany()
}

export async function find(ctx) {
  const { id } = ctx.params
  return await prisma.post.findFirst({ where: { id: +id } })
}

export async function create({ request }) {
  return await prisma.post.create({
    data: {
      title: request.body.title,
      content: request.body.content,
    },
  })
}

export async function update({ params, body }) {
  return await prisma.post.update({
    where: { id: +params.id },
    data: { ...body },
  })
}

export async function del({ params }) {
  return await prisma.post.delete({ where: { id: +params.id } })
}
