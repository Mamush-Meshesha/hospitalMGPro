import * as invoiceDal from '../dal/invoice.dal';

export const listInvoices = async () => {
  return await invoiceDal.getAllInvoices();
};

export const getInvoice = async (id: number) => {
  const invoice = await invoiceDal.getInvoiceById(id);
  if (!invoice) throw new Error('Invoice not found');
  return invoice;
};

export const addInvoice = async (data: any) => {
  if (!data.supplier_id || !data.po_id) throw new Error('Supplier and PO ID are required');
  return await invoiceDal.createInvoice(data);
};

export const editInvoice = async (id: number, data: any) => {
  return await invoiceDal.updateInvoice(id, data);
};

export const removeInvoice = async (id: number) => {
  return await invoiceDal.deleteInvoice(id);
};
