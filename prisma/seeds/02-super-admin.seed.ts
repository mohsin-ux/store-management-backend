import 'dotenv/config';
import { PrismaClient, RoleName } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function seedSuperAdmin() {
  console.log('🌱 Seeding Super Admin...');

  // Get ADMIN role
  const adminRole = await prisma.role.findUnique({
    where: { name: RoleName.SUPER_ADMIN },
  });

  if (!adminRole) {
    throw new Error('❌ SUPER_ADMIN role not found. Run 01-roles.seed.ts first.');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD!, 10);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: process.env.SUPER_ADMIN_EMAIL! },
    update: {
      name: 'Super Admin',
      password: hashedPassword,
      roleId: adminRole.id,
      isSuperAdmin: true,
    },
    create: {
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL!,
      password: hashedPassword,
      roleId: adminRole.id,
      storeId: null,
      isOwner: false,
      isSuperAdmin: true,
    },
  });

  console.log(`✅ Super Admin created: ${superAdmin.email}`);
  console.log(`✅ Please change password after first login.`);
}

seedSuperAdmin()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
