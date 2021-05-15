import { symlink, writeFile } from 'fs/promises'
import config from './config'
import { join } from 'path'

export default async () => {
  const api = join(process.cwd(), 'api')

  await symlink(config.server.output, api)

  console.log(`Created symlink ${api} ~> ${config.server.output} ✔`)

  const vercel = join(process.cwd(), 'vercel.json')

  await writeFile(
    vercel,
    JSON.stringify({
      rewrites: [{ source: '/api/(.*)', destination: '/api' }],
    }),
  )

  console.log(`Created Vercel config file: ${vercel} ✔`)
}
