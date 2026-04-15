import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Remove all non-user-generated/sample/test data.
  // Keep only the default admin account (username: admin).
  const admin = await prisma.user.findUnique({ where: { username: 'admin' } });

  // Wipe announcements/notifications first (FKs)
  await prisma.notification.deleteMany({});
  await prisma.announcement.deleteMany({});

  // Remove all users except admin
  await prisma.user.deleteMany({ where: { username: { not: 'admin' } } });

  // Ensure admin exists (if not, seed will create it)
  if (!admin) {
    // no-op; seed handles admin creation
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

