import { prisma } from '../db';

export const getAllInvoices = async () => {
  return await prisma.erp_invoice.findMany({
    include: { supplier: true, purchase_order: true, payments: true }
  });
};

export const getInvoiceById = async (invoiceId: number) => {
  return await prisma.erp_invoice.findUnique({
    where: { invoice_id: invoiceId },
    include: { supplier: true, purchase_order: true, payments: true }
  });
};

export const createInvoice = async (data: any) => {
  return await prisma.erp_invoice.create({ data });
};

export const updateInvoice = async (invoiceId: number, data: any) => {
  return await prisma.erp_invoice.update({
    where: { invoice_id: invoiceId },
    data
  });
};

export const deleteInvoice = async (invoiceId: number) => {
  return await prisma.erp_invoice.delete({
    where: { invoice_id: invoiceId }
  });
};
