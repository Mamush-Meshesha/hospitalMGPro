import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminRole() {
  const adminUser = await prisma.users.findFirst({
    where: { username: 'admin' },
    include: {
      reverse_user_role_user_role_to_users: true
    }
  });
  
  console.log(JSON.stringify(adminUser, null, 2));
  
  await prisma.$disconnect();
}

checkAdminRole();
