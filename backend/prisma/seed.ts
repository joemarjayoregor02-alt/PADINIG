import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminUsername = 'admin';
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      password: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
      updatedAt: new Date(),
    },
    create: {
      id: crypto.randomUUID(),
      username: adminUsername,
      email: 'admin@padinig.local',
      password: adminPasswordHash,
      name: 'Admin',
      role: 'ADMIN',
      isActive: true,
      updatedAt: new Date(),
    },
  });
  void admin;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

