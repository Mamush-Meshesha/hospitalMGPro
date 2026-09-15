import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const generateUuid = () => crypto.randomUUID();

async function run() {
  console.log("Starting role seeding...");
  try {
    // 1. Fix 'Clark' typo if it exists
    const clarkRole = await prisma.role.findUnique({ where: { role: 'Clark' } });
    if (clarkRole) {
      console.log("Found 'Clark' role. Renaming to 'Clerk'...");
      
      // Wait, Prisma doesn't let you easily update a primary key if `role` is the PK, or is `role` the PK? 
      // Let's check schema via try/catch. Usually if role is the PK we have to create new, re-assign, and delete.
      
      const clerkRole = await prisma.role.findUnique({ where: { role: 'Clerk' } });
      if (!clerkRole) {
         await prisma.role.create({
            data: {
               role: 'Clerk',
               description: clarkRole.description || 'Front Desk & Patient Intake',
               uuid: generateUuid()
            }
         });
         
         // Reassign users from Clark to Clerk
         const userRoles = await prisma.user_role.findMany({ where: { role: 'Clark' } });
         for (const ur of userRoles) {
            await prisma.user_role.update({
               where: { user_id_role: { user_id: ur.user_id, role: 'Clark' } },
               data: { role: 'Clerk' }
            });
         }
         
         // Delete Clark
         await prisma.role.delete({ where: { role: 'Clark' } });
         console.log("Successfully renamed Clark to Clerk and reassigned users.");
      }
    }

    // 2. Add Missing Roles
    const missingRoles = [
      { role: 'Anonymous', description: 'Privileges for non-authenticated users.' },
      { role: 'Authenticated', description: 'Privileges gained once authentication has been established.' },
      { role: 'System Developer', description: 'Developers of the OpenMRS. Have additional access to change fundamental structure of the database model.' },
      { role: 'Admin', description: 'System Administrator with standard configuration access.' },
      { role: 'Super Admin', description: 'Super Administrator with master access.' },
      { role: 'System Administrator', description: 'Standard System Admin.' },
      { role: 'Application Administrator', description: 'Application level configuration.' },
      { role: 'Doctor', description: 'Clinical doctor.' },
      { role: 'Senior Doctor', description: 'Senior Clinical physician.' },
      { role: 'Physician', description: 'Clinical physician.' },
      { role: 'Nurse', description: 'Clinical Nurse.' },
      { role: 'Head Nurse', description: 'Head Clinical Nurse.' },
      { role: 'Pharmacist', description: 'Clinical Pharmacist.' },
      { role: 'Pharmacy Assistant', description: 'Assists Pharmacist.' },
      { role: 'Pharmacy Admin', description: 'Oversees pharmacy and inventory operations.' },
      { role: 'Clerk', description: 'Front desk staff.' },
      { role: 'Receptionist', description: 'Front desk staff.' },
      { role: 'Lab Technician', description: 'Laboratory staff with access to lab modules.' },
      { role: 'Storekeeper', description: 'Manages physical warehouse stock and receiving.' },
      { role: 'Procurement Officer', description: 'Handles supplier relations and purchase orders.' }
    ];

    for (const mr of missingRoles) {
      const existing = await prisma.role.findUnique({ where: { role: mr.role } });
      if (!existing) {
        await prisma.role.create({
          data: {
            role: mr.role,
            description: mr.description,
            uuid: generateUuid()
          }
        });
        console.log(`Created missing role: ${mr.role}`);
      } else {
        console.log(`Role ${mr.role} already exists.`);
      }
    }

    console.log("Role seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding roles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
