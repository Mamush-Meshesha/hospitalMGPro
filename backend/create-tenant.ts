import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const generateUuid = () => crypto.randomUUID();

async function run() {
  const tenantName = process.argv[2];
  const adminUsername = process.argv[3];
  const adminPassword = process.argv[4];

  if (!tenantName || !adminUsername || !adminPassword) {
    console.error("Usage: npx ts-node create-tenant.ts <tenant_name> <admin_username> <admin_password>");
    process.exit(1);
  }

  console.log(`Creating Tenant: ${tenantName}...`);
  try {
    const tenant = await prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const newTenant = await tx.tenant.create({
        data: {
          name: tenantName,
          domain: `${tenantName.toLowerCase().replace(/\s+/g, '-')}.local`,
        }
      });

      // 2. Create an Admin user for this tenant
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const systemId = `USR-${Math.floor(Math.random() * 90000) + 10000}`;
      
      const maxPerson = await tx.person.findFirst({ orderBy: { person_id: 'desc' } });
      const nextPersonId = (maxPerson?.person_id || 0) + 1;
      
      const maxUser = await tx.users.findFirst({ orderBy: { user_id: 'desc' } });
      const nextUserId = (maxUser?.user_id || 0) + 1;

      const person = await tx.person.create({
        data: {
          person_id: nextPersonId,
          gender: 'O',
          birthdate: new Date(),
          dead: false,
          creator: 1,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid(),
          birthdate_estimated: true,
          deathdate_estimated: false,
        }
      });

      await tx.person_name.create({
        data: {
          person_id: person.person_id,
          given_name: 'Admin',
          family_name: tenantName,
          preferred: true,
          creator: 1,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid()
        }
      });

      const user = await tx.users.create({
        data: {
          user_id: nextUserId,
          person_id: person.person_id,
          system_id: systemId,
          username: adminUsername,
          password: hashedPassword,
          creator: 1,
          date_created: new Date(),
          retired: false,
          uuid: generateUuid(),
          tenant_id: newTenant.tenant_id // Bind admin to this tenant
        }
      });

      await tx.user_role.create({
        data: {
          user_id: user.user_id,
          role: 'Admin'
        }
      });

      return newTenant;
    });

    console.log(`Successfully created tenant '${tenantName}' with ID: ${tenant.tenant_id}`);
    console.log(`Tenant Admin user '${adminUsername}' created successfully.`);
  } catch (error) {
    console.error("Error creating tenant:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
