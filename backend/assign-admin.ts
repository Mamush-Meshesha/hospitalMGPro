import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignAdminRole() {
  try {
    const adminUser = await prisma.users.findFirst({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      console.log('Admin user not found!');
      return;
    }

    const targetRole = 'Super Admin';
    
    // Check if mapping already exists
    const existing = await prisma.user_role.findFirst({
      where: {
        user_id: adminUser.user_id,
        role: targetRole
      }
    });

    if (!existing) {
      await prisma.user_role.create({
        data: {
          user_id: adminUser.user_id,
          role: targetRole
        }
      });
      console.log(`Successfully assigned ${targetRole} to admin user!`);
    } else {
      console.log(`Admin user already has ${targetRole} role.`);
    }

  } catch (err) {
    console.error('Error assigning role:', err);
  } finally {
    await prisma.$disconnect();
  }
}

assignAdminRole();
