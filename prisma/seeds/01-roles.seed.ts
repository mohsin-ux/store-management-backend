import 'dotenv/config';
import { PrismaClient, RoleName } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function seedRoles() {
  console.log('🌱 Seeding roles...');

  const roles: { name: RoleName; description: string }[] = [
    {
      name: RoleName.ADMIN,
      description: 'Full access to everything in the store',
    },
    {
      name: RoleName.INVENTORY_MANAGER,
      description: 'Can manage products and stock',
    },
    {
      name: RoleName.SALESMAN,
      description: 'Can create sales only',
    },
  ];

  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleData,
    });
    console.log(`✅ Created role: ${role.name}`);
  }

  console.log('✅ Roles seeded successfully!');
}

seedRoles()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
