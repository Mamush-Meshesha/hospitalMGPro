import { erp_supplier } from '@prisma/client';
import { prisma } from '../db';

export const getAllSuppliers = async () => {
  return await prisma.erp_supplier.findMany({
    orderBy: { name: 'asc' }
  });
};

export const getSupplierById = async (supplierId: number) => {
  return await prisma.erp_supplier.findUnique({
    where: { supplier_id: supplierId },
    include: {
      purchase_orders: { orderBy: { created_at: 'desc' }, take: 5 },
      invoices: { orderBy: { created_at: 'desc' }, take: 5 }
    }
  });
};

export const createSupplier = async (data: Omit<erp_supplier, 'supplier_id' | 'created_at'>) => {
  return await prisma.erp_supplier.create({ data });
};

export const updateSupplier = async (supplierId: number, data: Partial<erp_supplier>) => {
  return await prisma.erp_supplier.update({
    where: { supplier_id: supplierId },
    data
  });
};

export const deleteSupplier = async (supplierId: number) => {
  return await prisma.erp_supplier.delete({
    where: { supplier_id: supplierId }
  });
};
