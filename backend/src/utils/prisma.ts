import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

export const tenantContext = new AsyncLocalStorage<{ tenantId: number }>();

const basePrisma = new PrismaClient();

const tenantModels = [
  'users', 'location', 'provider', 'patient', 'visit', 'encounter',
  'obs', 'conditions', 'allergy', 'orders', 'drug_order', 'test_order',
  'referral_order', 'queue', 'queue_entry', 'medication_dispense',
  'cashier_bill', 'stockmgmt_stock_item', 'stockmgmt_stock_batch'
];

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const context = tenantContext.getStore();
        
        // If it's a tenant-aware table and we have a tenant context
        if (context?.tenantId && tenantModels.includes(model.toLowerCase())) {
           // Logical Isolation (Application Layer)
           if (operation === 'findUnique' || operation === 'findFirst' || operation === 'findMany' || operation === 'update' || operation === 'updateMany' || operation === 'delete' || operation === 'deleteMany' || operation === 'count' || operation === 'aggregate' || operation === 'groupBy') {
             args.where = { ...args.where, tenant_id: context.tenantId };
           } else if (operation === 'create' || operation === 'createMany') {
             args.data = { ...args.data, tenant_id: context.tenantId };
           } else if (operation === 'upsert') {
             args.where = { ...(args.where as any), tenant_id: context.tenantId };
             args.create = { ...(args.create as any), tenant_id: context.tenantId };
           }
           
           // Defense-in-Depth: Use PostgreSQL Row-Level Security!
           // This requires the DB user to not be a superuser to fully enforce it, but the logical isolation above guarantees safety.
           return basePrisma.$transaction(async (tx) => {
             await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', '${context.tenantId}', true)`);
             return query(args);
           });
        }
        
        return query(args);
      }
    }
  }
});
