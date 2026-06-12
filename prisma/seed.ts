import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default roles
  const roles = [
    { name: 'Tentor Matematika', salary: 75000, defaultBonus: 0, defaultAllowance: 0 },
    { name: 'Tentor IPA', salary: 75000, defaultBonus: 0, defaultAllowance: 0 },
    { name: 'Tentor B. Inggris', salary: 75000, defaultBonus: 0, defaultAllowance: 0 },
    { name: 'Tentor B. Indonesia', salary: 75000, defaultBonus: 0, defaultAllowance: 0 },
    { name: 'Admin', salary: 50000, defaultBonus: 0, defaultAllowance: 0 },
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role
    })
  }

  // Create default admin user
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin123',
      name: 'Administrator',
      role: 'superadmin'
    }
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
