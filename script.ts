import { prisma } from './lib/prisma.js';

async function main() {
  const admin = await prisma.employee.findFirst({
    where: { username: 'sysadmin' },
    include: { designation: true }
  });

  if (admin) {
    console.log('Successfully connected! Found Admin:', admin.email);
  } else {
    console.log('Connection successful, but no admin found. Did you run the seed?');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());