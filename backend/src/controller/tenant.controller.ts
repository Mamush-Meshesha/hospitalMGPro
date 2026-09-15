import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { name, domain, adminUsername, adminPassword, adminFirstName, adminLastName } = req.body;
    
    if (!name || !adminUsername || !adminPassword) {
      return res.status(400).json({ error: 'Tenant name, adminUsername, and adminPassword are required.' });
    }

    const tenant = await prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const newTenant = await tx.tenant.create({
        data: {
          name,
          domain: domain || null,
        }
      });

      // 1.5 Add Default Subscriptions
      const defaultModules = ['REGISTRATION', 'OUTPATIENT', 'INPATIENT', 'PHARMACY', 'LAB_RADIOLOGY', 'BILLING', 'INVENTORY', 'FINANCING', 'RECORDS_REPORTS'];
      for (const module of defaultModules) {
        await tx.tenant_subscription.create({
          data: {
            tenant_id: newTenant.tenant_id,
            module: module,
            active: true
          }
        });
      }

      // 2. Create an Admin user for this tenant
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const generateUuid = () => crypto.randomUUID();
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
          given_name: adminFirstName || 'Admin',
          family_name: adminLastName || 'User',
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

    res.status(201).json(tenant);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { tenant_id: 'asc' }
    });
    res.json(tenants);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt(req.params.id);
    const subscriptions = await prisma.tenant_subscription.findMany({
      where: { tenant_id: tenantId },
    });
    // Return array of string modules for easy client ingestion
    res.json(subscriptions.map(s => s.module));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addSubscription = async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt(req.params.id);
    const { moduleId } = req.body; // Actually represents the module string
    const sub = await prisma.tenant_subscription.upsert({
      where: {
        tenant_id_module: {
          tenant_id: tenantId,
          module: moduleId
        }
      },
      update: { active: true },
      create: {
        tenant_id: tenantId,
        module: moduleId,
        active: true
      }
    });
    res.json(sub);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const removeSubscription = async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt(req.params.id);
    const { moduleId } = req.params;
    await prisma.tenant_subscription.delete({
      where: {
        tenant_id_module: {
          tenant_id: tenantId,
          module: moduleId
        }
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.status(500).json({ error: err.message });
  }
};
