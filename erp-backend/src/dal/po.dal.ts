import { prisma } from '../db';

export const getAllPOs = async () => {
  return await prisma.erp_purchase_order.findMany({
    include: { supplier: true },
    orderBy: { created_at: 'desc' }
  });
};

export const getPOById = async (poId: number) => {
  return await prisma.erp_purchase_order.findUnique({
    where: { po_id: poId },
    include: {
      supplier: true,
      items: {
        include: { product: true }
      }
    }
  });
};

export const createPO = async (data: any) => {
  return await prisma.erp_purchase_order.create({
    data: {
      po_number: data.po_number,
      supplier_id: data.supplier_id,
      created_by: data.created_by,
      total_amount: data.total_amount,
      items: {
        create: data.items
      }
    },
    include: { items: true }
  });
};

export const updatePOStatus = async (poId: number, status: string, approvedBy?: number) => {
  return await prisma.erp_purchase_order.update({
    where: { po_id: poId },
    data: { status, approved_by: approvedBy }
  });
};

export const updatePO = async (poId: number, data: any) => {
  return await prisma.erp_purchase_order.update({
    where: { po_id: poId },
    data
  });
};

export const deletePO = async (poId: number) => {
  // First delete items to avoid foreign key constraints
  await prisma.erp_purchase_order_item.deleteMany({
    where: { po_id: poId }
  });
  return await prisma.erp_purchase_order.delete({
    where: { po_id: poId }
  });
};
