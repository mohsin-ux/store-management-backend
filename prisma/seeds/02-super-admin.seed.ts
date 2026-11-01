import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function seedSuperAdmin() {
  console.log('🌱 Seeding Super Admin...');

  const hashedPassword = await bcrypt.hash(
    process.env.SUPER_ADMIN_PASSWORD!,
    10,
  );

  const superAdmin = await prisma.user.upsert({
    where: { email: process.env.SUPER_ADMIN_EMAIL! },
    update: {
      name: 'Super Admin',
      password: hashedPassword,
      roleId: null,
      isSuperAdmin: true,
    },
    create: {
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL!,
      password: hashedPassword,
      roleId: null,
      storeId: null,
      isSuperAdmin: true,
    },
  });

  console.log(`✅ Super Admin created: ${superAdmin.email}`);
}

seedSuperAdmin()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
