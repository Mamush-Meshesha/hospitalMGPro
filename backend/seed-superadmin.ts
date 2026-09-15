import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const generateUuid = () => crypto.randomUUID();

async function run() {
  console.log("Starting superadmin user seeding...");
  try {
    const username = 'admin';
    const passwordPlain = 'Admin123';
    const role = 'Super Admin';

    // 1. Check if user exists
    const existing = await prisma.users.findFirst({
      where: { username }
    });

    if (existing) {
      console.log(`User '${username}' already exists. Updating password and role...`);
      const hashedPassword = await bcrypt.hash(passwordPlain, 10);
      
      await prisma.users.update({
        where: { user_id: existing.user_id },
        data: { password: hashedPassword, retired: false }
      });

      // Update role
      const existingRole = await prisma.user_role.findFirst({
        where: { user_id: existing.user_id }
      });

      if (existingRole) {
        if (existingRole.role !== role) {
           await prisma.user_role.deleteMany({
              where: { user_id: existing.user_id }
           });
           await prisma.user_role.create({
              data: { user_id: existing.user_id, role }
           });
        }
      } else {
        await prisma.user_role.create({
          data: { user_id: existing.user_id, role }
        });
      }
      
      console.log(`User '${username}' successfully updated with Super Admin role.`);
      return;
    }

    // Create new Super Admin User
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);
    const systemId = `USR-${Math.floor(Math.random() * 90000) + 10000}`;
    const creatorId = 1; // Default creator

    await prisma.$transaction(async (tx) => {
      // Get next max IDs manually
      const maxPerson = await tx.person.findFirst({ orderBy: { person_id: 'desc' } });
      const nextPersonId = (maxPerson?.person_id || 0) + 1;
      
      const maxUser = await tx.users.findFirst({ orderBy: { user_id: 'desc' } });
      const nextUserId = (maxUser?.user_id || 0) + 1;

      // Create Person
      const person = await tx.person.create({
        data: {
          person_id: nextPersonId,
          gender: 'O',
          birthdate: new Date(),
          dead: false,
          creator: creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid(),
          birthdate_estimated: true,
          deathdate_estimated: false,
        }
      });

      // Create PersonName
      await tx.person_name.create({
        data: {
          person_id: person.person_id,
          given_name: 'Super',
          family_name: 'Admin',
          preferred: true,
          creator: creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid()
        }
      });

      // Create User
      const user = await tx.users.create({
        data: {
          user_id: nextUserId,
          person_id: person.person_id,
          system_id: systemId,
          username: username,
          password: hashedPassword,
          creator: creatorId,
          date_created: new Date(),
          retired: false,
          uuid: generateUuid(),
          tenant_id: 1 // Assign to default hospital tenant
        }
      });

      // Assign Role
      await tx.user_role.create({
        data: {
          user_id: user.user_id,
          role: role
        }
      });
    });

    console.log(`Successfully created user '${username}' with role '${role}'.`);
  } catch (error) {
    console.error("Error seeding user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
