import { prisma } from '../src/db/prisma.ts'
import { auth } from '../src/lib/auth.ts'

async function main() {
  const email = process.env.SEED_EMAIL ?? 'admin@quevic.id'
  const password = process.env.SEED_PASSWORD ?? 'Quevic123!'
  const name = process.env.SEED_NAME ?? 'Quevic Admin'

  const existing = await prisma.user.findFirst({ where: { email } })
  if (existing) {
    console.log(`Seed user already exists: ${email}`)
    return
  }

  const result = await auth.api.signUpEmail({
    body: { email, password, name },
  })

  console.log(`Seed user created: ${result.user.email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
